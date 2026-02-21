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

    // Cargar perfil del usuario autenticado
    async function loadProfile(authUser) {
        if (!authUser) {
            setProfile(null)
            return
        }
        try {
            const profileData = await getProfile(authUser.id)
            setProfile(profileData)
        } catch {
            setProfile(null)
        }
    }

    useEffect(() => {
        // Sesión inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            const authUser = session?.user ?? null
            setUser(authUser)
            loadProfile(authUser).finally(() => setLoading(false))
        })

        // Listener de cambios de sesión
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                const authUser = session?.user ?? null
                setUser(authUser)
                await loadProfile(authUser)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    async function login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    }

    async function signup({ email, password, nombre, dni, fechaVencimiento }) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        // Crear perfil en la tabla profiles
        await createProfile({
            id: data.user.id,
            nombre,
            dni,
            fecha_vencimiento: fechaVencimiento,
            role: 'socio',
            status: true,
        })

        return data
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
        isAdmin: profile?.role === 'admin',
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
