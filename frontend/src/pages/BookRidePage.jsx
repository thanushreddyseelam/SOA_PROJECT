import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { rideService } from '../services/rideService';
import { driverService } from '../services/driverService';
import {
  MapPin,
  Navigation,
  CreditCard,
  Car,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Tag,
  ChevronRight,
  Radio,
  Sliders,
  Percent,
  Check
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { RideMap } from '../components/RideMap';

// City Landmarks in Vijayawada
const CITY_LANDMARKS = [
  { name: 'PVP Square Mall, MG Road', lat: 16.5062, lon: 80.6480, tag: 'Shopping' },
  { name: 'Benz Circle, Ring Road', lat: 16.5193, lon: 80.6305, tag: 'Hub' },
  { name: 'Vijayawada Railway Station', lat: 16.5181, lon: 80.6192, tag: 'Transit' },
  { name: 'Pandit Nehru Bus Station (PNBS)', lat: 16.5108, lon: 80.6154, tag: 'Transit' },
  { name: 'Gannavaram International Airport', lat: 16.5304, lon: 80.7968, tag: 'Airport' },
  { name: 'Kanaka Durga Temple, Indrakeeladri', lat: 16.5152, lon: 80.6052, tag: 'Attraction' },
  { name: 'AP Secretariat, Amaravati', lat: 16.5418, lon: 80.5158, tag: 'Govt Hub' }
];

// Vehicle Categories
const RIDE_OPTIONS = [
  {
    id: 'AUTO',
    name: 'Urban Auto',
    subtitle: 'Fast city trips, low metered fare',
    icon: '🛺',
    multiplier: 0.65,
    eta: '2 min',
    capacity: 3,
    badge: 'POPULAR'
  },
  {
    id: 'HATCHBACK',
    name: 'Urban Go',
    subtitle: 'Affordable, air-conditioned compacts',
    icon: '🚗',
    multiplier: 1.0,
    eta: '3 min',
    capacity: 4,
    badge: 'FASTEST'
  },
  {
    id: 'SEDAN',
    name: 'Prime Sedan',
    subtitle: 'Top-rated drivers with spacious sedans',
    icon: '🚕',
    multiplier: 1.35,
    eta: '4 min',
    capacity: 4,
    badge: 'TOP RATED'
  },
  {
    id: 'SUV',
    name: 'Urban SUV XL',
    subtitle: 'Premium 6-seater for family & luggage',
    icon: '🚙',
    multiplier: 1.8,
    eta: '6 min',
    capacity: 6,
    badge: 'PREMIUM'
  }
];

export const BookRidePage = () => {
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();
  const navigate = useNavigate();

  const [pickupAddress, setPickupAddress] = useState(CITY_LANDMARKS[0].name);
  const [pickupLat, setPickupLat] = useState(CITY_LANDMARKS[0].lat);
  const [pickupLon, setPickupLon] = useState(CITY_LANDMARKS[0].lon);

  const [dropAddress, setDropAddress] = useState(CITY_LANDMARKS[1].name);
  const [destLat, setDestLat] = useState(CITY_LANDMARKS[1].lat);
  const [destLon, setDestLon] = useState(CITY_LANDMARKS[1].lon);

  const [selectedVehicle, setSelectedVehicle] = useState('HATCHBACK');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [promoCode, setPromoCode] = useState('URBAN50');
  const [promoApplied, setPromoApplied] = useState(true);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matchingStep, setMatchingStep] = useState(0); // 0=idle, 1=finding, 2=matched
  const [error, setError] = useState('');

  // Fetch live drivers from Driver Service
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const drivers = await driverService.getAvailableDrivers();
        if (Array.isArray(drivers)) {
          setAvailableDrivers(drivers);
        }
      } catch {
        // graceful fallback
      }
    };
    fetchDrivers();
  }, []);

  // Distance estimation using Haversine
  const calculateDistance = () => {
    const dLat = (destLat - pickupLat) * (Math.PI / 180);
    const dLng = (destLon - pickupLon) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pickupLat * (Math.PI / 180)) *
        Math.cos(destLat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = 6371 * c;
    return Math.max(1.2, Number(dist.toFixed(1)));
  };

  const distanceKm = calculateDistance();
  const baseRate = 45 + distanceKm * 14.5;
  const currentTier = RIDE_OPTIONS.find((r) => r.id === selectedVehicle) || RIDE_OPTIONS[1];
  const grossFare = Math.round(baseRate * currentTier.multiplier);
  const discountAmount = promoApplied ? (promoCode === 'URBAN50' ? Math.min(50, Math.round(grossFare * 0.25)) : 25) : 0;
  const netFare = Math.max(30, grossFare - discountAmount);

  const handleSelectPickup = (item) => {
    setPickupAddress(item.name);
    setPickupLat(item.lat);
    setPickupLon(item.lon);
    info(`Pickup updated: ${item.name.split(',')[0]}`);
  };

  const handleSelectDrop = (item) => {
    setDropAddress(item.name);
    setDestLat(item.lat);
    setDestLon(item.lon);
    info(`Drop-off updated: ${item.name.split(',')[0]}`);
  };

  const handleMapLocationSelect = (lat, lon, mode) => {
    if (mode === 'pickup') {
      setPickupLat(lat);
      setPickupLon(lon);
      setPickupAddress(`GPS Pin (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
    } else {
      setDestLat(lat);
      setDestLon(lon);
      setDropAddress(`GPS Pin (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
    }
    info('Custom location pinned on GPS map');
  };

  const handleApplyPromo = (code) => {
    setPromoCode(code);
    setPromoApplied(true);
    success(`Promo code ${code} applied successfully!`);
  };

  const handleBookRide = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setMatchingStep(1); // "Contacting nearest driver..."

    try {
      const payload = {
        riderId: user?.userId || 1,
        pickupAddress,
        dropAddress,
        pickupLocation: pickupAddress,
        dropoffLocation: dropAddress,
        pickupLatitude: pickupLat,
        pickupLongitude: pickupLon,
        destinationLatitude: destLat,
        destinationLongitude: destLon,
        dropoffLatitude: destLat,
        dropoffLongitude: destLon,
        vehicleType: selectedVehicle,
        paymentMethod: paymentMethod
      };

      const response = await rideService.bookRide(payload);
      setMatchingStep(2); // "Driver matched!"
      success(`Ride #${response?.id || 'New'} confirmed! Driver assigned atomically.`);

      setTimeout(() => {
        if (response && response.id) {
          navigate(`/rides/${response.id}`);
        } else {
          navigate('/rides');
        }
      }, 1200);
    } catch (err) {
      setMatchingStep(0);
      const errMsg = err.message || 'Unable to book ride. Please verify microservices are online.';
      setError(errMsg);
      toastError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1360, margin: '0 auto', padding: '0 16px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(380px, 480px) 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Uber-Style Booking Sheet */}
        <div className="card card-elevated" style={{ padding: '28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-amber)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Instant Dispatch
              </span>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                Request a Ride
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.12)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <span className="pulse-dot online" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D399' }}>
                {availableDrivers.length > 0 ? `${availableDrivers.length} Cabs Nearby` : 'Fleet Active'}
              </span>
            </div>
          </div>

          {error && <ErrorMessage message={error} />}

          {/* Form */}
          <form onSubmit={handleBookRide}>
            {/* Location Input Bar */}
            <div style={{
              background: 'rgba(11, 15, 25, 0.85)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '16px',
              position: 'relative'
            }}>
              {/* Pickup field */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', flexShrink: 0, boxShadow: '0 0 10px #10B981' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>PICKUP LOCATION</div>
                  <input
                    type="text"
                    required
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      outline: 'none',
                      marginTop: '2px'
                    }}
                    placeholder="Enter pickup address"
                  />
                </div>
              </div>

              {/* Connecting line */}
              <div style={{
                position: 'absolute',
                left: '20px',
                top: '36px',
                bottom: '36px',
                width: '2px',
                background: 'linear-gradient(to bottom, #10B981, #EF4444)',
                zIndex: 1
              }} />

              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 0 12px 22px' }} />

              {/* Dropoff field */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '2px', background: '#EF4444', flexShrink: 0, boxShadow: '0 0 10px #EF4444' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>WHERE TO? (DESTINATION)</div>
                  <input
                    type="text"
                    required
                    value={dropAddress}
                    onChange={(e) => setDropAddress(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      outline: 'none',
                      marginTop: '2px'
                    }}
                    placeholder="Enter destination"
                  />
                </div>
              </div>
            </div>

            {/* Quick Destination Chips */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                Quick City Landmarks
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {CITY_LANDMARKS.slice(0, 4).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDrop(item)}
                    className="quick-chip"
                  >
                    <span>{item.name.split(',')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Tier Selector */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Select Vehicle Class
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
                  Est. Distance: {distanceKm} km
                </span>
              </div>

              <div className="ride-tier-grid">
                {RIDE_OPTIONS.map((opt) => {
                  const fareEst = Math.round(baseRate * opt.multiplier) - discountAmount;
                  const isSelected = selectedVehicle === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedVehicle(opt.id)}
                      className={`ride-tier-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '1.8rem' }}>{opt.icon}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>{opt.name}</strong>
                            <span className="badge badge-amber" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                              {opt.eta}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{opt.subtitle}</p>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isSelected ? 'var(--accent-amber)' : '#FFFFFF' }}>
                          ₹{Math.max(30, fareEst)}
                        </div>
                        {promoApplied && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                            ₹{discountAmount} off
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment & Promo Strip */}
            <div style={{
              background: 'rgba(11, 15, 25, 0.85)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={18} color="var(--accent-amber)" />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="UPI" style={{ background: '#0F172A' }}>UPI (Google Pay / PhonePe)</option>
                  <option value="CARD" style={{ background: '#0F172A' }}>Credit / Debit Card</option>
                  <option value="CASH" style={{ background: '#0F172A' }}>Cash on Drop</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={14} color="var(--accent-emerald)" />
                <span style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 700 }}>
                  {promoCode} Applied (-₹{discountAmount})
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                fontWeight: 800,
                letterSpacing: '0.02em',
                padding: '16px'
              }}
            >
              {loading ? (
                <LoadingSpinner size={20} text={matchingStep === 1 ? 'Dispatching via Gateway (:8080)...' : 'Connecting to Driver...'} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span>REQUEST {currentTier.name.toUpperCase()} (₹{netFare})</span>
                  <ArrowRight size={20} />
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Right Live Interactive Map */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div className="card" style={{ padding: '0', overflow: 'hidden', height: '640px', position: 'relative' }}>
            {/* Floating Map Status Overlay */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              zIndex: 500,
              background: 'rgba(11, 15, 25, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-card)'
            }}>
              <Compass size={18} color="var(--accent-amber)" />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Live Spatial GIS Radar
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  Vijayawada City Grid (:8087)
                </div>
              </div>
            </div>

            <RideMap
              pickupLat={pickupLat}
              pickupLon={pickupLon}
              destLat={destLat}
              destLon={destLon}
              drivers={availableDrivers}
              pickupAddress={pickupAddress}
              dropAddress={dropAddress}
              onLocationSelect={handleMapLocationSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookRidePage;
