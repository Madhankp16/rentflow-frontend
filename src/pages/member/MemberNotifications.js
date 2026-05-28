import React, { useEffect, useState } from 'react';
import { notificationsAPI } from '../../services/api';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TYPE_COLORS = { 1: 'var(--accent)', 2: 'var(--accent3)', 3: 'var(--warn)', 4: 'var(--danger)', 5: 'var(--accent2)' };
const TYPE_LABELS = { 1: 'Info', 2: 'Success', 3: 'Warning', 4: 'Alert', 5: 'Reminder' };

export default function MemberNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    setLoading(true);
    notificationsAPI.getAll()
      .then(r => setNotifications(r.data.data || []))
      .catch(() => toast.error('Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifs(); }, []);

  const handleMarkAll = async () => {
    try {
      await notificationsAPI.markAllRead();
      toast.success('All marked as read');
      fetchNotifs();
    } catch { toast.error('Failed'); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const fmt = (d) => { try { return format(new Date(d), 'dd MMM yyyy, hh:mm a'); } catch { return d; } };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Notifications</h1>
          <p>{unreadCount > 0 ? `${unreadCount} unread messages` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={handleMarkAll}>
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-page" style={{ height: 300 }}><div className="spinner" /></div>
      ) : notifications.length === 0 ? (
        <div className="empty-state" style={{ padding: '80px 24px' }}>
          <BellOff size={48} />
          <p style={{ marginTop: 12 }}>Notifications not Available </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map(n => {
            const color = TYPE_COLORS[n.type] || 'var(--accent)';
            return (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: '16px 20px',
                  background: n.isRead ? 'var(--surface)' : 'var(--surface2)',
                  border: `1px solid ${n.isRead ? 'var(--border)' : color + '40'}`,
                  borderRadius: 12,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: `${color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Bell size={18} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: n.isRead ? 400 : 600, marginBottom: 4 }}>{n.message}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{fmt(n.createdAt)}</span>
                    <span style={{
                      fontSize: 11, padding: '1px 8px', borderRadius: 20,
                      background: `${color}20`, color: color, fontWeight: 600,
                    }}>{TYPE_LABELS[n.type]}</span>
                    {!n.isRead && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
