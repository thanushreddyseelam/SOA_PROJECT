import React from 'react';
import {
  Clock,
  UserCheck,
  CheckCircle,
  MapPin,
  Navigation,
  Flag,
  DollarSign,
  XCircle
} from 'lucide-react';

const RIDE_STAGES = [
  { key: 'REQUESTED', label: 'Requested', icon: Clock },
  { key: 'DRIVER_ASSIGNED', label: 'Driver Assigned', icon: UserCheck },
  { key: 'DRIVER_ACCEPTED', label: 'Accepted', icon: CheckCircle },
  { key: 'DRIVER_ARRIVED', label: 'Arrived', icon: MapPin },
  { key: 'TRIP_STARTED', label: 'In Transit', icon: Navigation },
  { key: 'TRIP_COMPLETED', label: 'Completed', icon: Flag },
  { key: 'PAID', label: 'Settled', icon: DollarSign }
];

export const StatusTimeline = ({ currentStatus }) => {
  if (currentStatus === 'CANCELLED') {
    return (
      <div style={{
        background: 'var(--color-danger-bg)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        textAlign: 'center',
        margin: '1.5rem 0'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)', fontWeight: 700, fontSize: '1.1rem' }}>
          <XCircle size={22} /> Ride Cancelled
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
          This ride request was cancelled. Any locked drivers have been automatically returned to the fleet pool.
        </p>
      </div>
    );
  }

  // Determine stage index
  let activeIndex = 0;
  if (currentStatus === 'DRIVER_ASSIGNED') activeIndex = 1;
  else if (currentStatus === 'DRIVER_ACCEPTED') activeIndex = 2;
  else if (currentStatus === 'DRIVER_ARRIVED') activeIndex = 3;
  else if (currentStatus === 'TRIP_STARTED') activeIndex = 4;
  else if (currentStatus === 'TRIP_COMPLETED') activeIndex = 5;
  else if (currentStatus === 'PAID' || currentStatus === 'PAYMENT_PENDING') activeIndex = 6;

  return (
    <div style={{ margin: '1.5rem 0' }}>
      <div className="timeline">
        {RIDE_STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          let className = 'timeline-step';
          if (isCompleted) className += ' completed';
          if (isActive) className += ' active';

          return (
            <div key={stage.key} className={className}>
              <div className="timeline-dot">
                <Icon size={16} />
              </div>
              <div className="timeline-label">{stage.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
