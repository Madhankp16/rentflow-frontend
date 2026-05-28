import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../../services/api';
import { Package, CalendarDays, DollarSign, AlertTriangle, Users, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
    <div style={{
      width: 48, height: 48, borderRadius: 12,
      background: `${color}20`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ color: 'var(--text2)', marginBottom: 6 }}>{label}</div>
      <div style={{ color: 'var(--accent)' }}>₹{payload[0]?.value?.toLocaleString()}</div>
      <div style={{ color: 'var(--text3)' }}>{payload[1]?.value} bookings</div>
    </div>
  );
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.admin()
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Dashboard load failed'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading...</span></div>;
  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>RentFlow Management</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard icon={Package} label="Total Assets" value={data.totalAssets} color="var(--accent)" />
        <StatCard icon={CalendarDays} label="Active Rentals" value={data.activeRentals} color="var(--accent3)" />
        <StatCard icon={DollarSign} label="Total Revenue" value={`₹${(data.totalRevenue || 0).toLocaleString()}`} color="#f59e0b" />
        <StatCard icon={Users} label="Total Users" value={data.totalUsers} color="var(--accent2)" sub={`${data.pendingApprovals} pending approvals`} />
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <StatCard icon={Clock} label="Pending Returns" value={data.pendingReturns} color="var(--warn)" />
        <StatCard icon={AlertTriangle} label="Damaged Assets" value={data.damagedAssets} color="var(--danger)" />
        <StatCard icon={TrendingUp} label="Pending Approvals" value={data.pendingApprovals} color="#a78bfa" />
      </div>

      <div className="grid-2">
        {/* Monthly Revenue Chart */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 24 }}>Monthly Revenue</h3>
          {data.monthlyRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.monthlyRevenue} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bookingCount" fill="var(--accent2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No revenue data yet</div>
          )}
        </div>

        {/* Top Assets */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 24 }}>Top Rented Assets</h3>
          {data.topRentedAssets?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.topRentedAssets.slice(0, 5).map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--bg)',
                  borderRadius: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      width: 28, height: 28,
                      borderRadius: '50%',
                      background: i === 0 ? 'var(--warn)' : i === 1 ? 'var(--text2)' : 'var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: 'var(--bg)',
                    }}>#{i + 1}</span>
                    <span style={{ fontSize: 14 }}>{a.assetName}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>₹{(a.revenue || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{a.rentalCount} rentals</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No rental data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
