import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getPaymentsByUser, createPayment, uploadComprobante } from '../../repositories/paymentsRepo'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import './PaymentsPage.css'

const MONTO_CUOTA = 15000 // Placeholder - monto de la cuota en ARS

/**
 * PaymentsPage - Socio puede ver historial de pagos, pagar con simulación o subir comprobante
 */
function PaymentsPage() {
    const { profile } = useAuth()
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [payingSimulated, setPayingSimulated] = useState(false)
    const [simulatedState, setSimulatedState] = useState(null) // 'processing' | 'success' | 'error'
    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    async function loadPayments() {
        if (!profile) return
        try {
            const data = await getPaymentsByUser(profile.id)
            setPayments(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadPayments() }, [profile])

    // Simulación pago MercadoPago
    async function handleSimulatedPayment() {
        setPayingSimulated(true)
        setSimulatedState('processing')
        setErrorMsg('')
        setSuccessMsg('')

        // Simula llamada a API de pago (3 segundos)
        await new Promise(resolve => setTimeout(resolve, 3000))

        try {
            await createPayment({
                user_id: profile.id,
                monto: MONTO_CUOTA,
                metodo_pago: 'mercadopago_sandbox',
                estado: 'approved',
            })
            setSimulatedState('success')
            setSuccessMsg('¡Pago procesado exitosamente! Tu cuenta será actualizada pronto.')
            await loadPayments()
        } catch (err) {
            setSimulatedState('error')
            setErrorMsg('Error al procesar el pago. Intentá nuevamente.')
        } finally {
            setPayingSimulated(false)
            setTimeout(() => setSimulatedState(null), 5000)
        }
    }

    // Subir comprobante de transferencia
    async function handleFileUpload(e) {
        const file = e.target.files[0]
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
        if (!allowedTypes.includes(file.type)) {
            setErrorMsg('Solo se permiten archivos JPG, PNG o PDF.')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrorMsg('El archivo no puede superar los 5MB.')
            return
        }

        setUploading(true)
        setErrorMsg('')
        setSuccessMsg('')
        try {
            const comprobanteUrl = await uploadComprobante(file, profile.id)
            await createPayment({
                user_id: profile.id,
                monto: MONTO_CUOTA,
                metodo_pago: 'transferencia',
                comprobante_url: comprobanteUrl,
                estado: 'pending',
            })
            setSuccessMsg('Comprobante enviado. El administrador lo revisará pronto.')
            await loadPayments()
        } catch (err) {
            setErrorMsg('Error al subir el comprobante: ' + err.message)
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    function getEstadoBadge(estado) {
        const map = {
            pending: { variant: 'pending', label: 'Pendiente' },
            approved: { variant: 'approved', label: 'Aprobado' },
            rejected: { variant: 'rejected', label: 'Rechazado' },
        }
        return map[estado] || { variant: 'neutral', label: estado }
    }

    return (
        <div className="payments animate-fade-in">
            <h1 className="payments__title">Mis Pagos</h1>

            {/* Acciones de pago */}
            <Card variant="glass" className="payments-actions">
                <div className="payments-actions__amount">
                    <span className="payments-actions__label">Cuota mensual</span>
                    <span className="payments-actions__value">${MONTO_CUOTA.toLocaleString('es-AR')}</span>
                </div>

                {/* Estado de la simulación */}
                {simulatedState === 'processing' && (
                    <div className="payments-status payments-status--processing">
                        <Spinner size="sm" />
                        <span>Procesando pago con MercadoPago...</span>
                    </div>
                )}
                {simulatedState === 'success' && (
                    <div className="payments-status payments-status--success">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {successMsg}
                    </div>
                )}
                {simulatedState === 'error' && (
                    <div className="payments-status payments-status--error">{errorMsg}</div>
                )}
                {!simulatedState && successMsg && (
                    <div className="payments-status payments-status--success">{successMsg}</div>
                )}
                {!simulatedState && errorMsg && (
                    <div className="payments-status payments-status--error">{errorMsg}</div>
                )}

                <div className="payments-actions__btns">
                    {/* MercadoPago Simulado */}
                    <button
                        className="payments-mp-btn"
                        onClick={handleSimulatedPayment}
                        disabled={payingSimulated || uploading}
                        aria-label="Pagar con MercadoPago"
                    >
                        <span className="payments-mp-btn__logo">
                            <svg viewBox="0 0 60 24" fill="none" width="80" height="32">
                                <text x="0" y="18" fontFamily="Inter,sans-serif" fontWeight="800" fontSize="14" fill="#00BCFF">Mercado</text>
                                <text x="0" y="32" fontFamily="Inter,sans-serif" fontWeight="800" fontSize="14" fill="#00BCFF">Pago</text>
                            </svg>
                        </span>
                        <span className="payments-mp-btn__text">
                            {payingSimulated ? 'Procesando...' : 'Pagar con MercadoPago'}
                            <small>Modo Sandbox</small>
                        </span>
                        {payingSimulated && <Spinner size="sm" color="light" />}
                    </button>

                    {/* Transferencia Manual */}
                    <label
                        className={`payments-transfer-btn ${uploading ? 'payments-transfer-btn--loading' : ''}`}
                        htmlFor="comprobante-upload"
                        role="button"
                        tabIndex={0}
                        aria-label="Subir comprobante de transferencia"
                    >
                        <span className="payments-transfer-btn__icon">
                            {uploading ? <Spinner size="sm" color="dark" /> : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            )}
                        </span>
                        <span>
                            {uploading ? 'Subiendo...' : 'Transferencia Manual'}
                            <small>JPG, PNG o PDF (max 5MB)</small>
                        </span>
                        <input
                            id="comprobante-upload"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileUpload}
                            disabled={uploading || payingSimulated}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
            </Card>

            {/* Historial de Pagos */}
            <section className="payments-history">
                <h2 className="payments-history__title">Historial</h2>

                {loading ? (
                    <div className="payments-history-loading"><Spinner size="md" /></div>
                ) : payments.length === 0 ? (
                    <Card variant="bordered" className="payments-history-empty">
                        <div className="payments-history-empty__icon">💳</div>
                        <p>No hay pagos registrados</p>
                    </Card>
                ) : (
                    <div className="payments-history-list">
                        {payments.map(payment => {
                            const badge = getEstadoBadge(payment.estado)
                            return (
                                <Card key={payment.id} variant="default" padding="sm" className="payments-history-item">
                                    <div className="payments-history-item__left">
                                        <div className="payments-history-item__method">
                                            {payment.metodo_pago === 'transferencia' ? '🏦' : '💳'}
                                        </div>
                                        <div className="payments-history-item__info">
                                            <span className="payments-history-item__method-label">
                                                {payment.metodo_pago === 'transferencia' ? 'Transferencia' : 'MercadoPago'}
                                            </span>
                                            <span className="payments-history-item__date">
                                                {new Date(payment.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="payments-history-item__right">
                                        <span className="payments-history-item__amount">
                                            ${Number(payment.monto).toLocaleString('es-AR')}
                                        </span>
                                        <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}

export default PaymentsPage
