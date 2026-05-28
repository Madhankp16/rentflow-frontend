import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layers, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const role = user?.role;
      if (role === 'Admin' || role === 1) navigate('/admin');
      else navigate('/member');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: 16,
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 800px 600px at 50% 40%, rgba(79,142,247,0.08) 0%, transparent 70%)',
      }} />

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: 'var(--glow)',
          }}>
            <Layers size={28} color="white" />
          </div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 32, fontWeight: 800 }}>RentFlow</h1>
          <p style={{ color: 'var(--text2)', marginTop: 6 }}>Asset Rental Management System</p>
        </div>
        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
            Login
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* form fields */}
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text2)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Register
            </Link>
          </p>
        </div>

        <p
          style={{
            textAlign: 'center',
            marginTop: 20,
            color: 'var(--text3)',
            fontSize: 13,
          }}
        >
        Created by Madhan
        </p>

      </div>
    </div>
  );
}