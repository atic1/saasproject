import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe, Info, CreditCard, Users, Zap, Image, Share2,
  Clock, Save, Plus, Trash2, Edit3, X, Check, Copy,
  ExternalLink, Loader, AlertCircle, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

// =============================================
//  Helpers
// =============================================
const getAuthHeaders = () => {
  const token = localStorage.getItem('saas_token');
  const businessId = JSON.parse(localStorage.getItem('saas_active_business') || '{}')?.businessId || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Business-Id': businessId
  };
};

const Toast = ({ message, type = 'success', onClose }) => (
  <div style={{
    position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
    background: type === 'success' ? '#10b981' : '#ef4444',
    color: '#fff', borderRadius: 14, padding: '14px 22px',
    display: 'flex', alignItems: 'center', gap: 10,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    fontWeight: 700, fontSize: '0.92rem', animation: 'slideUp 0.3s ease'
  }}>
    {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
    {message}
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: 8, padding: 0 }}>
      <X size={16} />
    </button>
  </div>
);

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280' }}>
    <Loader size={18} style={{ animation: 'spin 0.9s linear infinite' }} />
    <span>Loading…</span>
  </div>
);

// =============================================
//  Modal
// =============================================
const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
  }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{
      background: 'var(--bg-surface, #fff)', borderRadius: 20,
      padding: 32, maxWidth: 520, width: '100%',
      boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
      maxHeight: '90vh', overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main, #0f172a)' }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
          <X size={22} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

// =============================================
//  Form Field components
// =============================================
const Field = ({ label, children, hint }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main, #374151)', marginBottom: 6 }}>
      {label}
    </label>
    {children}
    {hint && <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 4 }}>{hint}</p>}
  </div>
);

const Input = ({ value, onChange, placeholder, type = 'text', ...rest }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{
      width: '100%', padding: '10px 14px',
      border: '1.5px solid hsla(var(--border, 220,20%,88%), 1)',
      borderRadius: 10, fontSize: '0.93rem',
      background: 'transparent', color: 'var(--text-main, #111827)',
      fontFamily: 'inherit', outline: 'none',
      transition: 'border 0.2s', boxSizing: 'border-box'
    }}
    {...rest}
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 4 }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    style={{
      width: '100%', padding: '10px 14px',
      border: '1.5px solid hsla(var(--border, 220,20%,88%), 1)',
      borderRadius: 10, fontSize: '0.93rem',
      background: 'transparent', color: 'var(--text-main, #111827)',
      fontFamily: 'inherit', outline: 'none', resize: 'vertical',
      boxSizing: 'border-box'
    }}
  />
);

const SaveBtn = ({ loading, onClick, label = 'Save Changes' }) => (
  <button
    onClick={onClick}
    disabled={loading}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      border: 'none', color: '#fff', fontWeight: 700,
      fontSize: '0.93rem', cursor: loading ? 'not-allowed' : 'pointer',
      padding: '11px 24px', borderRadius: 12, fontFamily: 'inherit',
      opacity: loading ? 0.7 : 1, boxShadow: '0 4px 14px rgba(99,102,241,0.3)'
    }}
  >
    {loading ? <Loader size={16} style={{ animation: 'spin 0.9s linear infinite' }} /> : <Save size={16} />}
    {label}
  </button>
);

// =============================================
//  TAB 1: BASIC INFO
// =============================================
const BasicInfoTab = ({ businessId, showToast }) => {
  const [form, setForm]   = useState({ logo: '', coverImage: '', description: '', mission: '', facilities: '', address: '', phone: '', email: '', mapLink: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_BASE}/gym-website`, { headers: getAuthHeaders() });
        if (res.ok) {
          const d = await res.json();
          setForm(f => ({
            ...f,
            logo: d.logo || '',
            coverImage: d.coverImage || '',
            description: d.description || '',
            mission: d.mission || '',
            facilities: d.facilities || '',
            address: d.address || '',
            phone: d.phone || '',
            email: d.email || '',
            mapLink: d.mapLink || ''
          }));
        }
      } finally { setLoading(false); }
    };
    fetch_();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/gym-website`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(form)
      });
      if (res.ok) showToast('Basic info saved successfully!');
      else showToast('Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Field label="Logo URL" hint="Paste a direct image URL (e.g. from Imgur)">
          <Input value={form.logo} onChange={set('logo')} placeholder="https://example.com/logo.png" />
          {form.logo && <img src={form.logo} alt="logo" style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', marginTop: 8 }} onError={e => e.target.style.display='none'} />}
        </Field>
        <Field label="Cover Image URL" hint="Banner / hero background image">
          <Input value={form.coverImage} onChange={set('coverImage')} placeholder="https://example.com/cover.jpg" />
          {form.coverImage && <img src={form.coverImage} alt="cover" style={{ width: '100%', height: 64, borderRadius: 10, objectFit: 'cover', marginTop: 8 }} onError={e => e.target.style.display='none'} />}
        </Field>
      </div>
      <Field label="Description">
        <Textarea value={form.description} onChange={set('description')} placeholder="Briefly describe your gym…" />
      </Field>
      <Field label="Mission Statement">
        <Textarea value={form.mission} onChange={set('mission')} placeholder="Our mission is to…" rows={3} />
      </Field>
      <Field label="Facilities">
        <Textarea value={form.facilities} onChange={set('facilities')} placeholder="List facilities (e.g. Free weights, Cardio machines, Sauna…)" rows={3} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Field label="Address"><Input value={form.address} onChange={set('address')} placeholder="Kathmandu, Nepal" /></Field>
        <Field label="Phone"><Input value={form.phone} onChange={set('phone')} placeholder="9800000000" /></Field>
        <Field label="Email"><Input value={form.email} onChange={set('email')} placeholder="info@fitgym.com" /></Field>
        <Field label="Google Maps Embed URL" hint="From Google Maps > Share > Embed a map">
          <Input value={form.mapLink} onChange={set('mapLink')} placeholder="https://www.google.com/maps/embed?pb=…" />
        </Field>
      </div>
      <SaveBtn loading={saving} onClick={save} />
    </div>
  );
};

// =============================================
//  CRUD TABLE HELPER
// =============================================
const CrudTable = ({ columns, rows, onEdit, onDelete }) => (
  <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid hsla(var(--border,220,20%,88%), 1)', marginTop: 16 }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
      <thead>
        <tr style={{ background: 'hsla(var(--border,220,20%,88%),0.3)' }}>
          {columns.map(c => (
            <th key={c.key} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted,#6b7280)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
              {c.label}
            </th>
          ))}
          <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted,#6b7280)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={columns.length + 1} style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af' }}>No records yet. Click "Add New" to get started.</td></tr>
        ) : rows.map(row => (
          <tr key={row._id} style={{ borderTop: '1px solid hsla(var(--border,220,20%,88%),0.5)' }}>
            {columns.map(c => (
              <td key={c.key} style={{ padding: '12px 16px', color: 'var(--text-body,#374151)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
              </td>
            ))}
            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={() => onEdit(row)} style={{ background: 'rgba(99,102,241,0.1)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#6366f1' }}>
                  <Edit3 size={15} />
                </button>
                <button onClick={() => onDelete(row._id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#ef4444' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// =============================================
//  TAB 2: MEMBERSHIP PLANS
// =============================================
const PlansTab = ({ showToast }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | {mode:'add'|'edit', data}
  const [form, setForm] = useState({ name: '', price: '', duration: '', description: '', isPopular: false });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/gym-website/plans`, { headers: getAuthHeaders() });
      if (res.ok) setPlans(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ name: '', price: '', duration: '', description: '', isPopular: false }); setModal({ mode: 'add' }); };
  const openEdit = (row) => { setForm({ name: row.name, price: row.price, duration: row.duration, description: row.description || '', isPopular: !!row.isPopular }); setModal({ mode: 'edit', id: row._id }); };

  const save = async () => {
    setSaving(true);
    try {
      const url = modal.mode === 'add' ? `${API_BASE}/gym-website/plans` : `${API_BASE}/gym-website/plans/${modal.id}`;
      const method = modal.mode === 'add' ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify({ ...form, price: Number(form.price) }) });
      if (res.ok) { showToast(modal.mode === 'add' ? 'Plan added!' : 'Plan updated!'); setModal(null); load(); }
      else showToast('Failed to save plan', 'error');
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    const res = await fetch(`${API_BASE}/gym-website/plans/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) { showToast('Plan deleted!'); load(); }
    else showToast('Delete failed', 'error');
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
        <button onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', fontWeight: 700, padding: '10px 20px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}>
          <Plus size={16} /> Add Plan
        </button>
      </div>
      <CrudTable
        columns={[
          { key: 'name', label: 'Plan Name' },
          { key: 'duration', label: 'Duration' },
          { key: 'price', label: 'Price', render: v => `Rs ${Number(v).toLocaleString()}` },
          { key: 'isPopular', label: 'Popular', render: v => v ? <span style={{ color: '#f59e0b', fontWeight: 700 }}>⭐ Yes</span> : '—' },
          { key: 'description', label: 'Description' }
        ]}
        rows={plans}
        onEdit={openEdit}
        onDelete={del}
      />
      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Membership Plan' : 'Edit Plan'} onClose={() => setModal(null)}>
          <Field label="Plan Name"><Input value={form.name} onChange={set('name')} placeholder="e.g. Monthly Plan" /></Field>
          <Field label="Price (Rs)"><Input type="number" value={form.price} onChange={set('price')} placeholder="2000" /></Field>
          <Field label="Duration"><Input value={form.duration} onChange={set('duration')} placeholder="e.g. 1 Month" /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={set('description')} placeholder="What's included in this plan?" rows={3} /></Field>
          <Field label="">
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 600, color: 'var(--text-body,#374151)' }}>
              <input type="checkbox" checked={form.isPopular} onChange={e => setForm(p => ({ ...p, isPopular: e.target.checked }))} style={{ width: 18, height: 18, cursor: 'pointer' }} />
              Mark as Most Popular
            </label>
          </Field>
          <SaveBtn loading={saving} onClick={save} label={modal.mode === 'add' ? 'Add Plan' : 'Update Plan'} />
        </Modal>
      )}
    </div>
  );
};

// =============================================
//  TAB 3: TRAINERS
// =============================================
const TrainersTab = ({ showToast }) => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', photo: '', specialization: '', experience: '', bio: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/gym-website/trainers`, { headers: getAuthHeaders() });
      if (res.ok) setTrainers(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ name: '', photo: '', specialization: '', experience: '', bio: '' }); setModal({ mode: 'add' }); };
  const openEdit = (row) => { setForm({ name: row.name, photo: row.photo || '', specialization: row.specialization, experience: row.experience || '', bio: row.bio || '' }); setModal({ mode: 'edit', id: row._id }); };

  const save = async () => {
    setSaving(true);
    try {
      const url = modal.mode === 'add' ? `${API_BASE}/gym-website/trainers` : `${API_BASE}/gym-website/trainers/${modal.id}`;
      const method = modal.mode === 'add' ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(form) });
      if (res.ok) { showToast(modal.mode === 'add' ? 'Trainer added!' : 'Trainer updated!'); setModal(null); load(); }
      else showToast('Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this trainer?')) return;
    const res = await fetch(`${API_BASE}/gym-website/trainers/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) { showToast('Trainer deleted!'); load(); }
    else showToast('Delete failed', 'error');
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
        <button onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', fontWeight: 700, padding: '10px 20px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}>
          <Plus size={16} /> Add Trainer
        </button>
      </div>
      <CrudTable
        columns={[
          { key: 'photo', label: 'Photo', render: (v, row) => v ? <img src={v} alt={row.name} style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }} /> : <div style={{ width: 38, height: 38, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>{row.name?.charAt(0) || '?'}</div> },
          { key: 'name', label: 'Name' },
          { key: 'specialization', label: 'Specialization' },
          { key: 'experience', label: 'Experience' }
        ]}
        rows={trainers}
        onEdit={openEdit}
        onDelete={del}
      />
      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Trainer' : 'Edit Trainer'} onClose={() => setModal(null)}>
          <Field label="Full Name"><Input value={form.name} onChange={set('name')} placeholder="John Carter" /></Field>
          <Field label="Photo URL" hint="Paste a direct image URL">
            <Input value={form.photo} onChange={set('photo')} placeholder="https://example.com/trainer.jpg" />
            {form.photo && <img src={form.photo} alt="preview" style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', marginTop: 8 }} onError={e => e.target.style.display='none'} />}
          </Field>
          <Field label="Specialization"><Input value={form.specialization} onChange={set('specialization')} placeholder="Strength & Conditioning" /></Field>
          <Field label="Experience"><Input value={form.experience} onChange={set('experience')} placeholder="5+ Years" /></Field>
          <Field label="Bio"><Textarea value={form.bio} onChange={set('bio')} placeholder="Brief description of the trainer…" rows={3} /></Field>
          <SaveBtn loading={saving} onClick={save} label={modal.mode === 'add' ? 'Add Trainer' : 'Update Trainer'} />
        </Modal>
      )}
    </div>
  );
};

// =============================================
//  TAB 4: SERVICES
// =============================================
const ServicesTab = ({ showToast }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ serviceName: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/gym-website/services`, { headers: getAuthHeaders() });
      if (res.ok) setServices(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ serviceName: '', description: '' }); setModal({ mode: 'add' }); };
  const openEdit = (row) => { setForm({ serviceName: row.serviceName, description: row.description || '' }); setModal({ mode: 'edit', id: row._id }); };

  const save = async () => {
    setSaving(true);
    try {
      const url = modal.mode === 'add' ? `${API_BASE}/gym-website/services` : `${API_BASE}/gym-website/services/${modal.id}`;
      const method = modal.mode === 'add' ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(form) });
      if (res.ok) { showToast(modal.mode === 'add' ? 'Service added!' : 'Service updated!'); setModal(null); load(); }
      else showToast('Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    const res = await fetch(`${API_BASE}/gym-website/services/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) { showToast('Service deleted!'); load(); }
    else showToast('Delete failed', 'error');
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
        <button onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', fontWeight: 700, padding: '10px 20px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}>
          <Plus size={16} /> Add Service
        </button>
      </div>
      <CrudTable
        columns={[
          { key: 'serviceName', label: 'Service Name' },
          { key: 'description', label: 'Description' }
        ]}
        rows={services}
        onEdit={openEdit}
        onDelete={del}
      />
      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Service' : 'Edit Service'} onClose={() => setModal(null)}>
          <Field label="Service Name"><Input value={form.serviceName} onChange={set('serviceName')} placeholder="e.g. Personal Training" /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={set('description')} placeholder="Describe this service…" rows={3} /></Field>
          <SaveBtn loading={saving} onClick={save} label={modal.mode === 'add' ? 'Add Service' : 'Update Service'} />
        </Modal>
      )}
    </div>
  );
};

// =============================================
//  TAB 5: GALLERY
// =============================================
const GalleryTab = ({ showToast }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/gym-website/gallery`, { headers: getAuthHeaders() });
      if (res.ok) setImages(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!imageUrl.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`${API_BASE}/gym-website/gallery`, {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ imageUrl: imageUrl.trim(), caption: caption.trim() })
      });
      if (res.ok) { showToast('Image added!'); setImageUrl(''); setCaption(''); load(); }
      else showToast('Failed to add image', 'error');
    } finally { setAdding(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Remove this image?')) return;
    const res = await fetch(`${API_BASE}/gym-website/gallery/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) { showToast('Image removed!'); load(); }
    else showToast('Delete failed', 'error');
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ background: 'hsla(var(--border,220,20%,88%),0.2)', borderRadius: 16, padding: 24, marginBottom: 28, border: '1px solid hsla(var(--border,220,20%,88%),0.5)' }}>
        <h3 style={{ fontWeight: 800, marginBottom: 16, color: 'var(--text-main,#0f172a)', fontSize: '1rem' }}>Add Photo</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <Field label="Image URL">
            <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/gym-photo.jpg" />
          </Field>
          <Field label="Caption (optional)">
            <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Equipment area" />
          </Field>
        </div>
        {imageUrl && (
          <img src={imageUrl} alt="preview" style={{ height: 100, objectFit: 'cover', borderRadius: 10, marginBottom: 12, display: 'block' }} onError={e => e.target.style.display='none'} />
        )}
        <SaveBtn loading={adding} onClick={add} label="Add to Gallery" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {images.length === 0 ? (
          <p style={{ color: '#9ca3af', gridColumn: '1/-1', textAlign: 'center', padding: 32 }}>No images yet. Add image URLs above.</p>
        ) : images.map(img => (
          <div key={img._id} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid hsla(var(--border,220,20%,88%),0.5)', aspectRatio: '4/3' }}>
            <img
              src={img.imageUrl}
              alt={img.caption || 'Gallery'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error'; }}
            />
            <button
              onClick={() => del(img._id)}
              style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: 8, padding: '5px 7px', cursor: 'pointer', color: '#fff' }}
            >
              <Trash2 size={14} />
            </button>
            {img.caption && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '6px 10px', fontSize: '0.78rem', fontWeight: 600 }}>
                {img.caption}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================
//  TAB 6: SOCIAL LINKS
// =============================================
const SocialLinksTab = ({ showToast }) => {
  const [form, setForm] = useState({ facebook: '', instagram: '', tiktok: '', youtube: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_BASE}/gym-website`, { headers: getAuthHeaders() });
        if (res.ok) {
          const d = await res.json();
          setForm({
            facebook:  d.socialLinks?.facebook  || '',
            instagram: d.socialLinks?.instagram || '',
            tiktok:    d.socialLinks?.tiktok    || '',
            youtube:   d.socialLinks?.youtube   || ''
          });
        }
      } finally { setLoading(false); }
    };
    fetch_();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/gym-website`, {
        method: 'PUT', headers: getAuthHeaders(),
        body: JSON.stringify({ socialLinks: form })
      });
      if (res.ok) showToast('Social links saved!');
      else showToast('Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  if (loading) return <Spinner />;

  const socials = [
    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage', color: '#1877f2' },
    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourpage', color: '#e1306c' },
    { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourpage', color: '#010101' },
    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel', color: '#ff0000' }
  ];

  return (
    <div style={{ maxWidth: 560 }}>
      {socials.map(s => (
        <Field key={s.key} label={s.label}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: '0.75rem' }}>{s.label.slice(0,2).toUpperCase()}</span>
            </div>
            <Input value={form[s.key]} onChange={set(s.key)} placeholder={s.placeholder} />
          </div>
        </Field>
      ))}
      <SaveBtn loading={saving} onClick={save} />
    </div>
  );
};

// =============================================
//  TAB 7: BUSINESS HOURS
// =============================================
const HoursTab = ({ showToast }) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const [hours, setHours] = useState(() => {
    const init = {};
    days.forEach(d => { init[d] = { open: '06:00', close: '21:00', isOpen: true }; });
    init.sunday.isOpen = false;
    return init;
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_BASE}/gym-website`, { headers: getAuthHeaders() });
        if (res.ok) {
          const d = await res.json();
          if (d.businessHours) setHours(prev => ({ ...prev, ...d.businessHours }));
        }
      } finally { setLoading(false); }
    };
    fetch_();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/gym-website`, {
        method: 'PUT', headers: getAuthHeaders(),
        body: JSON.stringify({ businessHours: hours })
      });
      if (res.ok) showToast('Business hours saved!');
      else showToast('Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const toggle = (day) => setHours(p => ({ ...p, [day]: { ...p[day], isOpen: !p[day].isOpen } }));
  const setTime = (day, field) => (e) => setHours(p => ({ ...p, [day]: { ...p[day], [field]: e.target.value } }));

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {days.map(day => {
          const h = hours[day] || { open: '06:00', close: '21:00', isOpen: true };
          return (
            <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', background: 'hsla(var(--border,220,20%,88%),0.2)', borderRadius: 14, border: '1px solid hsla(var(--border,220,20%,88%),0.5)' }}>
              <div style={{ width: 100, fontWeight: 700, color: 'var(--text-main,#0f172a)', textTransform: 'capitalize', fontSize: '0.93rem' }}>{day}</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <div style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: h.isOpen ? '#6366f1' : '#d1d5db',
                  position: 'relative', transition: 'background 0.2s', cursor: 'pointer'
                }} onClick={() => toggle(day)}>
                  <div style={{
                    position: 'absolute', top: 2, width: 20, height: 20,
                    borderRadius: '50%', background: '#fff',
                    left: h.isOpen ? 22 : 2, transition: 'left 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span style={{ color: h.isOpen ? '#6366f1' : '#9ca3af', fontWeight: 700, fontSize: '0.85rem', minWidth: 44 }}>
                  {h.isOpen ? 'Open' : 'Closed'}
                </span>
              </label>
              {h.isOpen && (
                <>
                  <input
                    type="time" value={h.open} onChange={setTime(day, 'open')}
                    style={{ border: '1.5px solid hsla(var(--border,220,20%,88%),1)', borderRadius: 8, padding: '6px 10px', fontFamily: 'inherit', fontSize: '0.88rem', background: 'transparent', color: 'var(--text-main,#111827)' }}
                  />
                  <span style={{ color: '#9ca3af', fontWeight: 600 }}>to</span>
                  <input
                    type="time" value={h.close} onChange={setTime(day, 'close')}
                    style={{ border: '1.5px solid hsla(var(--border,220,20%,88%),1)', borderRadius: 8, padding: '6px 10px', fontFamily: 'inherit', fontSize: '0.88rem', background: 'transparent', color: 'var(--text-main,#111827)' }}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
      <SaveBtn loading={saving} onClick={save} />
    </div>
  );
};

// =============================================
//  MAIN PAGE
// =============================================
const GymWebsiteManager = () => {
  const { activeBusiness } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [toast, setToast] = useState(null);
  const [slug, setSlug] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch slug from backend
    const token = localStorage.getItem('saas_token');
    const businessId = activeBusiness?.businessId;
    if (businessId) {
      fetch(`http://localhost:5000/api/dashboard/business`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Business-Id': businessId }
      }).then(r => r.json()).then(d => {
        setSlug(d?.business?.slug || '');
      }).catch(() => {});
    }
  }, [activeBusiness]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const publicUrl = `${window.location.origin}/${slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const tabs = [
    { id: 'basic',   label: 'Basic Info',       icon: <Info size={18} /> },
    { id: 'plans',   label: 'Membership Plans',  icon: <CreditCard size={18} /> },
    { id: 'trainers',label: 'Trainers',          icon: <Users size={18} /> },
    { id: 'services',label: 'Services',          icon: <Zap size={18} /> },
    { id: 'gallery', label: 'Gallery',           icon: <Image size={18} /> },
    { id: 'social',  label: 'Social Links',      icon: <Share2 size={18} /> },
    { id: 'hours',   label: 'Business Hours',    icon: <Clock size={18} /> }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={20} color="#fff" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'hsla(var(--text-main,0,0%,7%),1)', margin: 0 }}>Gym Website</h1>
          </div>
          <p style={{ color: 'hsla(var(--text-muted,0,0%,45%),1)', fontSize: '0.95rem', margin: 0 }}>
            Manage your public gym website content
          </p>
        </div>

        {/* Public URL Card */}
        {slug && (
          <div style={{ background: 'hsla(var(--bg-surface-frosted,0,0%,100%,0.06),1)', border: '1px solid hsla(var(--border,220,20%,88%),0.6)', borderRadius: 16, padding: '16px 20px', minWidth: 300 }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsla(var(--text-muted,0,0%,45%),1)', marginBottom: 8 }}>
              Your Public Website
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <code style={{ fontSize: '0.88rem', color: '#6366f1', fontWeight: 700, wordBreak: 'break-all' }}>
                {publicUrl}
              </code>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}
              >
                <ExternalLink size={14} /> Open Website
              </a>
              <button
                onClick={copyLink}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: copied ? 'rgba(16,185,129,0.1)' : 'hsla(var(--border,220,20%,88%),0.3)', border: '1px solid hsla(var(--border,220,20%,88%),0.5)', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', color: copied ? '#10b981' : 'hsla(var(--text-body,0,0%,27%),1)', fontFamily: 'inherit', transition: 'all 0.2s' }}
              >
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '2px solid hsla(var(--border,220,20%,88%),0.5)', marginBottom: 32, paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 16px', borderRadius: '10px 10px 0 0',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: 700, fontSize: '0.88rem',
              background: activeTab === tab.id ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'hsla(var(--text-muted,0,0%,45%),1)',
              transition: 'all 0.2s',
              marginBottom: -2,
              borderBottom: activeTab === tab.id ? 'none' : '2px solid transparent'
            }}
          >
            {tab.icon}
            <span style={{ display: 'none' }} className="tab-label-hide">{tab.label}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ background: 'hsla(var(--bg-surface-frosted,0,0%,100%,0.06),1)', border: '1px solid hsla(var(--border,220,20%,88%),0.5)', borderRadius: 20, padding: 32 }}>
        {activeTab === 'basic'    && <BasicInfoTab    showToast={showToast} />}
        {activeTab === 'plans'    && <PlansTab        showToast={showToast} />}
        {activeTab === 'trainers' && <TrainersTab     showToast={showToast} />}
        {activeTab === 'services' && <ServicesTab     showToast={showToast} />}
        {activeTab === 'gallery'  && <GalleryTab      showToast={showToast} />}
        {activeTab === 'social'   && <SocialLinksTab  showToast={showToast} />}
        {activeTab === 'hours'    && <HoursTab        showToast={showToast} />}
      </div>

      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Injected CSS */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GymWebsiteManager;
