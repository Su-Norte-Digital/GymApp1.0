import React, { useState, useEffect } from 'react'
import { getAllProfiles } from '../../repositories/profilesRepo'
import { createNotification, uploadPromoImage } from '../../repositories/notificationsRepo'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import './CommunicationsPage.css'

function CommunicationsPage() {
    const [profiles, setProfiles] = useState([])
    const [loadingProfiles, setLoadingProfiles] = useState(true)
    const [sending, setSending] = useState(false)
    const [feedback, setFeedback] = useState({ type: '', msg: '' })

    const [notifType, setNotifType] = useState('general') // 'general' | 'individual'
    const [targetUser, setTargetUser] = useState('')
    const [titulo, setTitulo] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [imageFile, setImageFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)

    useEffect(() => {
        getAllProfiles()
            .then(setProfiles)
            .catch(console.error)
            .finally(() => setLoadingProfiles(false))
    }, [])

    function handleImageChange(e) {
        const file = e.target.files[0]
        if (!file) return
        setImageFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!titulo || !mensaje) return setFeedback({ type: 'error', msg: 'Color titulo y mensaje' })
        if (notifType === 'individual' && !targetUser) return setFeedback({ type: 'error', msg: 'Seleccioná un socio' })

        setSending(true)
        setFeedback({ type: '', msg: '' })

        try {
            let imagenUrl = null
            if (imageFile) {
                imagenUrl = await uploadPromoImage(imageFile)
            }

            await createNotification({
                titulo,
                mensaje,
                tipo: notifType,
                target_user_id: notifType === 'individual' ? targetUser : null,
                imagen_url: imagenUrl
            })

            setFeedback({ type: 'success', msg: 'Notificación enviada con éxito' })
            // Reset
            setTitulo('')
            setMensaje('')
            setImageFile(null)
            setPreviewUrl(null)
            setTargetUser('')
        } catch (err) {
            setFeedback({ type: 'error', msg: 'Error al enviar: ' + err.message })
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="communications animate-fade-in">
            <div className="communications__header">
                <h1>Centro de Comunicaciones</h1>
                <p>Enviá noticias o mensajes personalizados a los socios</p>
            </div>

            <div className="communications-grid">
                <Card variant="default" className="communications-form-card">
                    <form onSubmit={handleSubmit} className="communications-form">
                        <div className="notif-type-selector">
                            <button
                                type="button"
                                className={`type-btn ${notifType === 'general' ? 'type-btn--active' : ''}`}
                                onClick={() => setNotifType('general')}
                            >
                                📢 Aviso General
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${notifType === 'individual' ? 'type-btn--active' : ''}`}
                                onClick={() => setNotifType('individual')}
                            >
                                👤 Mensaje Individual
                            </button>
                        </div>

                        {notifType === 'individual' && (
                            <div className="target-selector">
                                <label>Seleccionar Socio</label>
                                {loadingProfiles ? <Spinner size="sm" /> : (
                                    <select
                                        value={targetUser}
                                        onChange={e => setTargetUser(e.target.value)}
                                        className="admin-select"
                                    >
                                        <option value="">-- Buscar socio --</option>
                                        {profiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre} ({p.dni})</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        <Input
                            label="Título del aviso"
                            value={titulo}
                            onChange={e => setTitulo(e.target.value)}
                            placeholder="Ej: Nueva clase de Crossfit"
                        />

                        <div className="textarea-wrapper">
                            <label className="textarea-label">Mensaje</label>
                            <textarea
                                className="admin-textarea"
                                value={mensaje}
                                onChange={e => setMensaje(e.target.value)}
                                placeholder="Escribí el contenido de la notificación..."
                                rows="4"
                            />
                        </div>

                        <div className="image-upload">
                            <label className="image-upload__label">
                                {previewUrl ? (
                                    <div className="image-preview">
                                        <img src={previewUrl} alt="Preview" />
                                        <div className="image-preview__overlay">Cambiar imagen</div>
                                    </div>
                                ) : (
                                    <div className="image-placeholder">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                        </svg>
                                        <span>Click para subir imagen promocional</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                            </label>
                        </div>

                        {feedback.msg && (
                            <div className={`form-feedback form-feedback--${feedback.type}`}>
                                {feedback.msg}
                            </div>
                        )}

                        <Button type="submit" loading={sending} fullWidth size="lg">
                            Enviar Comunicación
                        </Button>
                    </form>
                </Card>

                <div className="communications-tips">
                    <Card variant="bordered">
                        <h3>Tips de Envío</h3>
                        <ul>
                            <li><strong>General:</strong> Aparece en el carrusel de todos los socios.</li>
                            <li><strong>Individual:</strong> Solo lo ve el socio seleccionado.</li>
                            <li><strong>Imágenes:</strong> Usa banners de 800x400 para mejor visualización.</li>
                            <li><strong>Automatización:</strong> Los recordatorios T-3 se envían solos cada 24hs.</li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default CommunicationsPage
