import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...', size = 28 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '0.75rem', color: 'var(--text-muted)' }}>
      <Loader2 size={size} className="animate-spin" style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{text}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
