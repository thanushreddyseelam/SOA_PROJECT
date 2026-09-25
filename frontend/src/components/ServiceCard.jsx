import React from 'react';
import { Server, Database, Activity, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ServiceCard = ({
  name,
  role,
  port,
  routePrefix,
  database,
  techStack,
  status, // 'UP' | 'DOWN' | 'CHECKING'
  icon: Icon = Server
}) => {
  const isUp = status === 'UP';
  const isChecking = status === 'CHECKING';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: isUp ? 'var(--color-success)' : isChecking ? 'var(--color-warning)' : 'var(--color-danger)'
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card-subtle)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-subtle)'
          }}>
            <Icon size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{name}</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Port :{port}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {isChecking ? (
            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
              <Activity size={12} className="animate-spin" /> Checking
            </span>
          ) : isUp ? (
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
              <CheckCircle2 size={12} /> UP
            </span>
          ) : (
            <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
              <XCircle size={12} /> DOWN
            </span>
          )}
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        {role}
      </p>

      <div style={{ background: 'var(--bg-card-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
        {routePrefix && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-dim)' }}>Gateway Route:</span>
            <code style={{ color: 'var(--color-info)' }}>{routePrefix}</code>
          </div>
        )}

        {database && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Database size={12} /> Database:
            </span>
            <strong style={{ color: 'var(--text-main)' }}>{database}</strong>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-dim)' }}>Tech Stack:</span>
          <span style={{ color: 'var(--text-muted)' }}>{techStack}</span>
        </div>
      </div>
    </div>
  );
};
