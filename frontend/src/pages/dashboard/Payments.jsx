import { useState, useEffect } from 'react';
import { Plus, Download, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Payments = () => {
  const { businessType, businessId, isSuperAdmin } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [transactionError, setTransactionError] = useState(null);

  const accentClass = isSuperAdmin ? 'admin' : businessType;

  // =========================
  // DEBUG: FRONTEND INIT
  // =========================
  useEffect(() => {
    console.log("=== PAYMENTS PAGE LOADED ===");
    console.log("businessId:", businessId);
    console.log("isSuperAdmin:", isSuperAdmin);
    console.log("businessType:", businessType);
  }, [businessId, isSuperAdmin, businessType]);

  useEffect(() => {
    if (!isSuperAdmin) {
      const loadInvoices = async () => {
        console.log("=== LOAD INVOICES START ===");

        if (!businessId) {
          console.log("No businessId found, skipping fetch");
          setTransactions([]);
          setLoadingTransactions(false);
          return;
        }

        setLoadingTransactions(true);
        setTransactionError(null);

        try {
          const token = localStorage.getItem('saas_token');

          console.log("Fetching invoices...");
          console.log("token exists:", !!token);

          const response = await fetch('http://localhost:5000/api/invoices', {
            method: "GET",
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Business-Id': businessId
            }
          });

          console.log("Invoice response status:", response.status);

          const data = await response.json();

          console.log("Invoice response data:", data);

          if (!response.ok) {
            throw new Error(data.message || 'Unable to load invoices');
          }

          setTransactions(Array.isArray(data) ? data : []);

          console.log("Invoices loaded:", Array.isArray(data) ? data.length : 0);

        } catch (err) {
          console.error("Invoice load failed:", err);
          setTransactionError(err.message || 'Failed to load invoices');
          setTransactions([]);
        } finally {
          setLoadingTransactions(false);
          console.log("=== LOAD INVOICES END ===");
        }
      };

      loadInvoices();
    }
  }, [businessId, isSuperAdmin]);

  const getPaymentsData = () => {
    console.log("=== USING MOCK PAYMENTS DATA ===");

    if (isSuperAdmin) {
      return [
        { id: 'tx1', tenant: 'FitZone Gym', plan: 'Pro Enterprise', price: 14900, gateway: 'Stripe API', date: '2026-05-20', status: 'Succeeded' },
        { id: 'tx2', tenant: 'Smile Dental Clinic', plan: 'Growth Plan', price: 6900, gateway: 'Connect IPS', date: '2026-05-18', status: 'Succeeded' },
        { id: 'tx3', tenant: 'Glow Beauty Salon', plan: 'Starter Plan', price: 2900, gateway: 'eSewa Web', date: '2026-05-15', status: 'Succeeded' },
      ];
    }

    switch (businessType) {
      case 'gym':
        return [
          { id: 'g1', athlete: 'Mike Ross', pack: 'Power Pro Monthly', amount: 4000, method: 'eSewa App', date: '2026-05-10', status: 'Paid' },
          { id: 'g2', athlete: 'Harvey Specter', pack: 'Gold Annual Pass', amount: 45000, method: 'Cash Drawer', date: '2026-05-08', status: 'Paid' },
          { id: 'g3', athlete: 'Louis Litt', pack: 'Gym Workout Starter', amount: 2000, method: 'Fonepay scan', date: '2026-05-05', status: 'Overdue' },
        ];

      case 'salon':
        return [
          { id: 's1', customer: 'Jane Smith', stylist: 'Rachel Green', bill: 4700, tax: 611, method: 'Fonepay scan', date: '2026-05-04', status: 'Completed' },
          { id: 's2', customer: 'Lisa Cuddy', stylist: 'Chloe Vane', bill: 1200, tax: 156, method: 'Cash Drawer', date: '2026-05-04', status: 'Completed' },
          { id: 's3', customer: 'Monica Geller', stylist: 'Rachel Green', bill: 3000, tax: 390, method: 'Khalti Wallet', date: '2026-05-03', status: 'Pending' },
        ];

      case 'clinic':
        return [
          { id: 'c1', patient: 'John Doe', claim: 'Dental extraction', amount: 8500, copay: 'Insurer 80%', method: 'Bank Transfer', date: '2026-05-10', status: 'Claim Settled' },
          { id: 'c2', patient: 'Arthur Pendragon', claim: 'Physio rehab session', amount: 3500, copay: 'Insurer 50%', method: 'Fonepay Scan', date: '2026-05-09', status: 'Claim Logged' },
          { id: 'c3', patient: 'Ginevra Weasley', claim: 'Clinical Consult', amount: 1500, copay: 'Cash Out of Pocket', date: '2026-05-08', status: 'Settled' },
        ];

      default:
        return [];
    }
  };

  const paymentsData = isSuperAdmin ? getPaymentsData() : transactions;

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

  // =========================
  // DEBUG: FINAL DATA STATE
  // =========================
  console.log("=== PAYMENTS RENDER ===");
  console.log("transactions:", transactions.length);
  console.log("paymentsData:", paymentsData.length);

  return (
    <div className="payments-page animate-fade">

      {/* Page Title */}
      <div className="page-title-row">
        <div>
          <h1>{headers.title}</h1>
          <p>{headers.desc}</p>
        </div>
        <button className={`btn btn-primary btn-${accentClass}`}>
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
              {paymentsData.map((t) => (
                <tr key={isSuperAdmin ? t.id : t._id}>
                  {isSuperAdmin ? (
                    <>
                      <td>{t.tenant}</td>
                      <td>{t.plan}</td>
                      <td>NPR {t.price}</td>
                      <td>{t.gateway}</td>
                      <td>{t.date}</td>
                      <td>{t.status}</td>
                    </>
                  ) : (
                    <>
                      <td>{t.invoiceNumber}</td>
                      <td>{t.customerId?.name || "Customer"}</td>
                      <td>NPR {t.total}</td>
                      <td>{t.paymentMethod}</td>
                      <td>{t.dueDate}</td>
                      <td>{t.status}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* POS card (UNCHANGED UI) */}
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
            onClick={() => {
              console.log("POS button clicked");
              alert('POS Invoice template provisioned. PDF generated.');
            }}
          >
            <Download size={16} />
            <span>Generate PDF Invoice Template</span>
          </button>
        </section>
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
      `}</style>
    </div>
  );
};

export default Payments;
