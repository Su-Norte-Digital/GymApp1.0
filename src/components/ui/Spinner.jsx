import React from 'react'
import './Spinner.css'

/**
 * Componente Spinner - Indicador de carga
 * Props: size (sm|md|lg), color (light|dark|primary)
 */
function Spinner({ size = 'md', color = 'primary' }) {
    return (
        <span
            className={`spinner spinner--${size} spinner--${color}`}
            role="status"
            aria-label="Cargando"
        />
    )
}

export default Spinner
