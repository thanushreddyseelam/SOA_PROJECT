import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div
      style={{
        background: 'var(--color-danger-bg)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        margin: '1rem 0',
        color: '#fca5a5'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', fontWeight: 500 }}>
        <AlertCircle size={20} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-sm btn-secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
};
