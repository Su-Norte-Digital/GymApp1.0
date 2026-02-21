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
    const { user, profile, loading } = useAuth()

    if (loading) {
        return (
            <div className="private-route-loader">
                <Spinner size="lg" />
                <p>Cargando...</p>
            </div>
        )
    }

    if (!user) return <Navigate to={redirectTo} replace />

    if (requiredRole && profile?.role !== requiredRole) {
        // Redirige al dashboard correcto según su rol
        const destino = profile?.role === 'admin' ? '/admin' : '/dashboard'
        return <Navigate to={destino} replace />
    }

    return children
}

export default PrivateRoute
