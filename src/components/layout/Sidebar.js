import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, CalendarDays, RotateCcw,
  Bell, Users, LogOut, Menu, X, ChevronRight, Layers
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/assets', icon: Package, label: 'Assets' },
  { to: '/admin/bookings', icon: CalendarDays, label: 'Bookings' },
  { to: '/admin/returns', icon: RotateCcw, label: 'Returns' },
];

const memberLinks = [
  { to: '/member', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/member/assets', icon: Package, label: 'Browse Assets' },
  { to: '/member/bookings', icon: CalendarDays, label: 'My Bookings' },
  { to: '/member/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = isAdmin ? adminLinks : memberLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="btn btn-secondary"
        style={{ position: 'fixed', top: 16, left: 16, zIndex: 200, display: 'none' }}
        id="sidebar-toggle"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside style={{
        width: 240,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        height: '100vh',
        position: 'fixed',
        left: 0, top: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'transform 0.2s',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Layers size={18} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18 }}>RentFlow</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: -2 }}>
                {isAdmin ? 'Admin Panel' : 'Member Portal'}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                marginBottom: 2,
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                background: isActive ? 'rgba(79,142,247,0.1)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                transition: 'all 0.15s',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: 'var(--surface)',
            marginBottom: 8,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{user?.email}</div>
            <div style={{
              marginTop: 6,
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: 20,
              fontSize: 11,
              background: isAdmin ? 'rgba(124,58,237,0.15)' : 'rgba(79,142,247,0.15)',
              color: isAdmin ? '#a78bfa' : 'var(--accent)',
              fontWeight: 600,
            }}>
              {isAdmin ? 'Admin' : 'Member'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary w-full"
            style={{ justifyContent: 'center', fontSize: 13 }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
