import React, { useState, useEffect } from 'react'
import { getPendingPayments, updatePaymentStatus } from '../../repositories/paymentsRepo'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import './PaymentValidationPage.css'

function PaymentValidationPage() {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState(null)
    const [viewingImage, setViewingImage] = useState(null)

    async function loadPayments() {
        setLoading(true)
        try {
            const data = await getPendingPayments()
            setPayments(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadPayments() }, [])

    async function handleAction(paymentId, status) {
        setProcessingId(paymentId)
        try {
            await updatePaymentStatus(paymentId, status)
            setPayments(prev => prev.filter(p => p.id !== paymentId))
        } catch (err) {
            console.error(err)
            alert('Error al actualizar el estado del pago')
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <div className="payment-validation animate-fade-in">
            <div className="payment-validation__header">
                <h1>Validación de Pagos</h1>
                <p>Pagos por transferencia pendientes de aprobación</p>
            </div>

            {loading ? (
                <div className="validation-loading"><Spinner size="lg" /></div>
            ) : payments.length === 0 ? (
                <Card variant="bordered" className="validation-empty">
                    <div className="validation-empty__icon">✅</div>
                    <h2>No hay pagos pendientes</h2>
                    <p>Todos los comprobantes han sido procesados.</p>
                </Card>
            ) : (
                <div className="validation-list">
                    {payments.map(payment => (
                        <Card key={payment.id} variant="default" className="validation-card">
                            <div className="validation-card__user">
                                <div className="validation-card__avatar">
                                    {payment.profiles.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3>{payment.profiles.nombre}</h3>
                                    <p>DNI: {payment.profiles.dni}</p>
                                </div>
                            </div>

                            <div className="validation-card__details">
                                <div className="validation-card__amount">
                                    <span>Monto</span>
                                    <strong>${Number(payment.monto).toLocaleString('es-AR')}</strong>
                                </div>
                                <div className="validation-card__date">
                                    <span>Fecha</span>
                                    <strong>{new Date(payment.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</strong>
                                </div>
                            </div>

                            {payment.comprobante_url && (
                                <div className="validation-card__image-preview">
                                    <img
                                        src={payment.comprobante_url}
                                        alt="Comprobante"
                                        onClick={() => setViewingImage(payment.comprobante_url)}
                                    />
                                    <button
                                        className="validation-card__zoom-btn"
                                        onClick={() => setViewingImage(payment.comprobante_url)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                                        </svg>
                                        Ver comprobante
                                    </button>
                                </div>
                            )}

                            <div className="validation-card__actions">
                                <Button
                                    variant="danger"
                                    onClick={() => handleAction(payment.id, 'rejected')}
                                    disabled={processingId === payment.id}
                                    fullWidth
                                >
                                    Rechazar
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => handleAction(payment.id, 'approved')}
                                    loading={processingId === payment.id}
                                    fullWidth
                                >
                                    Aprobar Pago
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal de imagen */}
            {viewingImage && (
                <div className="validation-modal" onClick={() => setViewingImage(null)}>
                    <div className="validation-modal__content" onClick={e => e.stopPropagation()}>
                        <button className="validation-modal__close" onClick={() => setViewingImage(null)}>&times;</button>
                        <img src={viewingImage} alt="Comprobante full" />
                        <div className="validation-modal__footer">
                            <Button href={viewingImage} target="_blank" download variant="outline">Descargar archivo</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PaymentValidationPage
