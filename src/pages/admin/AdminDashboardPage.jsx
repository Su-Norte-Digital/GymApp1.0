import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllProfiles, searchProfiles, calcularEstadoCuota } from '../../repositories/profilesRepo'
import { updateFechaVencimiento } from '../../repositories/profilesRepo'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Input from '../../components/ui/Input'
import './AdminDashboardPage.css'

function AdminDashboardPage() {
    const [profiles, setProfiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('todos') // 'todos' | 'activo' | 'por_vencer' | 'vencido'
    const [editModal, setEditModal] = useState(null) // { profile }
    const [nuevaFecha, setNuevaFecha] = useState('')
    const [savingDate, setSavingDate] = useState(false)

    async function loadProfiles() {
        setLoading(true)
        try {
            const data = await getAllProfiles()
            setProfiles(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadProfiles() }, [])

    async function handleSearch(e) {
        const q = e.target.value
        setSearchQuery(q)
        if (q.trim().length < 2) {
            loadProfiles()
            return
        }
        try {
            const data = await searchProfiles(q.trim())
            setProfiles(data)
        } catch (err) {
            console.error(err)
        }
    }

    async function handleSaveFecha() {
        if (!nuevaFecha || !editModal) return
        setSavingDate(true)
        try {
            await updateFechaVencimiento(editModal.profile.id, nuevaFecha)
            await loadProfiles()
            setEditModal(null)
        } catch (err) {
            console.error(err)
        } finally {
            setSavingDate(false)
        }
    }

    const profilesConEstado = profiles.map(p => ({
        ...p,
        cuota: calcularEstadoCuota(p.fecha_vencimiento)
    }))

    const filtrados = profilesConEstado.filter(p => {
        if (filtroEstado === 'todos') return true
        return p.cuota.estado === filtroEstado
    })

    const stats = {
        total: profilesConEstado.length,
        activos: profilesConEstado.filter(p => p.cuota.estado === 'activo').length,
        porVencer: profilesConEstado.filter(p => p.cuota.estado === 'por_vencer').length,
        vencidos: profilesConEstado.filter(p => p.cuota.estado === 'vencido').length,
    }

    return (
        <div className="admin-dash animate-fade-in">
            <div className="admin-dash__header">
                <h1>Gestión de Socios</h1>
                <p className="admin-dash__subtitle">
                    {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>

            {/* Stats */}
            <div className="admin-stats">
                {[
                    { label: 'Total Socios', value: stats.total, variant: 'neutral' },
                    { label: 'Al Día', value: stats.activos, variant: 'success' },
                    { label: 'Por Vencer', value: stats.porVencer, variant: 'warning' },
                    { label: 'Vencidos', value: stats.vencidos, variant: 'danger' },
                ].map(stat => (
                    <Card key={stat.label} variant="default" className={`admin-stat-card admin-stat-card--${stat.variant}`} onClick={() => setFiltroEstado(stat.variant === 'neutral' ? 'todos' : stat.label === 'Por Vencer' ? 'por_vencer' : stat.variant === 'success' ? 'activo' : 'vencido')}>
                        <span className={`admin-stat-card__value admin-stat-card__value--${stat.variant}`}>{stat.value}</span>
                        <span className="admin-stat-card__label">{stat.label}</span>
                    </Card>
                ))}
            </div>

            {/* Búsqueda y filtros */}
            <div className="admin-controls">
                <div className="admin-search">
                    <Input
                        label="Buscar por nombre o DNI"
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        leftIcon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        }
                    />
                </div>
                <div className="admin-filters">
                    {['todos', 'activo', 'por_vencer', 'vencido'].map(f => (
                        <button
                            key={f}
                            className={`admin-filter-btn ${filtroEstado === f ? 'admin-filter-btn--active' : ''}`}
                            onClick={() => setFiltroEstado(f)}
                        >
                            {f === 'todos' ? 'Todos' : f === 'activo' ? '✅ Al día' : f === 'por_vencer' ? '⚠️ Por vencer' : '🔴 Vencidos'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de socios */}
            {loading ? (
                <div className="admin-loading"><Spinner size="lg" /></div>
            ) : filtrados.length === 0 ? (
                <Card variant="bordered" className="admin-empty">
                    <div className="admin-empty__icon">👥</div>
                    <p>No se encontraron socios con ese criterio.</p>
                </Card>
            ) : (
                <div className="admin-members-list">
                    {filtrados.map(profile => (
                        <Card key={profile.id} variant="default" padding="sm" className="admin-member-card">
                            <div className="admin-member-card__avatar" data-variant={profile.cuota.variant}>
                                {profile.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="admin-member-card__info">
                                <div className="admin-member-card__top">
                                    <h3 className="admin-member-card__name">{profile.nombre}</h3>
                                    <Badge variant={profile.cuota.variant} size="sm" dot>
                                        {profile.cuota.estado === 'activo' ? 'Al día' : profile.cuota.estado === 'por_vencer' ? 'Por vencer' : 'Vencido'}
                                    </Badge>
                                </div>
                                <div className="admin-member-card__details">
                                    <span>DNI: {profile.dni}</span>
                                    <span>Vence: {new Date(profile.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR')}</span>
                                    <span className={`admin-member-card__dias admin-member-card__dias--${profile.cuota.variant}`}>
                                        {profile.cuota.estado === 'vencido'
                                            ? `Hace ${Math.abs(profile.cuota.diasRestantes)} días`
                                            : `${profile.cuota.diasRestantes} días restantes`
                                        }
                                    </span>
                                </div>
                            </div>
                            <button
                                className="admin-member-card__edit-btn"
                                onClick={() => { setEditModal({ profile }); setNuevaFecha(profile.fecha_vencimiento) }}
                                title="Editar fecha de vencimiento"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal editar fecha */}
            {editModal && (
                <div className="admin-modal-overlay" onClick={() => setEditModal(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <h3>Editar fecha de vencimiento</h3>
                        <p className="admin-modal__subtitle">{editModal.profile.nombre}</p>
                        <Input
                            label="Nueva fecha de vencimiento"
                            type="date"
                            value={nuevaFecha}
                            onChange={e => setNuevaFecha(e.target.value)}
                        />
                        <div className="admin-modal__actions">
                            <Button variant="ghost" onClick={() => setEditModal(null)}>Cancelar</Button>
                            <Button loading={savingDate} onClick={handleSaveFecha}>Guardar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminDashboardPage
