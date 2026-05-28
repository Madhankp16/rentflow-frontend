import React, { useEffect, useState } from 'react';
import { bookingsAPI } from '../../services/api';
import { CalendarDays, CheckCircle, XCircle, Filter } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = { 1: 'Pending', 2: 'Approved', 3: 'Active', 4: 'Returned', 5: 'Cancelled', 6: 'Rejected' };
const STATUS_CLS = { 1: 'pending', 2: 'approved', 3: 'active', 4: 'returned', 5: 'cancelled', 6: 'rejected' };

function ProcessReturnModal({ booking, onClose, onDone }) {
  const [form, setForm] = useState({ bookingId: booking.id, damageStatus: 1, damageNotes: '', additionalCharges: 0 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { returnsAPI } = await import('../../services/api');
      await returnsAPI.process({ ...form, additionalCharges: parseFloat(form.additionalCharges) });
      toast.success('Return processed!');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 20 }}>Process Return</h3>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>Booking #{booking.id} — {booking.assetName}</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group">
            <label>Damage Status</label>
            <select value={form.damageStatus} onChange={(e) => setForm({ ...form, damageStatus: parseInt(e.target.value) })}>
              <option value={1}>No Damage</option>
              <option value={2}>Minor Damage</option>
              <option value={3}>Major Damage</option>
            </select>
          </div>
          <div className="input-group">
            <label>Damage Notes</label>
            <textarea rows={3} value={form.damageNotes} onChange={(e) => setForm({ ...form, damageNotes: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Additional Charges (₹)</label>
            <input type="number" min="0" step="0.01" value={form.additionalCharges} onChange={(e) => setForm({ ...form, additionalCharges: e.target.value })} />
          </div>
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary w-full" style={{ justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn btn-success w-full" style={{ justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Process Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [returnModal, setReturnModal] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    bookingsAPI.getAll(filter || undefined)
      .then(r => setBookings(r.data.data || []))
      .catch(() => toast.error('Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  const handleStatus = async (id, status, notes = '') => {
    try {
      await bookingsAPI.updateStatus(id, { status, notes });
      toast.success('Status updated!');
      fetchBookings();
    } catch { toast.error('Update failed'); }
  };

  const fmt = (d) => { try { return format(new Date(d), 'dd MMM yyyy'); } catch { return d; } };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Bookings</h1>
          <p>All booking requests Management</p>
        </div>
        <div className="flex items-center gap-3">
          <Filter size={16} style={{ color: 'var(--text3)' }} />
          <select
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text)', fontFamily: 'DM Sans', fontSize: 14 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-page" style={{ height: 300 }}><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Asset</th>
                <th>Dates</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><CalendarDays size={40} /><p>Bookings not Available</p></div></td></tr>
              ) : bookings.map(b => (
                <tr key={b.id}>
                  <td style={{ color: 'var(--text3)', fontSize: 13 }}>#{b.id}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{b.userName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{b.userEmail}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{b.assetName}</td>
                  <td style={{ fontSize: 13, color: 'var(--text2)' }}>{fmt(b.startDate)} → {fmt(b.endDate)}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>₹{b.totalAmount}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>dep: ₹{b.depositAmount}</div>
                  </td>
                  <td><span className={`badge badge-${STATUS_CLS[b.status]}`}>{STATUSES[b.status]}</span></td>
                  <td>
                    <div className="flex gap-2">
                      {b.status === 1 && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => handleStatus(b.id, 2)} title="Approve"><CheckCircle size={14} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleStatus(b.id, 6)} title="Reject"><XCircle size={14} /></button>
                        </>
                      )}
                      {b.status === 3 && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setReturnModal(b)}>Return</button>
                      )}
                      {b.status === 2 && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleStatus(b.id, 3)}>Activate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {returnModal && (
        <ProcessReturnModal
          booking={returnModal}
          onClose={() => setReturnModal(null)}
          onDone={() => { setReturnModal(null); fetchBookings(); }}
        />
      )}
    </div>
  );
}
