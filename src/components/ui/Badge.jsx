import React from 'react'
import './Badge.css'

/**
 * Badge - Indicador de estado visual (semáforo)
 * variant: success | danger | warning | info | pending | approved | rejected | neutral
 */
function Badge({ children, variant = 'neutral', size = 'md', dot = false, className = '' }) {
    return (
        <span className={`badge badge--${variant} badge--${size} ${className}`}>
            {dot && <span className="badge__dot" aria-hidden="true" />}
            {children}
        </span>
    )
}

export default Badge
