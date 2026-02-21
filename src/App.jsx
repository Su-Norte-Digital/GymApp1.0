import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/auth/PrivateRoute'

// Layouts
import MemberLayout from './components/member/MemberLayout'
import AdminLayout from './components/admin/AdminLayout'

// Páginas Públicas
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

// Páginas Socio
import DashboardPage from './pages/member/DashboardPage'
import PaymentsPage from './pages/member/PaymentsPage'
import NotificationsPage from './pages/member/NotificationsPage'
import ProfilePage from './pages/member/ProfilePage'

// Páginas Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import PaymentValidationPage from './pages/admin/PaymentValidationPage'
import CommunicationsPage from './pages/admin/CommunicationsPage'
import QRPage from './pages/admin/QRPage'

// Estilos Globales
import './styles/global.css'

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Rutas Públicas */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    {/* Rutas Socio Solo para rol 'socio' */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute requiredRole="socio">
                                <MemberLayout />
                            </PrivateRoute>
                        }
                    >
                        <Route index element={<DashboardPage />} />
                        <Route path="payments" element={<PaymentsPage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                    </Route>

                    {/* Rutas Admin Solo para rol 'admin' */}
                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute requiredRole="admin">
                                <AdminLayout />
                            </PrivateRoute>
                        }
                    >
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="payments" element={<PaymentValidationPage />} />
                        <Route path="communications" element={<CommunicationsPage />} />
                        <Route path="qr" element={<QRPage />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
