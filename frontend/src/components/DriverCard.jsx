import React from 'react';
import { User, Car, Phone, MapPin, CheckCircle2, XCircle } from 'lucide-react';

export const DriverCard = ({ driver, isInteractive = false, onToggleAvailability, onUpdateLocation }) => {
  if (!driver) return null;

  const isAvailable = driver.status === 'AVAILABLE';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: isAvailable ? 'var(--color-success-bg)' : 'var(--bg-card-subtle)',
            color: isAvailable ? 'var(--color-success)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${isAvailable ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`
          }}>
            <User size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{driver.name}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              <span>ID: #{driver.id}</span>
              {driver.phone && (
                <>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Phone size={11} /> {driver.phone}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <span className={`badge ${isAvailable ? 'badge-success' : driver.status === 'BUSY' ? 'badge-warning' : 'badge-neutral'}`}>
          {driver.status}
        </span>
      </div>

      <div style={{ background: 'var(--bg-card-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Vehicle</div>
          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: 2 }}>
            <Car size={14} style={{ color: 'var(--color-primary)' }} />
            {driver.vehicleNumber} ({driver.vehicleType})
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>GPS Coordinates</div>
          <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: 2, color: driver.latitude ? 'var(--text-main)' : 'var(--text-dim)' }}>
            <MapPin size={14} style={{ color: 'var(--color-info)' }} />
            {driver.latitude && driver.longitude
              ? `${driver.latitude.toFixed(4)}, ${driver.longitude.toFixed(4)}`
              : 'Offline (No GPS Ping)'}
          </div>
        </div>
      </div>

      {isInteractive && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <button
            onClick={() => onToggleAvailability?.(driver.id, !driver.availability)}
            className={`btn btn-sm ${driver.availability ? 'btn-outline' : 'btn-success'}`}
            style={{ flex: 1 }}
          >
            {driver.availability ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
            {driver.availability ? 'Go Offline' : 'Go Online'}
          </button>

          <button
            onClick={() => onUpdateLocation?.(driver.id)}
            className="btn btn-sm btn-secondary"
          >
            <MapPin size={14} /> Ping GPS
          </button>
        </div>
      )}
    </div>
  );
};
