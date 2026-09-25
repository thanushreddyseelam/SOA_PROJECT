import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, IndianRupee, CreditCard, Clock, ChevronRight } from 'lucide-react';

export const RideCard = ({ ride }) => {
  if (!ride) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="badge badge-success">Paid</span>;
      case 'PAYMENT_PENDING':
        return <span className="badge badge-warning">Payment Pending</span>;
      case 'TRIP_COMPLETED':
        return <span className="badge badge-info">Completed</span>;
      case 'TRIP_STARTED':
        return <span className="badge badge-purple">In Transit</span>;
      case 'DRIVER_ARRIVED':
        return <span className="badge badge-info">Driver Arrived</span>;
      case 'DRIVER_ACCEPTED':
        return <span className="badge badge-info">Driver Accepted</span>;
      case 'DRIVER_ASSIGNED':
        return <span className="badge badge-warning">Driver Assigned</span>;
      case 'REQUESTED':
        return <span className="badge badge-neutral">Requested</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const formattedDate = ride.createdAt
    ? new Date(ride.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : 'Recent';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
            Ride #{ride.id}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} /> {formattedDate}
          </span>
        </div>
        {getStatusBadge(ride.status)}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', marginTop: 6, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Pickup</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{ride.pickupAddress || `(${ride.pickupLatitude?.toFixed(3)}, ${ride.pickupLongitude?.toFixed(3)})`}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)', marginTop: 6, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Drop-off</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{ride.dropAddress || `(${ride.destinationLatitude?.toFixed(3)}, ${ride.destinationLongitude?.toFixed(3)})`}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card-subtle)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', marginTop: 'auto' }}>
        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Distance: </span>
            <strong style={{ color: 'var(--text-main)' }}>{ride.distance ? `${ride.distance.toFixed(1)} km` : '--'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Fare: </span>
            <strong style={{ color: 'var(--color-success)' }}>₹{ride.fare ? Number(ride.fare).toFixed(2) : '--'}</strong>
          </div>
          {ride.paymentMethod && (
            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Mode: </span>
              <strong>{ride.paymentMethod}</strong>
            </div>
          )}
        </div>

        <Link to={`/rides/${ride.id}`} className="btn btn-sm btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
          Track <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
};
