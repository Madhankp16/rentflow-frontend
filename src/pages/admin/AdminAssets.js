import React, { useEffect, useState } from 'react';
import { assetsAPI } from '../../services/api';
import { Plus, Edit2, Trash2, QrCode, Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_MAP = { 1: ['available', 'Available'], 2: ['rented', 'Rented'], 3: ['maintenance', 'Maintenance'], 4: ['damaged', 'Damaged'], 5: ['rented', 'Retired'] };

function AssetModal({ asset, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    name: asset?.name || '',
    categoryId: asset?.categoryId || '',
    description: asset?.description || '',
    pricePerDay: asset?.pricePerDay || '',
    depositAmount: asset?.depositAmount || '',
    imageUrl: asset?.imageUrl || '',
    specifications: asset?.specifications || '',
  });
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, categoryId: parseInt(form.categoryId), pricePerDay: parseFloat(form.pricePerDay), depositAmount: parseFloat(form.depositAmount) };
      if (asset) await assetsAPI.update(asset.id, payload);
      else await assetsAPI.create(payload);
      toast.success(asset ? 'Asset updated!' : 'Asset created!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 24 }}>
          {asset ? 'Asset open' : 'New Asset Add'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group"><label>Asset Name</label><input value={form.name} onChange={update('name')} required /></div>
          <div className="input-group">
            <label>Category</label>
            <select value={form.categoryId} onChange={update('categoryId')} required>
              <option value="">Choose</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="input-group"><label>Price / Day (₹)</label><input type="number" step="0.01" min="0" value={form.pricePerDay} onChange={update('pricePerDay')} required /></div>
            <div className="input-group"><label>Deposit (₹)</label><input type="number" step="0.01" min="0" value={form.depositAmount} onChange={update('depositAmount')} /></div>
          </div>
          <div className="input-group"><label>Description</label><textarea rows={3} value={form.description} onChange={update('description')} /></div>
          <div className="input-group"><label>Image URL</label><input type="url" value={form.imageUrl} onChange={update('imageUrl')} /></div>
          <div className="input-group"><label>Specifications</label><textarea rows={2} value={form.specifications} onChange={update('specifications')} /></div>
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary w-full" style={{ justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminAssets() {
  const [assets, setAssets] = useState([]);
  const [categories] = useState([
    { id: 1, name: 'Electronics' }, { id: 2, name: 'Vehicles' },
    { id: 3, name: 'Tools' }, { id: 4, name: 'Furniture' }, { id: 5, name: 'Other' },
  ]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | asset_obj

  const fetchAssets = () => {
    setLoading(true);
    assetsAPI.getAll()
      .then(r => setAssets(r.data.data || []))
      .catch(() => toast.error('Assets load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAssets(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" Delete?`)) return;
    try {
      await assetsAPI.delete(id);
      toast.success('Asset Deleted');
      fetchAssets();
    } catch { toast.error('Delete failed'); }
  };

  const handleGenerateQR = async (id) => {
    try {
      const { data } = await assetsAPI.generateQR(id);
      toast.success('QR Code generated!');
      console.log('QR:', data.data);
    } catch { toast.error('QR generation failed'); }
  };

  const filtered = assets.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Assets</h1>
          <p>Assests Management</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          <Plus size={18} /> New Asset
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
        <input
          className="input-group input"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px 10px 38px', color: 'var(--text)', width: '100%', outline: 'none', fontFamily: 'DM Sans' }}
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-page" style={{ height: 300 }}><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Price/Day</th>
                <th>Deposit</th>
                <th>Status</th>
                <th>QR Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><Package size={40} /><p>Assets not available</p></div></td></tr>
              ) : filtered.map(asset => {
                const [cls, label] = STATUS_MAP[asset.status] || ['maintenance', asset.status];
                return (
                  <tr key={asset.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {asset.imageUrl
                          ? <img src={asset.imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                          : <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={16} color="var(--text3)" /></div>
                        }
                        <div>
                          <div style={{ fontWeight: 600 }}>{asset.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text3)' }}>{asset.categoryName || 'Uncategorized'}</div>
                        </div>
                      </div>
                    </td>
                    <td>₹{asset.pricePerDay}/day</td>
                    <td>₹{asset.depositAmount}</td>
                    <td><span className={`badge badge-${cls}`}>{label}</span></td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text3)' }}>
                        {asset.qrCode ? asset.qrCode.slice(0, 12) + '...' : '—'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal(asset)} title="Edit"><Edit2 size={14} /></button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleGenerateQR(asset.id)} title="Generate QR"><QrCode size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(asset.id, asset.name)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <AssetModal
          asset={modal === 'create' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchAssets(); }}
        />
      )}
    </div>
  );
}
