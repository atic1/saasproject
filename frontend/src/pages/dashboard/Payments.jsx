import { useState, useEffect } from 'react';
import { Plus, Download, FileText, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_BASE from '../../config/api.js';

const Payments = () => {
  const { businessType, businessId, activeBusiness, isSuperAdmin } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [transactionError, setTransactionError] = useState(null);

  // POS Checkout Modal State
  const [showPosModal, setShowPosModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [posForm, setPosForm] = useState({
    customerId: '',
    amount: '',
    tax: '0',
    discount: '0',
    paymentMethod: 'esewa',
    status: 'paid'
  });
  const [submittingPos, setSubmittingPos] = useState(false);

  const accentClass = isSuperAdmin ? 'admin' : businessType;
  const currentAccent = businessType === 'salon' ? '#ec4899' : businessType === 'clinic' ? '#10b981' : '#f97316';

  const loadInvoices = async () => {
    const bId = activeBusiness?.businessId || businessId;
    if (!bId) {
      setTransactions([]);
      setLoadingTransactions(false);
      return;
    }

    setLoadingTransactions(true);
    setTransactionError(null);

    try {
      const token = localStorage.getItem('saas_token');
      const response = await fetch(`${API_BASE}/api/invoices`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Business-Id': bId
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to load invoices');
      }

      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Invoice load failed:", err);
      setTransactionError(err.message || 'Failed to load invoices');
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (!isSuperAdmin) {
      loadInvoices();
    }
  }, [businessId, activeBusiness, isSuperAdmin]);

  // Fetch customers for POS dropdown
  useEffect(() => {
    if (showPosModal && (activeBusiness?.businessId || businessId)) {
      const token = localStorage.getItem('saas_token');
      const bId = activeBusiness?.businessId || businessId;
      fetch(`${API_BASE}/api/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Business-Id': bId
        }
      })
        .then(res => res.json())
        .then(data => setCustomers(Array.isArray(data) ? data : []))
        .catch(err => console.error(err));
    }
  }, [showPosModal, activeBusiness, businessId]);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('saas_token');
    const bId = activeBusiness?.businessId || businessId;
    if (!token || !bId) return;

    try {
      setSubmittingPos(true);
      const res = await fetch(`${API_BASE}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Business-Id': bId
        },
        body: JSON.stringify({
          customerId: posForm.customerId || undefined,
          amount: Number(posForm.amount),
          tax: Number(posForm.tax) || 0,
          discount: Number(posForm.discount) || 0,
          paymentMethod: posForm.paymentMethod,
          status: posForm.status
        })
      });

      if (res.ok) {
        setShowPosModal(false);
        setPosForm({ customerId: '', amount: '', tax: '0', discount: '0', paymentMethod: 'esewa', status: 'paid' });
        loadInvoices();
        alert('POS Checkout Invoice generated successfully!');
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || 'Failed to generate POS invoice');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating invoice');
    } finally {
      setSubmittingPos(false);
    }
  };

  const getPaymentsData = () => {
    if (isSuperAdmin) {
      return [
        { id: 'tx1', tenant: 'FitZone Gym', plan: 'Pro Enterprise', price: 14900, gateway: 'Stripe API', date: '2026-05-20', status: 'Succeeded' },
        { id: 'tx2', tenant: 'Smile Dental Clinic', plan: 'Growth Plan', price: 6900, gateway: 'Connect IPS', date: '2026-05-18', status: 'Succeeded' },
        { id: 'tx3', tenant: 'Glow Beauty Salon', plan: 'Starter Plan', price: 2900, gateway: 'eSewa Web', date: '2026-05-15', status: 'Succeeded' },
      ];
    }

    if (transactions.length > 0) return transactions;

    // Default fallback demo records if no invoices exist yet
    switch (businessType) {
      case 'gym':
        return [
          { _id: 'g1', invoiceNumber: 'INV-GYM-001', customerId: { name: 'Mike Ross' }, total: 4000, paymentMethod: 'eSewa', dueDate: '2026-05-10', status: 'paid' },
          { _id: 'g2', invoiceNumber: 'INV-GYM-002', customerId: { name: 'Harvey Specter' }, total: 45000, paymentMethod: 'Cash', dueDate: '2026-05-08', status: 'paid' },
          { _id: 'g3', invoiceNumber: 'INV-GYM-003', customerId: { name: 'Louis Litt' }, total: 2000, paymentMethod: 'Fonepay', dueDate: '2026-05-05', status: 'pending' },
        ];

      case 'salon':
        return [
          { _id: 's1', invoiceNumber: 'INV-SALON-001', customerId: { name: 'Jane Smith' }, total: 4700, paymentMethod: 'Fonepay', dueDate: '2026-05-04', status: 'paid' },
          { _id: 's2', invoiceNumber: 'INV-SALON-002', customerId: { name: 'Lisa Cuddy' }, total: 1200, paymentMethod: 'Cash', dueDate: '2026-05-04', status: 'paid' },
          { _id: 's3', invoiceNumber: 'INV-SALON-003', customerId: { name: 'Monica Geller' }, total: 3000, paymentMethod: 'Khalti', dueDate: '2026-05-03', status: 'pending' },
        ];

      case 'clinic':
        return [
          { _id: 'c1', invoiceNumber: 'INV-CLN-001', customerId: { name: 'John Doe' }, total: 8500, paymentMethod: 'Bank Transfer', dueDate: '2026-05-10', status: 'paid' },
          { _id: 'c2', invoiceNumber: 'INV-CLN-002', customerId: { name: 'Arthur Pendragon' }, total: 3500, paymentMethod: 'Fonepay', dueDate: '2026-05-09', status: 'pending' },
        ];

      default:
        return [];
    }
  };

  const paymentsData = getPaymentsData();

  const getHeaders = () => {
    if (isSuperAdmin)
      return {
        title: 'Global SaaS Subscriptions',
        desc: 'Monitor multi-tenant platform payments, webhook ledgers, and stripe payouts.'
      };

    switch (businessType) {
      case 'gym':
        return { title: 'Athlete Fee Ledgers', desc: 'Track gym package renewals, gate lock triggers, and payment methods.' };
      case 'salon':
        return { title: 'Salon POS Checkout Invoices', desc: 'Track daily point-of-sale invoices, stylist commissions, and sales tax split.' };
      case 'clinic':
        return { title: 'Clinical Billing & Insurance Claims', desc: 'Track patient medical invoices, insurer co-pays, and claim settlement logs.' };
      default:
        return { title: 'Invoicing & Transactions', desc: 'Manage financial receipts.' };
    }
  };

  const headers = getHeaders();

  return (
    <div className="payments-page animate-fade">

      {/* Page Title */}
      <div className="page-title-row">
        <div>
          <h1>{headers.title}</h1>
          <p>{headers.desc}</p>
        </div>
        <button className={`btn btn-primary btn-${accentClass}`} onClick={() => setShowPosModal(true)}>
          <Plus size={16} />
          <span>{isSuperAdmin ? 'New Plan Tier' : 'POS Checkout'}</span>
        </button>
      </div>

      {/* Table */}
      <div className="card-table-wrapper glass animate-slide-up">
        <div className="table-header">
          <h3>Billing Transaction Ledgers</h3>
          <span className={`table-badge badge-${accentClass}`}>Finance logs</span>
        </div>

        <div className="responsive-table">
          <table>
            <thead>
              {isSuperAdmin ? (
                <tr>
                  <th>Tenant Business</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Gateway</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              ) : (
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              )}
            </thead>

            <tbody>
              {paymentsData.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'hsla(var(--text-muted))' }}>
                    No transactions recorded yet. Click "POS Checkout" to issue your first invoice!
                  </td>
                </tr>
              ) : (
                paymentsData.map((t) => (
                  <tr key={isSuperAdmin ? t.id : t._id}>
                    {isSuperAdmin ? (
                      <>
                        <td>{t.tenant}</td>
                        <td>{t.plan}</td>
                        <td>NPR {t.price?.toLocaleString()}</td>
                        <td>{t.gateway}</td>
                        <td>{t.date}</td>
                        <td>
                          <span className="badge active">{t.status}</span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td><strong>{t.invoiceNumber}</strong></td>
                        <td>{t.customerId?.name || "Walk-in Customer"}</td>
                        <td><span style={{ fontWeight: 700, color: currentAccent }}>NPR {t.total?.toLocaleString()}</span></td>
                        <td><span style={{ textTransform: 'capitalize' }}>{t.paymentMethod}</span></td>
                        <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'Today'}</td>
                        <td>
                          <span className={`badge ${t.status === 'paid' ? 'active' : 'pending'}`}>
                            {t.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS card */}
      {!isSuperAdmin && (
        <section className="pos-quick-card glass animate-slide-up">
          <div className="pos-calc-desc">
            <FileText size={36} className="pos-icon" />
            <div>
              <h3>Simulate POS Checkout Invoicing</h3>
              <p>
                Configure quick payments, adjust split taxes, discount coupons,
                and auto-dispatch billing links instantly.
              </p>
            </div>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => setShowPosModal(true)}
          >
            <Plus size={16} />
            <span>New POS Checkout</span>
          </button>
        </section>
      )}

      {/* POS Checkout Modal */}
      {showPosModal && (
        <div className="modal-overlay" onClick={() => setShowPosModal(false)}>
          <div className="modal-card glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Create POS Checkout Invoice</h3>
              <button className="btn-icon" onClick={() => setShowPosModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateInvoice} className="modal-body">
              <div className="form-group">
                <label>Select Customer</label>
                <select className="form-input" value={posForm.customerId} onChange={e => setPosForm(p => ({ ...p, customerId: e.target.value }))}>
                  <option value="">Walk-in Customer (Default)</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.phone || c.email})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Base Amount (NPR) *</label>
                <input className="form-input" type="number" min="1" required value={posForm.amount} onChange={e => setPosForm(p => ({ ...p, amount: e.target.value }))} placeholder="e.g. 1500" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Tax (NPR)</label>
                  <input className="form-input" type="number" min="0" value={posForm.tax} onChange={e => setPosForm(p => ({ ...p, tax: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Discount (NPR)</label>
                  <input className="form-input" type="number" min="0" value={posForm.discount} onChange={e => setPosForm(p => ({ ...p, discount: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select className="form-input" value={posForm.paymentMethod} onChange={e => setPosForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                    <option value="esewa">eSewa App</option>
                    <option value="khalti">Khalti Wallet</option>
                    <option value="fonepay">Fonepay QR</option>
                    <option value="cash">Cash Drawer</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Status</label>
                  <select className="form-input" value={posForm.status} onChange={e => setPosForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="paid">Paid Immediately</option>
                    <option value="pending">Pending Invoice</option>
                  </select>
                </div>
              </div>

              <div style={{ background: 'hsla(var(--primary), 0.05)', padding: '12px 16px', borderRadius: '8px', marginTop: '8px' }}>
                <strong style={{ fontSize: '0.9rem' }}>Net Payable: </strong>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: currentAccent, marginLeft: '8px' }}>
                  NPR {((Number(posForm.amount) || 0) + (Number(posForm.tax) || 0) - (Number(posForm.discount) || 0)).toLocaleString()}
                </span>
              </div>

              <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPosModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingPos} style={{ backgroundColor: currentAccent }}>
                  {submittingPos ? 'Generating...' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded CSS */}
      <style>{`
        .payments-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .page-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid hsla(var(--border-frosted));
          padding-bottom: 24px;
        }
        .page-title-row h1 { font-size: 2rem; color: hsla(var(--text-main)); }
        .page-title-row p { color: hsla(var(--text-body)); }
        
        .btn-gym { background-color: hsla(var(--accent-gym)); color: white; }
        .btn-gym:hover { background-color: hsla(var(--accent-gym), 0.9); }
        .btn-salon { background-color: hsla(var(--accent-salon)); color: white; }
        .btn-salon:hover { background-color: hsla(var(--accent-salon), 0.9); }
        .btn-clinic { background-color: hsla(var(--accent-clinic)); color: white; }
        .btn-clinic:hover { background-color: hsla(var(--accent-clinic), 0.9); }
        
        .badge-gym { background-color: hsla(var(--accent-gym), 0.1); color: hsla(var(--accent-gym)); }
        .badge-salon { background-color: hsla(var(--accent-salon), 0.1); color: hsla(var(--accent-salon)); }
        .badge-clinic { background-color: hsla(var(--accent-clinic), 0.1); color: hsla(var(--accent-clinic)); }
        .badge-admin { background-color: hsla(var(--primary), 0.1); color: hsla(var(--primary)); }
        
        /* POS card */
        .pos-quick-card {
          border-radius: var(--radius-lg);
          padding: 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          box-shadow: var(--shadow-sm);
        }
        .pos-calc-desc {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .pos-icon {
          color: hsla(var(--primary));
          background-color: hsla(var(--primary), 0.1);
          padding: 8px;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }
        .pos-calc-desc h3 { font-size: 1.1rem; margin-bottom: 4px; }
        .pos-calc-desc p { font-size: 0.9rem; color: hsla(var(--text-body)); max-width: 600px; }
        
        @media (max-width: 900px) {
          .pos-quick-card {
            flex-direction: column;
            text-align: center;
            padding: 24px;
          }
          .pos-calc-desc {
            flex-direction: column;
            align-items: center;
          }
          .pos-quick-card button {
            width: 100%;
          }
          .page-title-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .page-title-row button {
            width: 100%;
          }
        }

        .form-input, select {
          border-radius: var(--radius-md);
          border: 1px solid hsla(var(--border));
          background-color: hsla(var(--bg-base), 0.6);
          color: hsla(var(--text-main));
          outline: none;
        }
        .form-input option, select option {
          background-color: #0f172a;
          color: #f8fafc;
        }
        [data-theme="light"] .form-input option,
        [data-theme="light"] select option {
          background-color: #ffffff;
          color: #0f172a;
        }
      `}</style>
    </div>
  );
};

export default Payments;
