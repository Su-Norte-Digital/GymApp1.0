import React from 'react'
import './Input.css'

/**
 * Componente Input con label flotante
 * Props: label, error, hint, leftIcon, rightIcon, ...htmlInputProps
 */
function Input({
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    id,
    className = '',
    ...props
}) {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`

    return (
        <div className={`input-wrapper ${error ? 'input-wrapper--error' : ''} ${className}`}>
            {leftIcon && <span className="input-icon input-icon--left">{leftIcon}</span>}

            <input
                id={inputId}
                className={`input-field ${leftIcon ? 'input-field--pad-left' : ''} ${rightIcon ? 'input-field--pad-right' : ''}`}
                placeholder=" "
                {...props}
            />

            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                </label>
            )}

            {rightIcon && <span className="input-icon input-icon--right">{rightIcon}</span>}

            {error && <span className="input-message input-message--error" role="alert">{error}</span>}
            {hint && !error && <span className="input-message input-message--hint">{hint}</span>}
        </div>
    )
}

export default Input
