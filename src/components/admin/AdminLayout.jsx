import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import logo from '../../assets/logo.png'
import './AdminLayout.css'

const navItems = [
    {
        to: '/admin',
        end: true,
        label: 'Socios',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        )
    },
    {
        to: '/admin/payments',
        label: 'Pagos',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
        )
    },
    {
        to: '/admin/communications',
        label: 'Comunicaciones',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        )
    },
    {
        to: '/admin/qr',
        label: 'QR App',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3" />
            </svg>
        )
    }
]

function AdminLayout() {
    const { profile, logout } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const navigate = useNavigate()

    async function handleLogout() {
        await logout()
        navigate('/login', { replace: true })
    }

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${menuOpen ? 'admin-sidebar--open' : ''}`}>
                <div className="admin-sidebar__header">
                    <div className="admin-sidebar__brand">
                        <img src={logo} alt="GymApp" className="admin-sidebar__logo" />
                        <div>
                            <span className="admin-sidebar__title">GymApp</span>
                            <span className="admin-sidebar__subtitle">Panel Admin</span>
                        </div>
                    </div>
                </div>

                <nav className="admin-sidebar__nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`
                            }
                        >
                            <span className="admin-nav-item__icon">{item.icon}</span>
                            <span className="admin-nav-item__label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar__footer">
                    <div className="admin-sidebar__user">
                        <div className="admin-sidebar__avatar">
                            {profile?.nombre?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                            <p className="admin-sidebar__user-name">{profile?.nombre?.split(' ')[0]}</p>
                            <p className="admin-sidebar__user-role">Administrador</p>
                        </div>
                    </div>
                    <button className="admin-sidebar__logout" onClick={handleLogout} title="Cerrar sesión">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </aside>

            {/* Overlay mobile */}
            {menuOpen && (
                <div className="admin-overlay" onClick={() => setMenuOpen(false)} />
            )}

            {/* Contenido principal */}
            <div className="admin-main">
                {/* Header mobile */}
                <header className="admin-header">
                    <div className="admin-header__left">
                        <button
                            className="admin-header__menu-btn"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Menú"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <div className="admin-header__center">
                        <img src={logo} alt="GymApp" className="admin-header__logo" />
                    </div>

                    <div className="admin-header__right">
                        <div className="admin-header__avatar">
                            {profile?.nombre?.charAt(0).toUpperCase() || 'A'}
                        </div>
                    </div>
                </header>

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
