import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Spinner from '../ui/Spinner'
import './PrivateRoute.css'

/**
 * PrivateRoute - Protege rutas según autenticación y rol
 * Props:
 *   requiredRole: 'admin' | 'socio' | undefined (cualquier autenticado)
 *   redirectTo: path al que redirigir si no tiene acceso
 */
function PrivateRoute({ children, requiredRole, redirectTo = '/login' }) {
    const { user, profile, loading, authError, role } = useAuth()

    console.log('[PrivateRoute] Check:', {
        path: window.location.pathname,
        user: user ? 'Presente' : 'Nulo',
        role,
        loading,
        authError,
        requiredRole
    })

    if (loading) {
        return (
            <div className="private-route-loader">
                <Spinner size="lg" />
                <p>Cargando sesión...</p>
            </div>
        )
    }

    if (!user) {
        console.log('[PrivateRoute] No hay usuario, redirigiendo a login')
        return <Navigate to={redirectTo} replace />
    }

    // Si hay un error de carga de perfil (ej. timeout), pero tenemos el rol de metadata, permitimos continuar
    if (authError && !role) {
        return (
            <div className="private-route-error">
                <h2>Error de Acceso</h2>
                <p>No pudimos verificar tu identidad: <strong>{authError}</strong></p>
                <button onClick={() => window.location.reload()}>Reintentar</button>
            </div>
        )
    }

    if (requiredRole && role !== requiredRole) {
        // Redirigimos según el rol detectado
        const destino = role === 'admin' ? '/admin' : '/dashboard'

        if (window.location.pathname === destino || window.location.pathname.startsWith(destino + '/')) {
            console.warn('[PrivateRoute] El rol no coincide pero ya estamos en el destino.')
            return children
        }

        console.log(`[PrivateRoute] Acceso denegado a ${window.location.pathname}. Redirigiendo a ${destino} (Rol actual: ${role})`)
        return <Navigate to={destino} replace />
    }

    return children
}

export default PrivateRoute
