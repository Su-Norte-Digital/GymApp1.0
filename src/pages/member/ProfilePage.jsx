import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { updateProfile } from '../../repositories/profilesRepo'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { calcularEstadoCuota } from '../../repositories/profilesRepo'
import './ProfilePage.css'

function ProfilePage() {
    const { profile, user, logout, refreshProfile } = useAuth()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    if (!profile) return null

    const { estado, diasRestantes, variant } = calcularEstadoCuota(profile.fecha_vencimiento)

    async function handleLogout() {
        setLoading(true)
        try { await logout() } catch (e) { console.error(e) } finally { setLoading(false) }
    }

    return (
        <div className="profile-page animate-fade-in">
            <h1 className="profile-page__title">Mi Perfil</h1>

            {/* Card de perfil */}
            <Card variant="glass" className="profile-hero">
                <div className="profile-hero__avatar">
                    {profile.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="profile-hero__info">
                    <h2>{profile.nombre}</h2>
                    <p>{user.email}</p>
                    <Badge variant={variant} dot>
                        {estado === 'vencido' ? 'Cuota Vencida' : estado === 'por_vencer' ? 'Por Vencer' : 'Al Día'}
                    </Badge>
                </div>
            </Card>

            {/* Detalles */}
            <Card variant="default" className="profile-details">
                <h3 className="profile-details__title">Datos de la cuenta</h3>
                <div className="profile-details__list">
                    <div className="profile-details__item">
                        <span className="profile-details__label">Nombre completo</span>
                        <span className="profile-details__value">{profile.nombre}</span>
                    </div>
                    <div className="profile-details__item">
                        <span className="profile-details__label">DNI</span>
                        <span className="profile-details__value">{profile.dni}</span>
                    </div>
                    <div className="profile-details__item">
                        <span className="profile-details__label">Email</span>
                        <span className="profile-details__value">{user.email}</span>
                    </div>
                    <div className="profile-details__item">
                        <span className="profile-details__label">Vencimiento</span>
                        <span className="profile-details__value">
                            {new Date(profile.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR', {
                                day: '2-digit', month: 'long', year: 'numeric'
                            })}
                        </span>
                    </div>
                    <div className="profile-details__item">
                        <span className="profile-details__label">Rol</span>
                        <Badge variant="neutral" size="sm">{profile.role}</Badge>
                    </div>
                </div>
            </Card>

            {success && (
                <div className="profile-msg profile-msg--success">{success}</div>
            )}
            {error && (
                <div className="profile-msg profile-msg--error">{error}</div>
            )}

            {/* Cerrar sesión */}
            <Button variant="danger" fullWidth loading={loading} onClick={handleLogout}>
                Cerrar sesión
            </Button>
        </div>
    )
}

export default ProfilePage
