import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './MemberLayout.css'

const navItems = [
    {
        to: '/dashboard',
        end: true,
        label: 'Inicio',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
        )
    },
    {
        to: '/dashboard/payments',
        label: 'Pagos',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
        )
    },
    {
        to: '/dashboard/notifications',
        label: 'Avisos',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
        )
    },
    {
        to: '/dashboard/profile',
        label: 'Perfil',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        )
    }
]

function MemberLayout() {
    const { profile } = useAuth()

    return (
        <div className="member-layout">
            {/* Header */}
            <header className="member-header">
                <div className="member-header__brand">
                    <img src="/logo.png" alt="GymApp" className="member-header__logo" />
                </div>

                <div className="member-header__user">
                    <span className="member-header__name">
                        {profile?.nombre ? profile.nombre.split(' ')[0] : '...'}
                    </span>
                    <div className="member-header__avatar">
                        {profile?.nombre?.charAt(0).toUpperCase() || '?'}
                    </div>
                </div>
            </header>

            {/* Contenido */}
            <main className="member-content">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="member-nav" aria-label="Navegación principal">
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `member-nav__item ${isActive ? 'member-nav__item--active' : ''}`
                        }
                        aria-label={item.label}
                    >
                        <span className="member-nav__icon">{item.icon}</span>
                        <span className="member-nav__label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    )
}

export default MemberLayout
