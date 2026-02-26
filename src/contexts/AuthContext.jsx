import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getProfile, createProfile } from '../repositories/profilesRepo'

const AuthContext = createContext(null)

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
    async function loadProfile(authUser) {
        console.log('[Auth] Cargando perfil para ID:', authUser.id)
        if (!authUser) {
            console.log('[Auth] No hay usuario, limpiando perfil')
            setProfile(null)
            return
        }
        try {
            setAuthError(null)
            const profileData = await getProfile(authUser.id)
            console.log('[Auth] Perfil cargado exitosamente:', profileData)
            setProfile(profileData)
        } catch (err) {
            console.error('[Auth] Error al cargar perfil de Supabase:', err)
            setAuthError(err.message || 'Error al cargar perfil')
            setProfile(null)
        }
    }

    useEffect(() => {
        let mounted = true

        async function initializeAuth() {
            setLoading(true)
            console.log('[Auth] Inicializando sesión...')
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
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
            } finally {
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
                        await loadProfile(authUser)
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
        refreshProfile: () => loadProfile(user),
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
