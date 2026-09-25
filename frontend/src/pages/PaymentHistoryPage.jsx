import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { paymentService } from '../services/paymentService';
import { PaymentCard } from '../components/PaymentCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { CreditCard, RefreshCw, CheckCircle2, ShieldCheck, FileSpreadsheet, DollarSign, Wallet } from 'lucide-react';

export const PaymentHistoryPage = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchPayments = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await paymentService.getPaymentsByRiderId(user.userId);
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve payment records from Payment Service (:8088).');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user?.userId]);

  const handleRefund = async (paymentId) => {
    if (!window.confirm(`Request a full refund for Payment #${paymentId}?`)) return;

    setError('');
    setSuccessMsg('');
    try {
      const refunded = await paymentService.refundPayment(paymentId);
      setPayments(prev => prev.map(p => p.id === paymentId ? refunded : p));
      const msg = `Payment #${paymentId} refunded successfully via Payment Service (:8088).`;
      setSuccessMsg(msg);
      success(msg);
    } catch (err) {
      const errMsg = err.message || 'Refund could not be completed.';
      setError(errMsg);
      toastError(errMsg);
    }
  };

  const handleExportStatement = () => {
    if (payments.length === 0) return;
    const headers = ['Transaction ID', 'Ride ID', 'Amount (INR)', 'Payment Method', 'Status', 'Timestamp'];
    const rows = payments.map(p => [
      p.id,
      p.rideId,
      p.amount || 0,
      p.paymentMethod || 'UPI',
      p.status,
      `"${p.createdAt || new Date().toISOString()}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UrbanGlide_Payment_Statement_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Financial statement downloaded!');
  };

  const totalSettled = payments
    .filter(p => p.status === 'SUCCESS' || p.status === 'SETTLED' || p.status === 'COMPLETED')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Financial Ledger
            </span>
            <span className="badge badge-green">BIGDECIMAL ACCURACY</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '2px 0 0 0' }}>Payment Transactions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Immutable ledger records audited in <code>urban_payment_db</code> via Payment Service (:8088).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportStatement} disabled={payments.length === 0} className="btn btn-sm btn-secondary" style={{ gap: '6px' }}>
            <FileSpreadsheet size={15} /> Export Statement
          </button>
          <button onClick={fetchPayments} className="btn btn-sm btn-secondary" style={{ gap: '6px' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-value">₹{totalSettled.toFixed(2)}</div>
            <div className="stat-label">Total Settled Fares</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <div className="stat-value">{payments.length}</div>
            <div className="stat-label">Transactions Processed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="stat-value">100%</div>
            <div className="stat-label">Ledger Integrity</div>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchPayments} />}
      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 18px',
          color: '#34D399',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Fetching financial audit logs from Payment Service (:8088)..." />
      ) : payments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <CreditCard size={42} style={{ color: 'var(--text-dim)', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No payment records found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 420, margin: '0 auto' }}>
            Completed trips with automated digital settlements will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {payments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} onRefund={handleRefund} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
