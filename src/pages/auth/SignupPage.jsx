import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import logo from '../../assets/logo.png'
import './SignupPage.css'

function SignupPage() {
    const navigate = useNavigate()
    const { signup } = useAuth()

    const [form, setForm] = useState({
        nombre: '', dni: '', email: '', password: '', confirmPassword: '',
        fechaVencimiento: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    function handleChange(field) {
        return (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))
    }

    function validate() {
        if (!form.nombre || !form.dni || !form.email || !form.password || !form.fechaVencimiento)
            return 'Completá todos los campos.'
        if (form.password.length < 6)
            return 'La contraseña debe tener al menos 6 caracteres.'
        if (form.password !== form.confirmPassword)
            return 'Las contraseñas no coinciden.'
        return null
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const validationError = validate()
        if (validationError) return setError(validationError)
        setError('')
        setLoading(true)
        try {
            await signup({
                email: form.email,
                password: form.password,
                nombre: form.nombre,
                dni: form.dni,
                fechaVencimiento: form.fechaVencimiento,
            })
            setSuccess(true)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="signup-page">
                <div className="signup-success animate-fade-in">
                    <div className="signup-success__icon">🎉</div>
                    <h1>¡Cuenta creada!</h1>
                    <p>Revisá tu email para confirmar tu cuenta antes de ingresar.</p>
                    <Button onClick={() => navigate('/login')} fullWidth>
                        Ir al Login
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="signup-page">
            <div className="signup-bg">
                <div className="signup-bg__circle" />
            </div>

            <div className="signup-container animate-slide-up">
                <div className="signup-logo">
                    <img src={logo} alt="GymApp" className="signup-logo__img" />
                </div>

                <div className="signup-card">
                    <div className="signup-card__header">
                        <h1>Crear cuenta</h1>
                        <p>Completá tus datos para registrarte</p>
                    </div>

                    <form onSubmit={handleSubmit} className="signup-form" noValidate>
                        <Input label="Nombre completo" type="text" value={form.nombre} onChange={handleChange('nombre')} autoComplete="name" />
                        <Input label="DNI" type="text" value={form.dni} onChange={handleChange('dni')} inputMode="numeric" />
                        <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} autoComplete="email" />
                        <Input label="Contraseña" type="password" value={form.password} onChange={handleChange('password')} autoComplete="new-password" hint="Mínimo 6 caracteres" />
                        <Input label="Confirmar contraseña" type="password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} autoComplete="new-password" />
                        <Input label="Fecha de vencimiento inicial" type="date" value={form.fechaVencimiento} onChange={handleChange('fechaVencimiento')} />

                        {error && (
                            <div className="signup-error" role="alert">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <Button type="submit" loading={loading} fullWidth size="lg">
                            Crear Cuenta
                        </Button>
                    </form>

                    <p className="signup-footer">
                        ¿Ya tenés cuenta?{' '}<Link to="/login">Iniciá sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignupPage
