import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import './LoginPage.css'

function LoginPage() {
    const navigate = useNavigate()
    const { login, loginWithMagicLink } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [magicSent, setMagicSent] = useState(false)
    const [magicLoading, setMagicLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    async function handleLogin(e) {
        e.preventDefault()
        if (!email || !password) return setError('Completá todos los campos.')
        setError('')
        setLoading(true)
        try {
            const { user: authUser } = await login(email, password)
            // La redirección la maneja App.jsx según el rol del perfil
            navigate('/dashboard', { replace: true })
        } catch (err) {
            setError(
                err.message === 'Invalid login credentials'
                    ? 'Email o contraseña incorrectos.'
                    : err.message
            )
        } finally {
            setLoading(false)
        }
    }

    async function handleMagicLink() {
        if (!email) return setError('Ingresá tu email para recibir el magic link.')
        setError('')
        setMagicLoading(true)
        try {
            await loginWithMagicLink(email)
            setMagicSent(true)
        } catch (err) {
            setError(err.message)
        } finally {
            setMagicLoading(false)
        }
    }

    return (
        <div className="login-page">
            {/* Fondo decorativo */}
            <div className="login-bg">
                <div className="login-bg__circle login-bg__circle--1" />
                <div className="login-bg__circle login-bg__circle--2" />
            </div>

            <div className="login-container">
                {/* Logo */}
                <div className="login-logo">
                    <div className="login-logo__icon">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="10" fill="#AAFF00" />
                            <path d="M8 16h3v6H8v-6zM21 10h3v12h-3V10zM14 13h4v9h-4v-9z" fill="#0D0D0D" />
                        </svg>
                    </div>
                    <span className="login-logo__text">GymApp</span>
                </div>

                <div className="login-card">
                    <div className="login-card__header">
                        <h1>Bienvenido 👋</h1>
                        <p>Iniciá sesión para ver tu cuenta</p>
                    </div>

                    {magicSent ? (
                        <div className="login-magic-success">
                            <div className="login-magic-success__icon">✉️</div>
                            <h2>¡Revisá tu email!</h2>
                            <p>Enviamos un link de acceso a <strong>{email}</strong></p>
                            <Button
                                variant="ghost"
                                onClick={() => setMagicSent(false)}
                                fullWidth
                            >
                                Volver al login
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleLogin} className="login-form" noValidate>
                            <Input
                                label="Email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoComplete="email"
                                leftIcon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                }
                            />

                            <Input
                                label="Contraseña"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                                leftIcon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                }
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ pointerEvents: 'all', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--color-text-muted)' }}
                                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                }
                            />

                            {error && (
                                <div className="login-error" role="alert">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <Button type="submit" loading={loading} fullWidth size="lg">
                                Ingresar
                            </Button>

                            <div className="login-divider"><span>o</span></div>

                            <Button
                                type="button"
                                variant="outline"
                                loading={magicLoading}
                                onClick={handleMagicLink}
                                fullWidth
                            >
                                ✉️ Ingresar con Magic Link
                            </Button>
                        </form>
                    )}

                    <p className="login-footer">
                        ¿No tenés cuenta?{' '}
                        <Link to="/signup">Registrate</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
