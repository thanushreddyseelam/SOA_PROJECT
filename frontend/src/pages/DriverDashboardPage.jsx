import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { driverService } from '../services/driverService';
import { rideService } from '../services/rideService';
import { authService } from '../services/authService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  Gauge,
  Car,
  MapPin,
  CheckCircle2,
  Play,
  Check,
  RefreshCw,
  Radio,
  Navigation,
  DollarSign,
  Star,
  Power,
  ShieldCheck,
  Lock,
  Edit3,
  X,
  Phone,
  User,
  Sliders
} from 'lucide-react';

const VIJAYAWADA_PINS = [
  { name: 'Benz Circle Hub', lat: 16.5193, lon: 80.6305 },
  { name: 'PVP Square Mall', lat: 16.5062, lon: 80.6480 },
  { name: 'Railway Station Stand', lat: 16.5181, lon: 80.6192 },
  { name: 'Gannavaram Airport Gate', lat: 16.5304, lon: 80.7968 },
];

export const DriverDashboardPage = () => {
  const { user, isAdmin, isDriver } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(user?.userId || 1);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [assignedRides, setAssignedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Secure Profile Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editVehicleNumber, setEditVehicleNumber] = useState('');
  const [editVehicleType, setEditVehicleType] = useState('SEDAN');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const fetchDriverData = async () => {
    setLoading(true);
    setError('');
    try {
      const activeId = user?.userId || selectedDriverId || 1;
      
      // If admin, also fetch the full fleet list for administrative oversight
      if (isAdmin) {
        const fleet = await driverService.getAllDrivers();
        setDrivers(Array.isArray(fleet) ? fleet : []);
      }

      // Fetch the specific authenticated driver's entity
      const driverData = await driverService.getDriverById(activeId);
      if (driverData) {
        setSelectedDriverId(driverData.id);
        setSelectedDriver(driverData);
        setEditName(driverData.name || '');
        setEditPhone(driverData.phone || '');
        setEditVehicleNumber(driverData.vehicleNumber || '');
        setEditVehicleType(driverData.vehicleType || 'SEDAN');
        await fetchDriverRides(driverData.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to Driver Service (:8087) via API Gateway.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverRides = async (driverId) => {
    try {
      const rides = await rideService.getRidesByDriver(driverId);
      setAssignedRides(Array.isArray(rides) ? rides : []);
    } catch (err) {
      console.warn('Could not fetch rides for driver:', err);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, [user?.userId]);

  // Admin-only fleet switcher
  const handleAdminSelectDriver = async (driver) => {
    if (!isAdmin) return;
    setSelectedDriverId(driver.id);
    setSelectedDriver(driver);
    setEditName(driver.name || '');
    setEditPhone(driver.phone || '');
    setEditVehicleNumber(driver.vehicleNumber || '');
    setEditVehicleType(driver.vehicleType || 'SEDAN');
    setSuccessMsg('');
    await fetchDriverRides(driver.id);
    info(`Admin inspected driver profile: ${driver.name}`);
  };

  const handleToggleStatus = async (newStatus) => {
    if (!selectedDriver) return;
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const updated = await driverService.updateStatus(selectedDriver.id, newStatus);
      setSelectedDriver(updated);
      const msg = `Driver status switched to ${newStatus}`;
      setSuccessMsg(msg);
      success(msg);
    } catch (err) {
      const errMsg = err.message || 'Failed to update status.';
      setError(errMsg);
      toastError(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateGPS = async (pin) => {
    if (!selectedDriver) return;
    setActionLoading(true);
    try {
      const updated = await driverService.updateLocation(selectedDriver.id, pin.lat, pin.lon);
      setSelectedDriver(updated);
      const msg = `GPS Location updated to ${pin.name} (${pin.lat}, ${pin.lon})`;
      setSuccessMsg(msg);
      success(msg);
    } catch (err) {
      toastError(err.message || 'Could not update GPS location');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdvanceRideStatus = async (rideId, action) => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (action === 'ARRIVE') {
        await rideService.driverArrived(rideId);
        success(`Ride #${rideId} status updated: Driver Arrived at pickup`);
      } else if (action === 'START') {
        await rideService.startRide(rideId);
        success(`Trip #${rideId} started! Meter is active.`);
      } else if (action === 'COMPLETE') {
        await rideService.completeRide(rideId);
        success(`Trip #${rideId} completed! Automated fare settlement dispatched.`);
      }

      if (selectedDriver) {
        await fetchDriverRides(selectedDriver.id);
        const updatedDriver = await driverService.getDriverById(selectedDriver.id);
        if (updatedDriver) setSelectedDriver(updatedDriver);
      }
    } catch (err) {
      const errMsg = err.message || `Failed to perform ${action} on ride.`;
      setError(errMsg);
      toastError(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  // Secure Driver Profile Update with Password Verification
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!confirmPassword) {
      setEditError('Current password is required to verify your identity before updating profile credentials.');
      return;
    }

    setEditSaving(true);
    try {
      // Step 1: Verify current driver password via AuthService
      await authService.login(user?.username, confirmPassword);

      // Step 2: Save updated driver profile in Driver Service
      const updated = await driverService.updateProfile(selectedDriver.id, {
        name: editName,
        phone: editPhone,
        vehicleNumber: editVehicleNumber,
        vehicleType: editVehicleType
      });

      setSelectedDriver(updated);
      setShowEditModal(false);
      setConfirmPassword('');
      const msg = 'Driver profile & vehicle credentials updated securely!';
      setSuccessMsg(msg);
      success(msg);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please verify your password.';
      setEditError(msg);
      toastError(msg);
    } finally {
      setEditSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to Driver Fleet Service (:8087)..." />;
  }

  const activeTrip = assignedRides.find(
    r => ['DRIVER_ASSIGNED', 'DRIVER_ACCEPTED', 'DRIVER_ARRIVED', 'TRIP_STARTED'].includes(r.status)
  );

  const completedCount = assignedRides.filter(r => r.status === 'TRIP_COMPLETED' || r.status === 'PAID').length;
  const totalEarnings = completedCount * 145 + 50;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Telemetry Banner */}
      <div className="card card-elevated" style={{
        padding: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        background: 'radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.08) 0%, transparent 60%), var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--accent-amber), #D97706)',
            color: '#030712',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)'
          }}>
            <Gauge size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Fleet Operations Hub
              </span>
              <span className="badge badge-amber">AUTHENTICATED DRIVER</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '2px 0 4px 0' }}>
              {selectedDriver ? selectedDriver.name : user?.username}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Driver ID #{selectedDriver?.id} · Vehicle: <strong>{selectedDriver?.vehicleType}</strong> ({selectedDriver?.vehicleNumber}) · Tel: {selectedDriver?.phone}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Edit Profile Button */}
          <button
            onClick={() => { setShowEditModal(true); setEditError(''); }}
            className="btn btn-secondary"
            style={{ gap: '8px' }}
          >
            <Edit3 size={16} color="var(--accent-amber)" />
            <span>Edit Vehicle & Profile</span>
          </button>

          {/* Online/Offline Master Switch */}
          <button
            onClick={() => handleToggleStatus(selectedDriver?.status === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE')}
            disabled={actionLoading || !selectedDriver}
            className={`btn ${selectedDriver?.status === 'AVAILABLE' ? 'btn-teal' : 'btn-secondary'}`}
            style={{ fontWeight: 800, gap: '10px' }}
          >
            <Power size={18} />
            <span>{selectedDriver?.status === 'AVAILABLE' ? 'ONLINE (READY)' : 'GO ONLINE'}</span>
          </button>

          <button onClick={fetchDriverData} className="btn btn-secondary" title="Refresh Fleet State">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
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

      {/* Driver Stats Grid */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-value">₹{totalEarnings}</div>
            <div className="stat-label">Shift Earnings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">{completedCount}</div>
            <div className="stat-label">Trips Completed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4' }}>
            <Star size={24} />
          </div>
          <div>
            <div className="stat-value">4.92 ★</div>
            <div className="stat-label">Driver Rating</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
            <Radio size={24} />
          </div>
          <div>
            <div className="stat-value">{selectedDriver?.status || 'OFFLINE'}</div>
            <div className="stat-label">Active State</div>
          </div>
        </div>
      </div>

      {/* Active Dispatched Trip Alert */}
      {activeTrip && (
        <div className="card" style={{
          padding: '24px',
          border: '1px solid var(--accent-amber)',
          background: 'rgba(245, 158, 11, 0.05)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--accent-amber)',
                color: '#030712',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800
              }}>
                <Navigation size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                    Active Trip #{activeTrip.id} Assigned
                  </h3>
                  <span className="badge badge-amber">{activeTrip.status}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
                  Passenger ID #{activeTrip.riderId} · Estimated Fare: ₹{activeTrip.fare || '150.00'}
                </p>
              </div>
            </div>

            {/* Action Buttons Workflow */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {activeTrip.status === 'DRIVER_ASSIGNED' && (
                <button
                  onClick={() => handleAdvanceRideStatus(activeTrip.id, 'ARRIVE')}
                  disabled={actionLoading}
                  className="btn btn-primary"
                >
                  <MapPin size={16} /> Mark Arrived at Pickup
                </button>
              )}

              {activeTrip.status === 'DRIVER_ARRIVED' && (
                <button
                  onClick={() => handleAdvanceRideStatus(activeTrip.id, 'START')}
                  disabled={actionLoading}
                  className="btn btn-teal"
                >
                  <Play size={16} /> Start Trip (Start Meter)
                </button>
              )}

              {activeTrip.status === 'TRIP_STARTED' && (
                <button
                  onClick={() => handleAdvanceRideStatus(activeTrip.id, 'COMPLETE')}
                  disabled={actionLoading}
                  className="btn btn-teal"
                >
                  <Check size={16} /> Complete Trip & Settle Fare
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', background: 'rgba(11, 15, 25, 0.7)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Pickup Location</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#10B981' }}>{activeTrip.pickupAddress}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Drop-off Destination</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#EF4444' }}>{activeTrip.dropAddress}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Payment Method</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>{activeTrip.paymentMethod || 'UPI'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Authenticated Driver Credentials + GPS Simulator (+ Admin fleet supervisor if ADMIN) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Authenticated Profile Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--accent-amber)" /> Authenticated Driver Identity
            </h3>
            <span className="badge badge-green">VERIFIED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(11, 15, 25, 0.7)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Driver Name</span>
                <strong style={{ color: '#FFFFFF' }}>{selectedDriver?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Phone Number</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{selectedDriver?.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Assigned Vehicle</span>
                <span className="badge badge-amber">{selectedDriver?.vehicleType} · {selectedDriver?.vehicleNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Current Coordinates</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8' }}>
                  {selectedDriver?.latitude?.toFixed(4)}, {selectedDriver?.longitude?.toFixed(4)}
                </span>
              </div>
            </div>

            <button
              onClick={() => { setShowEditModal(true); setEditError(''); }}
              className="btn btn-outline btn-sm"
              style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
            >
              <Lock size={14} color="var(--accent-amber)" /> Update Vehicle Plate & Profile (Password Protected)
            </button>
          </div>

          {/* Admin Fleet Supervisor Switcher (Only visible to Admin) */}
          {isAdmin && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-indigo)', textTransform: 'uppercase', marginBottom: '10px' }}>
                Admin Fleet Supervisor Inspector
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: 180, overflowY: 'auto' }}>
                {drivers.map(d => (
                  <div
                    key={d.id}
                    onClick={() => handleAdminSelectDriver(d)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: selectedDriverId === d.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${selectedDriverId === d.id ? 'var(--accent-indigo)' : 'transparent'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem'
                    }}
                  >
                    <span>{d.name} ({d.vehicleType})</span>
                    <span className="badge badge-sm">{d.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* GPS Radar Simulator */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={18} color="var(--accent-cyan)" /> Fast GPS Telemetry Relocation
          </h3>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Simulate relocation of your vehicle to high-demand Vijayawada transit corridors to test Haversine dispatch:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {VIJAYAWADA_PINS.map((pin, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSimulateGPS(pin)}
                disabled={actionLoading || !selectedDriver}
                className="btn btn-secondary btn-sm"
                style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', textAlign: 'left' }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#FFFFFF' }}>{pin.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  {pin.lat.toFixed(3)}, {pin.lon.toFixed(3)}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECURE PROFILE EDIT MODAL */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="card card-elevated" style={{
            maxWidth: 520,
            width: '100%',
            padding: '28px',
            border: '1px solid var(--accent-amber)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lock size={20} color="var(--accent-amber)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Secure Driver Profile Settings</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {editError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                color: '#F87171',
                fontSize: '0.85rem',
                marginBottom: '16px'
              }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Driver Full Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Vehicle Tier
                  </label>
                  <select
                    className="input-field"
                    value={editVehicleType}
                    onChange={(e) => setEditVehicleType(e.target.value)}
                  >
                    <option value="AUTO">Urban Auto</option>
                    <option value="SEDAN">Prime Sedan</option>
                    <option value="GO">Urban Go</option>
                    <option value="SUV">SUV XL</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Vehicle Plate / Registration Number
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={editVehicleNumber}
                  onChange={(e) => setEditVehicleNumber(e.target.value)}
                  placeholder="e.g. AP-16-UG-9988"
                  required
                />
              </div>

              {/* Password Verification Field */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                marginTop: '6px'
              }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 6 }}>
                  <Lock size={14} /> Current Password (Required to Verify Identity)
                </label>
                <input
                  type="password"
                  className="input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter your account password to authorize changes"
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4, display: 'block' }}>
                  Prevents unauthorized modifications to your vehicle fleet profile.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                  disabled={editSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editSaving}
                  style={{ gap: '8px' }}
                >
                  {editSaving ? 'Verifying...' : 'Save Verified Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboardPage;
