import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { rideService } from '../services/rideService';
import { driverService } from '../services/driverService';
import { paymentService } from '../services/paymentService';
import { StatusTimeline } from '../components/StatusTimeline';
import { DriverCard } from '../components/DriverCard';
import { PaymentCard } from '../components/PaymentCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { RideMap } from '../components/RideMap';
import {
  Car,
  MapPin,
  Navigation,
  CreditCard,
  RefreshCw,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Phone,
  Share2,
  Download,
  FileText,
  Copy,
  Check
} from 'lucide-react';

export const RideTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();

  const [ride, setRide] = useState(null);
  const [driver, setDriver] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchRideData = async () => {
    try {
      const rideData = await rideService.getRide(id);
      setRide(rideData);

      if (rideData.driverId) {
        try {
          const driverData = await driverService.getDriverById(rideData.driverId);
          setDriver(driverData);
        } catch {
          // non-critical
        }
      }

      if (rideData.status === 'PAID' || rideData.status === 'PAYMENT_PENDING' || rideData.status === 'TRIP_COMPLETED') {
        try {
          const paymentData = await paymentService.getPaymentByRideId(rideData.id);
          setPayment(paymentData);
        } catch {
          // non-critical
        }
      }
    } catch (err) {
      setError(err.message || `Could not find ride with ID #${id}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRideData();

    const interval = setInterval(() => {
      if (ride && !['PAID', 'CANCELLED'].includes(ride.status)) {
        fetchRideData();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, ride?.status]);

  const handleCancelRide = async () => {
    if (!window.confirm('Are you sure you want to cancel this ride request?')) return;

    setCancelling(true);
    try {
      const updated = await rideService.cancelRide(id);
      setRide(updated);
      success(`Ride #${id} has been cancelled.`);
    } catch (err) {
      toastError(err.message || 'Unable to cancel ride.');
    } finally {
      setCancelling(false);
    }
  };

  const handleShareLiveTracking = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    success('Live ride tracking link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner text={`Fetching Ride #${id} telemetry from Ride Service (:8086)...`} />;
  }

  if (error && !ride) {
    return (
      <div style={{ maxWidth: 640, margin: '2rem auto' }}>
        <ErrorMessage message={error} onRetry={fetchRideData} />
        <Link to="/book" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Return to Dispatch
        </Link>
      </div>
    );
  }

  const canCancel = ride?.status === 'REQUESTED' || ride?.status === 'DRIVER_ASSIGNED';

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/rides" className="btn btn-sm btn-outline">
            <ArrowLeft size={14} /> My Trips
          </Link>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
              Ride #{ride?.id} Live Telemetry
            </h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              Real-time lifecycle managed by <strong>Ride Service (:8086)</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setShowSafetyModal(true)}
            className="btn btn-sm btn-danger"
            style={{ fontWeight: 800 }}
          >
            <ShieldCheck size={15} /> Safety SOS Toolkit
          </button>

          <button onClick={handleShareLiveTracking} className="btn btn-sm btn-ghost" title="Share Trip Link">
            {copiedLink ? <Check size={15} color="var(--accent-emerald)" /> : <Share2 size={15} />}
            <span>Share</span>
          </button>

          <button onClick={fetchRideData} className="btn btn-sm btn-secondary" title="Refresh Telemetry">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Visual State Machine Timeline */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
            Trip Progression State Machine
          </h3>
          <span className="badge badge-cyan">{ride?.status}</span>
        </div>
        <StatusTimeline currentStatus={ride?.status} />
      </div>

      {/* Main Tracking Grid (Map + Details) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* LEFT: Live Map Tracking */}
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Navigation size={16} color="var(--accent-cyan)" /> Live GPS Dispatch Visualizer
            </div>
            <span className="badge badge-success" style={{ fontSize: '11px' }}>
              ACTIVE GIS
            </span>
          </div>

          <RideMap
            pickupLat={ride?.pickupLatitude}
            pickupLon={ride?.pickupLongitude}
            destLat={ride?.destinationLatitude || ride?.dropoffLatitude}
            destLon={ride?.destinationLongitude || ride?.dropoffLongitude}
            pickupAddress={ride?.pickupAddress}
            dropAddress={ride?.dropAddress}
            driverLocation={
              driver && driver.latitude && driver.longitude
                ? { lat: driver.latitude, lng: driver.longitude, name: driver.name, vehicleType: driver.vehicleType }
                : null
            }
            height="400px"
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-dim)' }}>
            <span>🟢 Pickup: {ride?.pickupAddress?.split(',')[0]}</span>
            <span>🔴 Drop: {ride?.dropAddress?.split(',')[0]}</span>
          </div>
        </div>

        {/* RIGHT: Trip & Driver Specs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Route & Fare Card */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Navigation size={18} color="var(--accent-amber)" /> Trip & Fare Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Pickup Point</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{ride?.pickupAddress}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '2px', background: '#EF4444', marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Destination</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{ride?.dropAddress}</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(11, 15, 25, 0.8)', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', marginTop: 'auto' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Distance</div>
                <strong style={{ fontSize: '1.1rem' }}>{ride?.distance ? Number(ride.distance).toFixed(1) : '--'} km</strong>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Metered Fare</div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--accent-emerald)' }}>
                  ₹{ride?.fare ? Number(ride.fare).toFixed(2) : '--'}
                </strong>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Method</div>
                <strong style={{ fontSize: '1.1rem' }}>{ride?.paymentMethod || 'UPI'}</strong>
              </div>
            </div>

            {canCancel && (
              <button
                onClick={handleCancelRide}
                disabled={cancelling}
                className="btn btn-sm btn-danger"
                style={{ alignSelf: 'flex-start', gap: '6px', marginTop: '0.5rem' }}
              >
                <XCircle size={15} />
                <span>{cancelling ? 'Cancelling...' : 'Cancel Ride'}</span>
              </button>
            )}
          </div>

          {/* Assigned Driver Card */}
          <div>
            {driver ? (
              <DriverCard driver={driver} />
            ) : ride?.driverId ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <LoadingSpinner text={`Connecting with Driver #${ride.driverId}...`} size={20} />
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                <Clock size={32} style={{ color: 'var(--accent-amber)', margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Atomic Driver Search in Progress...</h4>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: 4 }}>
                  Driver Service (:8087) is evaluating closest spatial coordinates.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Receipt / Invoice Section */}
      {(ride?.status === 'PAID' || ride?.status === 'PAYMENT_PENDING' || ride?.status === 'TRIP_COMPLETED' || payment) && (
        <div className="card" style={{ padding: '24px', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <CreditCard size={18} color="var(--accent-emerald)" /> Official Digital Tax Invoice
            </h3>

            <button onClick={handlePrintReceipt} className="btn btn-sm btn-secondary" style={{ gap: '6px' }}>
              <FileText size={15} /> Print / Save Invoice
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(11, 15, 25, 0.8)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Invoice ID</span>
              <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>INV-UG-{ride?.id}092</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Settlement Status</span>
              <div style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{payment?.status || 'SETTLED'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Base Fare + GST</span>
              <div style={{ fontWeight: 700 }}>₹{ride?.fare ? (Number(ride.fare) * 0.95).toFixed(2) : '--'} + 5% GST</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Total Charged</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                ₹{ride?.fare ? Number(ride.fare).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety SOS Toolkit Modal */}
      {showSafetyModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Safety & SOS Toolkit</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Trip #{ride?.id} Active Shield</span>
                </div>
              </div>

              <button onClick={() => setShowSafetyModal(false)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#EF4444' }}>EMERGENCY DISPATCH</div>
                <div style={{ fontSize: '0.85rem', color: '#FFFFFF', marginTop: 2 }}>Direct 24/7 Police & Control Room Line</div>
                <a href="tel:112" className="btn btn-danger btn-sm" style={{ width: '100%', marginTop: '10px', fontWeight: 800 }}>
                  <Phone size={14} /> Call Police Helpline (112)
                </a>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Driver Verification PIN</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                  OTP: 4892
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Share this PIN only after boarding vehicle</div>
              </div>

              <button onClick={handleShareLiveTracking} className="btn btn-secondary" style={{ width: '100%' }}>
                <Share2 size={16} /> Share Live Ride Tracking Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideTrackingPage;
