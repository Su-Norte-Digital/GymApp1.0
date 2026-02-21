import React from 'react'
import './Card.css'

/**
 * Componente Card - Contenedor glassmorphism con variantes
 * Props: variant (default|glass|elevated|bordered), padding, className
 */
function Card({ children, variant = 'default', padding = 'md', className = '', onClick, ...rest }) {
    return (
        <div
            className={[
                'card',
                `card--${variant}`,
                `card--pad-${padding}`,
                onClick ? 'card--clickable' : '',
                className
            ].filter(Boolean).join(' ')}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            {...rest}
        >
            {children}
        </div>
    )
}

export default Card
