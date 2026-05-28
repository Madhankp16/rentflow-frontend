import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, AdminRoute, MemberRoute } from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAssets from './pages/admin/AdminAssets';
import AdminBookings from './pages/admin/AdminBookings';

// Member pages
import MemberDashboard from './pages/member/MemberDashboard';
import MemberAssets from './pages/member/MemberAssets';
import MemberBookings from './pages/member/MemberBookings';
import MemberNotifications from './pages/member/MemberNotifications';

function AutoRedirect() {
  const { useAuth } = require('./context/AuthContext');
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/admin' : '/member'} replace />;
}

function RedirectIfLoggedIn({ children }) {
  const { useAuth } = require('./context/AuthContext');
  const { user, isAdmin } = useAuth();
  if (user) return <Navigate to={isAdmin ? '/admin' : '/member'} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin */}
          <Route path="/admin" element={
            <AdminRoute><AppLayout /></AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="assets" element={<AdminAssets />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="returns" element={<AdminBookings />} />
          </Route>

          {/* Member */}
          <Route path="/member" element={
            <MemberRoute><AppLayout /></MemberRoute>
          }>
            <Route index element={<MemberDashboard />} />
            <Route path="assets" element={<MemberAssets />} />
            <Route path="bookings" element={<MemberBookings />} />
            <Route path="notifications" element={<MemberNotifications />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              fontFamily: 'DM Sans',
              fontSize: 14,
            },
            success: { iconTheme: { primary: 'var(--accent3)', secondary: 'var(--bg)' } },
            error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg)' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
