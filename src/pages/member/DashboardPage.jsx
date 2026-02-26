import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getNotificationsForUser } from '../../repositories/notificationsRepo'
import { calcularEstadoCuota } from '../../repositories/profilesRepo'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import './DashboardPage.css'

function DashboardPage() {
    const { profile, loading, authError, refreshProfile } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [loadingNotifs, setLoadingNotifs] = useState(true)

    useEffect(() => {
        if (!profile) return
        setLoadingNotifs(true)
        getNotificationsForUser(profile.id)
            .then(setNotifications)
            .catch(console.error)
            .finally(() => setLoadingNotifs(false))
    }, [profile])

    // Si está cargando inicialmente
    if (loading && !profile) {
        return (
            <div className="dashboard-loading">
                <Spinner size="lg" />
            </div>
        )
    }

    // Si falló la carga del perfil
    if (!profile) {
        return (
            <div className="dashboard-error animate-fade-in">
                <div className="dashboard-error__icon">📡</div>
                <h2>No pudimos cargar tus datos</h2>
                <p>{authError || 'Hubo un problema de conexión con el servidor.'}</p>
                <button
                    className="dashboard-error__retry-btn"
                    onClick={() => refreshProfile()}
                >
                    Reintentar conexión
                </button>
            </div>
        )
    }

    const { estado, diasRestantes, variant } = calcularEstadoCuota(profile.fecha_vencimiento)
    const fechaFormateada = new Date(profile.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR', {
        day: '2-digit', month: 'long', year: 'numeric'
    })

    function renderEstadoTexto() {
        if (estado === 'vencido') return `Cuota vencida hace ${Math.abs(diasRestantes)} día${Math.abs(diasRestantes) !== 1 ? 's' : ''}`
        if (estado === 'por_vencer') return diasRestantes === 0 ? 'Vence hoy' : `Vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`
        return `Al día · ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} restante${diasRestantes !== 1 ? 's' : ''}`
    }

    return (
        <div className="dashboard animate-fade-in">
            {/* Saludo */}
            <section className="dashboard-greeting">
                <div>
                    <p className="dashboard-greeting__sub">¡Hola de nuevo! 👋</p>
                    <h1 className="dashboard-greeting__name">{profile.nombre.split(' ')[0]}</h1>
                </div>
                <div className="dashboard-greeting__date">
                    {new Date().toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
            </section>

            {/* Card de Estado - Semáforo */}
            <section className="dashboard-status-section">
                <Card variant={estado === 'vencido' ? 'bordered' : 'default'} className={`dashboard-status-card dashboard-status-card--${variant}`}>
                    {/* Indicador visual */}
                    <div className="dashboard-status-card__indicator">
                        <div className={`dashboard-status-card__dot dashboard-status-card__dot--${variant}`} />
                        <Badge variant={variant} dot size="md">
                            {estado === 'vencido' ? 'Cuota Vencida' : estado === 'por_vencer' ? 'Por Vencer' : 'Al Día'}
                        </Badge>
                    </div>

                    <div className="dashboard-status-card__content">
                        <div className="dashboard-status-card__dias">
                            {estado === 'vencido' ? (
                                <span className="dashboard-status-card__number dashboard-status-card__number--danger">
                                    -{Math.abs(diasRestantes)}
                                </span>
                            ) : (
                                <span className={`dashboard-status-card__number dashboard-status-card__number--${variant}`}>
                                    {diasRestantes}
                                </span>
                            )}
                            <span className="dashboard-status-card__dias-label">días</span>
                        </div>

                        <div className="dashboard-status-card__info">
                            <p className="dashboard-status-card__estado">{renderEstadoTexto()}</p>
                            <p className="dashboard-status-card__fecha">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
                                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                Vencimiento: {fechaFormateada}
                            </p>
                        </div>
                    </div>

                    {/* Barra de progreso del mes */}
                    <div className="dashboard-progress">
                        <div className="dashboard-progress__bar">
                            <div
                                className={`dashboard-progress__fill dashboard-progress__fill--${variant}`}
                                style={{ width: `${Math.min(100, Math.max(0, estado === 'vencido' ? 100 : Math.round((30 - diasRestantes) / 30 * 100)))}%` }}
                            />
                        </div>
                    </div>
                </Card>
            </section>

            {/* Avisos y Notificaciones */}
            <section className="dashboard-notifs">
                <div className="dashboard-section-header">
                    <h2>Avisos del Gimnasio</h2>
                    <Badge variant="neutral" size="sm">{notifications.length}</Badge>
                </div>

                {loadingNotifs ? (
                    <div className="dashboard-notifs-loading">
                        <Spinner size="md" />
                    </div>
                ) : notifications.length === 0 ? (
                    <Card variant="bordered" className="dashboard-notifs-empty">
                        <div className="dashboard-notifs-empty__icon">📭</div>
                        <p>No hay avisos por el momento</p>
                    </Card>
                ) : (
                    <div className="dashboard-notifs-list">
                        {notifications.map(notif => (
                            <Card key={notif.id} variant="default" className="dashboard-notif-item animate-fade-in">
                                {notif.imagen_url && (
                                    <div className="dashboard-notif-item__img">
                                        <img src={notif.imagen_url} alt={notif.titulo} />
                                    </div>
                                )}
                                <div className="dashboard-notif-item__body">
                                    <div className="dashboard-notif-item__meta">
                                        <Badge variant={notif.tipo === 'individual' ? 'info' : 'neutral'} size="sm">
                                            {notif.tipo === 'individual' ? 'Personal' : 'General'}
                                        </Badge>
                                        <span className="dashboard-notif-item__date">
                                            {new Date(notif.created_at).toLocaleDateString('es-AR')}
                                        </span>
                                    </div>
                                    <h3 className="dashboard-notif-item__title">{notif.titulo}</h3>
                                    <p className="dashboard-notif-item__msg">{notif.mensaje}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default DashboardPage
