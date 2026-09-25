import React from 'react';
import { CreditCard, CheckCircle2, XCircle, RotateCcw, Hash, Calendar } from 'lucide-react';

export const PaymentCard = ({ payment, onRefund }) => {
  if (!payment) return null;

  const isSuccess = payment.status === 'SUCCESS';
  const isRefunded = payment.status === 'REFUNDED';

  const formattedDate = payment.createdAt
    ? new Date(payment.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : 'Recent';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `4px solid ${isSuccess ? 'var(--color-success)' : isRefunded ? 'var(--color-purple)' : 'var(--color-danger)'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: isSuccess ? 'var(--color-success-bg)' : isRefunded ? 'var(--color-purple-bg)' : 'var(--color-danger-bg)',
            color: isSuccess ? 'var(--color-success)' : isRefunded ? 'var(--color-purple)' : 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CreditCard size={18} />
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Receipt #{payment.id}</span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>For Ride #{payment.rideId}</div>
          </div>
        </div>

        <span className={`badge ${isSuccess ? 'badge-success' : isRefunded ? 'badge-purple' : 'badge-danger'}`}>
          {payment.status}
        </span>
      </div>

      <div style={{ background: 'var(--bg-card-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Settled Amount</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            ₹{payment.amount ? Number(payment.amount).toFixed(2) : '0.00'}
          </span>
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Method: </span>
            <strong>{payment.paymentMethod || 'CARD'}</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: 'var(--text-dim)' }}>Date: </span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {payment.transactionId && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', wordBreak: 'break-all', marginTop: '0.25rem' }}>
            <Hash size={12} style={{ display: 'inline', marginRight: 4 }} />
            TXN: <code style={{ color: 'var(--color-info)' }}>{payment.transactionId}</code>
          </div>
        )}
      </div>

      {isSuccess && onRefund && (
        <button
          onClick={() => onRefund(payment.id)}
          className="btn btn-sm btn-outline"
          style={{ alignSelf: 'flex-end', marginTop: 'auto', gap: '0.4rem' }}
        >
          <RotateCcw size={14} /> Request Refund
        </button>
      )}
    </div>
  );
};
