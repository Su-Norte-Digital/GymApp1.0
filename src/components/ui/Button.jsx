import React from 'react'
import './Button.css'
import Spinner from './Spinner'

/**
 * Componente Button - Variantes: primary, secondary, danger, ghost, outline
 * Maneja estados: loading, disabled
 */
function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    onClick,
    type = 'button',
    className = '',
    ...rest
}) {
    const isDisabled = disabled || loading

    return (
        <button
            type={type}
            className={[
                'btn',
                `btn--${variant}`,
                `btn--${size}`,
                fullWidth ? 'btn--full' : '',
                loading ? 'btn--loading' : '',
                className
            ].filter(Boolean).join(' ')}
            disabled={isDisabled}
            onClick={onClick}
            {...rest}
        >
            {loading ? (
                <>
                    <Spinner size="sm" color={variant === 'primary' ? 'dark' : 'light'} />
                    <span>Cargando...</span>
                </>
            ) : children}
        </button>
    )
}

export default Button
