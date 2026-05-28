import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CalendarDays, Clock, Bell, Package } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUSES = { 1: ['pending', 'Pending'], 2: ['approved', 'Approved'], 3: ['active', 'Active'], 4: ['returned', 'Returned'], 5: ['cancelled', 'Cancelled'], 6: ['rejected', 'Rejected'] };

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</div>
      <div style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800 }}>{value}</div>
    </div>
  </div>
);

export default function MemberDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.member()
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Dashboard load failed'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page" style={{ height: 300 }}><div className="spinner" /></div>;
  if (!data) return null;

  const fmt = (d) => { try { return format(new Date(d), 'dd MMM yyyy'); } catch { return d; } };

  return (
    <div>
      <div className="page-header">
        <h1>Hi, {user?.name}! 👋</h1>
        <p>Your Rental Status</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard icon={CalendarDays} label="Active Rentals" value={data.activeRentals} color="var(--accent3)" />
        <StatCard icon={Clock} label="Upcoming Returns" value={data.upcomingReturns} color="var(--warn)" />
        <StatCard icon={Package} label="Total Bookings" value={data.totalBookings} color="var(--accent)" />
        <StatCard icon={Bell} label="Unread Notifications" value={data.unreadNotifications} color="var(--accent2)" />
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700 }}>Recent Bookings</h3>
          <Link to="/member/bookings" style={{ color: 'var(--accent)', fontSize: 13 }}>Visit →</Link>
        </div>
        {data.recentBookings?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.recentBookings.map(b => {
              const [cls, label] = STATUSES[b.status] || ['pending', 'Unknown'];
              return (
                <div key={b.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: 'var(--bg)',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{b.assetName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                      {fmt(b.startDate)} — {fmt(b.endDate)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>₹{b.totalAmount}</div>
                    <span className={`badge badge-${cls}`}>{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state"><CalendarDays size={40} /><p>No Booking. <Link to="/member/assets" style={{ color: 'var(--accent)' }}>Asset browse !</Link></p></div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 40,
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--text3)',
          padding: '12px 0',
          borderTop: '1px solid var(--border)',
        }}
      >
        Created by <span style={{ fontWeight: 600 }}>Madhan</span>
      </div>

    </div>
  );
}
      
  