import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getNotificationsForUser } from '../../repositories/notificationsRepo'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import './NotificationsPage.css'

function NotificationsPage() {
    const { profile } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!profile) return
        getNotificationsForUser(profile.id)
            .then(setNotifications)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [profile])

    return (
        <div className="notifs-page animate-fade-in">
            <h1 className="notifs-page__title">Avisos</h1>

            {loading ? (
                <div className="notifs-loading"><Spinner size="lg" /></div>
            ) : notifications.length === 0 ? (
                <div className="notifs-empty">
                    <div className="notifs-empty__icon">📭</div>
                    <h2>Sin avisos</h2>
                    <p>El gimnasio no tiene comunicados en este momento.</p>
                </div>
            ) : (
                <div className="notifs-list">
                    {notifications.map((notif, i) => (
                        <Card
                            key={notif.id}
                            variant="default"
                            className="notif-card animate-fade-in"
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            {notif.imagen_url && (
                                <div className="notif-card__img">
                                    <img src={notif.imagen_url} alt={notif.titulo} />
                                </div>
                            )}
                            <div className="notif-card__body">
                                <div className="notif-card__meta">
                                    <Badge variant={notif.tipo === 'individual' ? 'info' : 'neutral'} size="sm" dot>
                                        {notif.tipo === 'individual' ? '👤 Personal' : '📣 General'}
                                    </Badge>
                                    <span className="notif-card__date">
                                        {new Date(notif.created_at).toLocaleDateString('es-AR', {
                                            day: '2-digit', month: 'short'
                                        })}
                                    </span>
                                </div>
                                <h2 className="notif-card__title">{notif.titulo}</h2>
                                <p className="notif-card__msg">{notif.mensaje}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default NotificationsPage
