import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getProfile, createProfile } from '../repositories/profilesRepo'

const AuthContext = createContext(null)

/**
 * Helper para timeouts en llamadas de Auth
 */
const authTimeout = (promise, ms = 10000) => Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('AUTH_TIMEOUT')), ms))
]);

/**
 * AuthProvider - Provee estado de autenticación global
 * Expone: user, profile, loading, login, signup, loginWithMagicLink, logout
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [authError, setAuthError] = useState(null)

    // Cargar perfil del usuario autenticado
    async function loadProfile(authUser, isRefresh = false) {
        if (!authUser) {
            console.log('[Auth] No hay usuario, limpiando perfil')
            setProfile(null)
            return
        }

        console.log(`[Auth] ${isRefresh ? 'Refrescando' : 'Cargando'} perfil para ID:`, authUser.id)

        try {
            const profileData = await getProfile(authUser.id)
            console.log('[Auth] Perfil cargado exitosamente:', profileData)
            setProfile(profileData)
            setAuthError(null)
        } catch (err) {
            console.error('[Auth] Error al cargar perfil de Supabase:', err)

            // Si es un refresco y falla por red/timeout, NO borramos el perfil anterior
            // para evitar que la UI se rompa si ya teníamos datos.
            if (!isRefresh || (err.message !== 'TIMEOUT_EXCEEDED' && !err.message?.includes('fetch'))) {
                setProfile(null)
            }

            setAuthError(err.message || 'Error al cargar perfil')
        }
    }

    useEffect(() => {
        let mounted = true

        async function initializeAuth() {
            setLoading(true)
            console.log('[Auth] Inicializando sesión...')

            // Válvula de seguridad global: si nada responde en 15s, forzamos el fin de la carga
            const safetyValve = setTimeout(() => {
                if (mounted) {
                    console.warn('[Auth] Válvula de seguridad activada (15s). Forzando fin de carga.')
                    setLoading(false)
                }
            }, 15000)

            try {
                // Envolvemos getSession en un timeout
                const { data: { session }, error } = await authTimeout(supabase.auth.getSession())
                if (error) throw error

                const authUser = session?.user ?? null
                console.log('[Auth] Sesión inicial obtenida:', authUser ? authUser.email : 'Nula')

                if (mounted) {
                    setUser(authUser)
                    if (authUser) {
                        await loadProfile(authUser)
                    }
                }
            } catch (err) {
                console.error('[Auth] Error al obtener sesión inicial:', err)
                if (err.message === 'AUTH_TIMEOUT') {
                    console.error('[Auth] Timeout en getSession. Es posible que la red esté caída o la conexión colgada.')
                }
            } finally {
                clearTimeout(safetyValve)
                if (mounted) {
                    setLoading(false)
                    console.log('[Auth] Carga inicial finalizada')
                }
            }
        }

        initializeAuth()

        // Listener de cambios de sesión
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                console.log('[Auth] Cambio de estado detectado:', _event)
                const authUser = session?.user ?? null

                try {
                    setUser(authUser)
                    if (authUser) {
                        await loadProfile(authUser, true) // Marcamos como refresh
                    } else {
                        setProfile(null)
                    }
                } catch (err) {
                    console.error('[Auth] Error al procesar cambio de sesión:', err)
                } finally {
                    setLoading(false)
                }
            }
        )

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    async function login(email, password) {
        setLoading(true)
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
            setUser(data.user) // Actualizamos el estado local inmediatamente
            return data
        } catch (err) {
            setLoading(false)
            throw err
        }
    }

    async function signup({ email, password, nombre, dni, fechaVencimiento }) {
        console.log('[Auth] Intentando registro para:', email)
        setLoading(true)
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nombre,
                        dni,
                        fecha_vencimiento: fechaVencimiento,
                        rol: 'socio'
                    }
                }
            })
            if (error) {
                console.error('[Auth] Error en signUp:', error)
                throw error
            }
            console.log('[Auth] Registro exitoso:', data)
            return data
        } catch (err) {
            console.error('[Auth] Capturado en catch signup:', err)
            setLoading(false)
            throw err
        }
    }

    async function loginWithMagicLink(email) {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin }
        })
        if (error) throw error
    }

    async function logout() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setUser(null)
        setProfile(null)
    }

    const value = {
        user,
        profile,
        loading,
        authError,
        role: profile?.rol || user?.user_metadata?.rol || (user ? 'socio' : null),
        isAdmin: (profile?.rol || user?.user_metadata?.rol) === 'admin',
        login,
        signup,
        loginWithMagicLink,
        logout,
        refreshProfile: async () => {
            console.log('[Auth] Refresh manual solicitado')
            setLoading(true)
            try {
                // Envolvemos getUser en un timeout
                const { data: { user: currentUser } } = await authTimeout(supabase.auth.getUser(), 8000)
                if (currentUser) {
                    setUser(currentUser)
                    await loadProfile(currentUser, true)
                }
            } catch (err) {
                console.error('[Auth] Error en refresh manual:', err)
                setAuthError(err.message === 'AUTH_TIMEOUT' ? 'Tiempo de espera de autenticación agotado' : err.message)
            } finally {
                setLoading(false)
            }
        },
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
    return context
}
