import React, { useEffect, useState } from 'react';
import { bookingsAPI } from '../../services/api';
import { CalendarDays, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = { 1: 'pending', 2: 'approved', 3: 'active', 4: 'returned', 5: 'cancelled', 6: 'rejected' };
const LABELS = { 1: 'Pending', 2: 'Approved', 3: 'Active', 4: 'Returned', 5: 'Cancelled', 6: 'Rejected' };

export default function MemberBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    bookingsAPI.getMyBookings()
      .then(r => setBookings(r.data.data || []))
      .catch(() => toast.error('Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    const reason = window.prompt('Cancellation reason:');
    if (reason === null) return;
    try {
      await bookingsAPI.cancel(id, reason);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const fmt = (d) => { try { return format(new Date(d), 'dd MMM yyyy'); } catch { return d; } };

  return (
    <div>
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>your booking requests</p>
      </div>

      {loading ? (
        <div className="loading-page" style={{ height: 300 }}><div className="spinner" /></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state" style={{ padding: '80px 24px' }}>
          <CalendarDays size={48} />
          <p style={{ marginTop: 12 }}>Bookings not available</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bookings.map(b => (
            <div key={b.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{b.assetName}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
                  📅 {fmt(b.startDate)} — {fmt(b.endDate)}
                </div>
                {b.notes && <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>"{b.notes}"</div>}
                {b.cancellationReason && (
                  <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>Cancelled: {b.cancellationReason}</div>
                )}
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <span className={`badge badge-${STATUSES[b.status]}`}>{LABELS[b.status]}</span>
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18 }}>₹{b.totalAmount}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Deposit: ₹{b.depositAmount}</div>
                </div>
                {(b.status === 1 || b.status === 2) && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>
                    <X size={14} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
