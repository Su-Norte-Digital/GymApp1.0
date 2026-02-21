import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Card from '../../components/ui/Card'
import './QRPage.css'

function QRPage() {
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin

    return (
        <div className="qr-page animate-fade-in">
            <div className="qr-page__header">
                <h1>Acceso a la PWA</h1>
                <p>Compartí este código con los socios para que instalen la App</p>
            </div>

            <div className="qr-container">
                <Card variant="default" className="qr-card">
                    <div className="qr-card__code">
                        <QRCodeSVG
                            value={appUrl}
                            size={240}
                            bgColor={"#FFFFFF"}
                            fgColor={"#0D0D0D"}
                            level={"H"}
                            includeMargin={true}
                        />
                    </div>
                    <div className="qr-card__info">
                        <h3>{new URL(appUrl).hostname}</h3>
                        <p>Escaneá con la cámara de tu celular para abrir la aplicación.</p>
                    </div>
                    <div className="qr-card__footer">
                        <div className="qr-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12l5 5L20 7" />
                            </svg>
                            Link verificado
                        </div>
                    </div>
                </Card>

                <div className="qr-instructions">
                    <Card variant="bordered">
                        <h3>Instrucciones de Instalación</h3>
                        <div className="instruction-step">
                            <span className="step-num">1</span>
                            <p><strong>Escaneá:</strong> Abrí la cámara o un lector de QR.</p>
                        </div>
                        <div className="instruction-step">
                            <span className="step-num">2</span>
                            <p><strong>Abrí:</strong> Tocá el link que aparece en pantalla.</p>
                        </div>
                        <div className="instruction-step">
                            <span className="step-num">3</span>
                            <p><strong>Instalá:</strong> En el menú del navegador elegí <em>"Instalar aplicación"</em> o <em>"Agregar a inicio"</em>.</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default QRPage
