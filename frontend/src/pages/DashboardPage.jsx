import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rideService } from '../services/rideService';
import { RideCard } from '../components/RideCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  Car,
  Compass,
  CheckCircle2,
  Clock,
  IndianRupee,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Plus
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'DRIVER') {
      navigate('/driver', { replace: true });
    } else if (user?.role === 'ADMIN') {
      navigate('/admin', { replace: true });
    }
  }, [user?.role, navigate]);

  const fetchDashboardData = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await rideService.getRidesByRider(user.userId);
      setRides(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load rides from Ride Service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.userId]);

  // Derive real statistics from actual backend records (no fake numbers)
  const totalRides = rides.length;
  const completedRides = rides.filter(r => r.status === 'TRIP_COMPLETED' || r.status === 'PAID').length;
  const totalSpent = rides
    .filter(r => r.status === 'PAID')
    .reduce((sum, r) => sum + (Number(r.fare) || 0), 0);

  // Check for an ongoing active ride
  const activeRide = rides.find(
    r => ['REQUESTED', 'DRIVER_ASSIGNED', 'DRIVER_ACCEPTED', 'DRIVER_ARRIVED', 'TRIP_STARTED'].includes(r.status)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Passenger Mobility Hub
            </span>
            <span className="badge badge-purple">{user?.role}</span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Welcome back, {user?.username}!
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 620 }}>
            Dispatch rides, track assigned drivers in real-time, and monitor automated fare settlements across the UrbanGlide microservices fleet.
          </p>
        </div>

        <Link to="/book" className="btn btn-lg btn-primary" style={{ boxShadow: 'var(--shadow-glow)' }}>
          <Plus size={20} />
          <span>Book a Ride</span>
        </Link>
      </div>

      {/* Active Trip Banner if currently running */}
      {activeRide && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.15))',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--color-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px var(--color-primary-glow)'
            }}>
              <Navigation size={22} className="animate-pulse" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong style={{ fontSize: '1.05rem' }}>Active Ride #{activeRide.id} in Progress</strong>
                <span className="badge badge-info">{activeRide.status}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {activeRide.pickupAddress} ➔ {activeRide.dropAddress}
              </p>
            </div>
          </div>

          <Link to={`/rides/${activeRide.id}`} className="btn btn-primary">
            Track Live Ride <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Real Statistics Metrics */}
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
            <Car size={24} />
          </div>
          <div>
            <div className="stat-value">{totalRides}</div>
            <div className="stat-label">Total Rides Booked</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">{completedRides}</div>
            <div className="stat-label">Completed Trips</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-purple-bg)', color: 'var(--color-purple)' }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <div className="stat-value">₹{totalSpent.toFixed(2)}</div>
            <div className="stat-label">Total Settled Fares</div>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}

      {/* Recent Rides Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Recent Rides</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Real-time records queried from <code>Ride Service (:8086)</code> via API Gateway.
            </p>
          </div>

          {rides.length > 0 && (
            <Link to="/rides" className="btn btn-sm btn-outline">
              View All Rides <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching rides from API Gateway..." />
        ) : rides.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <Car size={42} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No rides yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 420, margin: '0 auto 1.5rem auto' }}>
              You haven't requested any rides yet. Click below to book your first ride across Vijayawada.
            </p>
            <Link to="/book" className="btn btn-primary">Book a Ride</Link>
          </div>
        ) : (
          <div className="grid-2">
            {rides.slice(0, 4).map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
