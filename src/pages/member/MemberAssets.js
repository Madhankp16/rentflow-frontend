import React, { useEffect, useState } from 'react';
import { assetsAPI, bookingsAPI } from '../../services/api';
import { Search, Package, Star, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

function BookingModal({ asset, onClose, onBooked }) {
  const [form, setForm] = useState({ startDate: '', endDate: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (form.startDate && form.endDate) {
      const days = Math.max(1, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000));
      setTotal(days * asset.pricePerDay);
    }
  }, [form.startDate, form.endDate, asset.pricePerDay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await bookingsAPI.create({ assetId: asset.id, startDate: form.startDate, endDate: form.endDate, notes: form.notes });
      toast.success('Booking request sent! Waiting for Admin approval .');
      onBooked();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 8 }}>Book Asset</h3>
        <p style={{ color: 'var(--text2)', marginBottom: 20, fontSize: 14 }}>{asset.name} — ₹{asset.pricePerDay}/day</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="grid-2">
            <div className="input-group">
              <label>Start Date</label>
              <input type="date" min={today} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>End Date</label>
              <input type="date" min={form.startDate || today} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
          </div>
          <div className="input-group">
            <label>Notes (optional)</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any description?" />
          </div>
          {total > 0 && (
            <div style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: 10, padding: '12px 16px' }}>
              <div className="flex justify-between" style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 4 }}>
                <span>Rental Cost</span><span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 8 }}>
                <span>Deposit</span><span>₹{asset.depositAmount}</span>
              </div>
              <div className="flex justify-between" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                <span>Total</span><span>₹{(total + parseFloat(asset.depositAmount || 0)).toFixed(2)}</span>
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary w-full" style={{ justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Book Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MemberAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    assetsAPI.getAll()
      .then(r => setAssets(r.data.data || []))
      .catch(() => toast.error('Assets load failed'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = assets.filter(a =>
    a.status === 1 &&
    (a.name?.toLowerCase().includes(search.toLowerCase()) || a.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <h1>Browse Assets</h1>
        <p>Checkout Available Rents</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 500 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
        <input
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px 10px 38px', color: 'var(--text)', width: '100%', outline: 'none', fontFamily: 'DM Sans', fontSize: 14 }}
          placeholder="Search available assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-page" style={{ height: 300 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><Package size={48} /><p>Available assets not available</p></div>
      ) : (
        <div className="grid-3">
          {filtered.map(asset => (
            <div key={asset.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {asset.imageUrl ? (
                <img src={asset.imageUrl} alt={asset.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} onError={e => e.target.parentElement.style.display = 'none'} />
              ) : (
                <div style={{ height: 120, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={40} color="var(--text3)" />
                </div>
              )}
              <div style={{ padding: 20 }}>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>{asset.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{asset.categoryName || 'Uncategorized'}</div>
                </div>
                {asset.description && (
                  <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {asset.description}
                  </p>
                )}
                <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: 'var(--accent)' }}>₹{asset.pricePerDay}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text3)' }}>/day</span></div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>Deposit: ₹{asset.depositAmount}</div>
                  </div>
                  <span className="badge badge-available">Available</span>
                </div>
                <button
                  className="btn btn-primary w-full"
                  style={{ justifyContent: 'center' }}
                  onClick={() => setSelected(asset)}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <BookingModal
          asset={selected}
          onClose={() => setSelected(null)}
          onBooked={() => setSelected(null)}
        />
      )}
    </div>
  );
}
