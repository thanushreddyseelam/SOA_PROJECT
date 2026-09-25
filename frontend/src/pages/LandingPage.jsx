import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Server,
  Layers,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  Cpu,
  Activity,
  CreditCard,
  Radio,
  Lock,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const POPULAR_ROUTES = [
  { pickup: 'PVP Square Mall, MG Road', drop: 'Vijayawada Railway Station', dist: 3.4 },
  { pickup: 'Benz Circle, Ring Road', drop: 'Gannavaram Airport', dist: 18.2 },
  { pickup: 'Pandit Nehru Bus Station (PNBS)', drop: 'Kanaka Durga Temple', dist: 2.8 },
  { pickup: 'AP Secretariat, Amaravati', drop: 'Benz Circle Hub', dist: 16.5 },
];

const VEHICLE_ESTIMATES = [
  { id: 'AUTO', name: 'Urban Auto', icon: '🛺', multiplier: 0.65, eta: '2 min' },
  { id: 'HATCHBACK', name: 'Urban Go', icon: '🚗', multiplier: 1.0, eta: '4 min' },
  { id: 'SEDAN', name: 'Prime Sedan', icon: '🚕', multiplier: 1.35, eta: '3 min' },
  { id: 'SUV', name: 'Urban SUV XL', icon: '🚙', multiplier: 1.8, eta: '6 min' },
];

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState('HATCHBACK');

  const currentRoute = POPULAR_ROUTES[selectedRouteIdx];
  const vehicleObj = VEHICLE_ESTIMATES.find(v => v.id === selectedVehicle) || VEHICLE_ESTIMATES[1];
  const calculatedFare = Math.round((45 + currentRoute.dist * 14.5) * vehicleObj.multiplier);

  const handleStartBooking = () => {
    if (isAuthenticated) {
      navigate('/book');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-view" style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
      {/* 1. HERO SECTION */}
      <section className="hero" style={{ paddingTop: '40px' }}>
        <div className="wrap">
          {/* Top Live Telemetry Bar */}
          <div className="telemetry-ticker" style={{ marginBottom: '40px' }}>
            <div className="ticker-item">
              <span className="pulse-dot online" />
              <span style={{ color: 'var(--text-secondary)' }}>EUREKA CLUSTER:</span>
              <strong style={{ color: 'var(--accent-emerald-light)' }}>HEALTHY (:8761)</strong>
            </div>

            <div className="ticker-item">
              <Zap size={15} color="var(--accent-amber)" />
              <span style={{ color: 'var(--text-secondary)' }}>GATEWAY LATENCY:</span>
              <strong style={{ color: '#FFFFFF' }}>12ms (Spring Cloud :8080)</strong>
            </div>

            <div className="ticker-item">
              <ShieldCheck size={15} color="var(--accent-cyan)" />
              <span style={{ color: 'var(--text-secondary)' }}>SECURITY:</span>
              <strong style={{ color: 'var(--accent-cyan-light)' }}>JWT HMAC-SHA256</strong>
            </div>

            <div className="ticker-item">
              <Activity size={15} color="var(--accent-emerald)" />
              <span style={{ color: 'var(--text-secondary)' }}>DISPATCH ENGINE:</span>
              <strong style={{ color: '#FFFFFF' }}>ATOMIC LOCKING (0-RACE)</strong>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '56px',
            alignItems: 'center'
          }}>
            {/* Left Content */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', padding: '6px 14px', borderRadius: '30px', marginBottom: '24px' }}>
                <Sparkles size={15} color="var(--accent-cyan-light)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Next-Gen Urban Mobility Engine
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.5rem, 4.5vw, 3.8rem)',
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
                fontWeight: 800,
                marginBottom: '20px',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Real-Time Ride Dispatch at City Scale.
              </h1>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.65, marginBottom: '32px', maxWidth: '540px' }}>
                UrbanGlide orchestrates real-time driver allocation, live GPS geospatial tracking, and automated ledger settlement through autonomous microservices engineered for high availability and zero single points of failure.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={handleStartBooking} className="btn btn-primary btn-lg">
                  <span>{isAuthenticated ? 'Open Dispatch Console' : 'Book a Ride Now'}</span>
                  <ArrowRight size={18} />
                </button>
                <a href="#estimator" className="btn btn-ghost btn-lg">
                  Estimate Live Fare
                </a>
              </div>
            </div>

            {/* Right Interactive Fare & Route Preview Calculator */}
            <div id="estimator" className="card card-elevated" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Instant Estimator
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Trip & Fare Calculator</h3>
                </div>
                <span className="badge badge-green">LIVE PREVIEW</span>
              </div>

              {/* Route Selector Chips */}
              <div style={{ marginBottom: '18px' }}>
                <label className="form-label">Select City Hub Route</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {POPULAR_ROUTES.map((rt, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedRouteIdx(idx)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: selectedRouteIdx === idx ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${selectedRouteIdx === idx ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        <span style={{ color: '#10B981' }}>●</span> {rt.pickup.split(',')[0]} ➔ <span style={{ color: '#EF4444' }}>●</span> {rt.drop.split(',')[0]}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        {rt.dist} km
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle Tier Selector */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Vehicle Tier</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {VEHICLE_ESTIMATES.map((veh) => (
                    <div
                      key={veh.id}
                      onClick={() => setSelectedVehicle(veh.id)}
                      style={{
                        padding: '10px 6px',
                        borderRadius: 'var(--radius-sm)',
                        background: selectedVehicle === veh.id ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${selectedVehicle === veh.id ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div style={{ fontSize: '1.4rem' }}>{veh.icon}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, marginTop: 4 }}>{veh.name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)' }}>{veh.eta}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fare Output Strip */}
              <div style={{
                background: 'rgba(11, 15, 25, 0.9)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Estimated Fare (Incl. Taxes)
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                    ₹{calculatedFare}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Precision Rate</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                    BigDecimal Settle
                  </div>
                </div>
              </div>

              <button onClick={handleStartBooking} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontWeight: 800 }}>
                <span>Proceed to Book {vehicleObj.name}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE-STEP DISPATCH LIFECYCLE */}
      <section id="how" style={{ padding: '40px 0' }}>
        <div className="wrap">
          <div style={{ maxWidth: '640px', marginBottom: '48px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
              DISTRIBUTED EVENT LIFECYCLE
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              From GPS Request to Settled Receipt.
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '12px', fontSize: '1.02rem', lineHeight: 1.6 }}>
              Every trip passes through autonomous microservices in sequence, isolating failure domains so payment processing never impacts dispatch throughput.
            </p>
          </div>

          <div className="grid-3">
            <div className="card" style={{ padding: '28px', borderTop: '3px solid var(--accent-cyan)' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <Compass size={22} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                PHASE 01 · RIDE SERVICE (:8086)
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '8px 0 12px 0' }}>
                Spatial Booking Intake
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Validates the JWT session at API Gateway, calculates Haversine distance, and creates a trip record in <code>urban_ride_db</code>.
              </p>
            </div>

            <div className="card" style={{ padding: '28px', borderTop: '3px solid var(--accent-amber)' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <Car size={22} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
                PHASE 02 · DRIVER FLEET (:8087)
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '8px 0 12px 0' }}>
                Atomic Driver Locking
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Locates the nearest available vehicle and executes an atomic reservation (AVAILABLE ➔ BUSY), preventing double-booking race conditions.
              </p>
            </div>

            <div className="card" style={{ padding: '28px', borderTop: '3px solid var(--accent-emerald)' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <CreditCard size={22} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                PHASE 03 · PAYMENT ENGINE (:8088)
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '8px 0 12px 0' }}>
                Automated Ledger Settle
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Upon drop-off, metered fares are calculated with BigDecimal accuracy, charged via UPI/Card, and logged into <code>urban_payment_db</code>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ARCHITECTURE OVERVIEW */}
      <section id="architecture" style={{
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(3, 7, 18, 0.9) 100%)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '80px 0'
      }}>
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                SYSTEM TOPOGRAPHY
              </span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '20px' }}>
                Engineered for High Concurrency & Zero Downtime.
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px' }}>
                UrbanGlide separates concerns into six microservices, leveraging Spring Cloud API Gateway for security enforcement, Netflix Eureka for virtual service registry, and Resilience4j for circuit breaking.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ✓
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Decoupled Database-per-Service schemas</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ✓
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Client-side load balancing via Spring Cloud LoadBalancer</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ✓
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Cryptographic JWT validation on perimeter Gateway</span>
                </div>
              </div>
            </div>

            {/* Architecture Node Grid */}
            <div className="card" style={{ padding: '24px', background: 'rgba(11, 15, 25, 0.95)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '16px', textTransform: 'uppercase' }}>
                Service Node Cluster Map
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-cyan)' }}>api-gateway</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Routing, JWT Filter & CORS</div>
                  </div>
                  <span className="badge badge-cyan">:8080</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-emerald)' }}>eureka-server</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Service Registry & Heartbeats</div>
                  </div>
                  <span className="badge badge-green">:8761</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-amber)' }}>ride-service</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Bookings & Haversine Distance</div>
                  </div>
                  <span className="badge badge-amber">:8086</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <strong style={{ color: '#A5B4FC' }}>driver-service</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Atomic Locking & Fleet GIS</div>
                  </div>
                  <span className="badge badge-purple">:8087</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <strong style={{ color: '#34D399' }}>payment-service</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>BigDecimal Fare Ledger & Refunds</div>
                  </div>
                  <span className="badge badge-green">:8088</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. READY TO DISPATCH CALLOUT */}
      <section style={{ paddingBottom: '40px' }}>
        <div className="wrap">
          <div className="card card-elevated" style={{
            padding: '48px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
            background: 'radial-gradient(ellipse at 100% 0%, rgba(245, 158, 11, 0.12) 0%, transparent 60%), var(--bg-card)'
          }}>
            <div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>
                Experience Enterprise Mobility Today
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '520px' }}>
                Dispatch your first ride across Vijayawada or onboard as a registered fleet driver.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button onClick={handleStartBooking} className="btn btn-primary btn-lg">
                <span>Book a Ride</span>
                <ArrowRight size={18} />
              </button>
              <Link to="/login?role=driver" className="btn btn-ghost btn-lg">
                Driver Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
