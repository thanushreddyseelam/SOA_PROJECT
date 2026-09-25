import React, { useState, useEffect } from 'react';
import { systemService } from '../services/systemService';
import { ServiceCard } from '../components/ServiceCard';
import {
  Layers,
  Server,
  Database,
  Radio,
  RefreshCw,
  ShieldCheck,
  Zap,
  Cpu,
  Compass,
  CreditCard,
  Car,
  Key,
  Network
} from 'lucide-react';

export const ArchitecturePage = () => {
  const [serviceStatus, setServiceStatus] = useState({
    gateway: 'CHECKING',
    eureka: 'CHECKING',
    auth: 'CHECKING',
    driver: 'CHECKING',
    ride: 'CHECKING',
    payment: 'CHECKING'
  });
  const [refreshing, setRefreshing] = useState(false);
  const [routes, setRoutes] = useState([]);

  const checkAllServices = async () => {
    setRefreshing(true);
    setServiceStatus({
      gateway: 'CHECKING',
      eureka: 'CHECKING',
      auth: 'CHECKING',
      driver: 'CHECKING',
      ride: 'CHECKING',
      payment: 'CHECKING'
    });

    try {
      const [gateway, eureka, auth, driver, ride, payment] = await Promise.all([
        systemService.checkGatewayHealth(),
        systemService.checkEurekaHealth(),
        systemService.checkAuthServiceHealth(),
        systemService.checkDriverServiceHealth(),
        systemService.checkRideServiceHealth(),
        systemService.checkPaymentServiceHealth()
      ]);

      setServiceStatus({
        gateway: gateway ? 'UP' : 'DOWN',
        eureka: eureka ? 'UP' : 'DOWN',
        auth: auth ? 'UP' : 'DOWN',
        driver: driver ? 'UP' : 'DOWN',
        ride: ride ? 'UP' : 'DOWN',
        payment: payment ? 'UP' : 'DOWN'
      });

      const gatewayRoutes = await systemService.getGatewayRoutes();
      setRoutes(Array.isArray(gatewayRoutes) ? gatewayRoutes : []);
    } catch {
      // Ignore health check errors
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkAllServices();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textTransform: 'uppercase', fontWeight: 700 }}>
              System Topography & Health
            </span>
            <span className="badge badge-success">LIVE TELEMETRY</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Microservices Architecture</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Interactive architectural blueprint of the UrbanGlide Real-Time Mobility & Dispatch Orchestration System (PS018).
          </p>
        </div>

        <button onClick={checkAllServices} disabled={refreshing} className="btn btn-sm btn-secondary">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Probing Nodes...' : 'Recheck Health'}
        </button>
      </div>

      {/* Visual Architectural Hierarchy Diagram */}
      <div className="card" style={{ padding: '2rem', background: 'linear-gradient(145deg, #131d31, #0a0f1d)', border: '1px solid var(--border-subtle)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Network size={20} style={{ color: 'var(--color-primary)' }} /> Distributed Call Topology
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          {/* Level 1: Client */}
          <div style={{
            background: 'var(--bg-card-subtle)',
            border: '2px solid var(--color-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 2rem',
            fontWeight: 700,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 0 20px var(--color-primary-glow)'
          }}>
            <Cpu size={18} style={{ color: 'var(--color-primary)' }} />
            React.js Client Application (Port :5173)
          </div>

          <div style={{ width: 2, height: 24, background: 'rgba(255, 255, 255, 0.2)' }} />

          {/* Level 2: API Gateway */}
          <div style={{
            background: 'var(--bg-card-subtle)',
            border: '2px solid var(--color-info)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 2.5rem',
            textAlign: 'center',
            boxShadow: '0 0 20px var(--color-info-bg)'
          }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>Spring Cloud API Gateway (:8080)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>
              Reverse Proxy • JWT Verification • CORS • Route Predicates
            </div>
          </div>

          <div style={{ width: 2, height: 24, background: 'rgba(255, 255, 255, 0.2)' }} />

          {/* Level 3: Eureka Registry */}
          <div style={{
            background: 'var(--bg-card-subtle)',
            border: '2px solid var(--color-purple)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 2rem',
            textAlign: 'center',
            boxShadow: '0 0 20px var(--color-purple-bg)'
          }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>Netflix Eureka Server (:8761)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>
              Dynamic Service Discovery & Client-Side Load Balancing
            </div>
          </div>

          <div style={{ width: 2, height: 24, background: 'rgba(255, 255, 255, 0.2)' }} />

          {/* Level 4: Microservices Layer */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', width: '100%' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem', textAlign: 'center' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Auth Service</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>:8090 • JWT Auth</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-info)', marginTop: 4 }}>urban_auth_db</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem', textAlign: 'center' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Driver Service</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>:8087 • Atomic Lock</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-info)', marginTop: 4 }}>urban_driver_db</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem', textAlign: 'center' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Ride Service</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>:8086 • Feign + CB</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-info)', marginTop: 4 }}>urban_ride_db</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem', textAlign: 'center' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Payment Service</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>:8088 • Precision</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-info)', marginTop: 4 }}>urban_payment_db</div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Microservice Nodes Grid */}
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1rem' }}>
          Microservice Node Roster & Health
        </h2>

        <div className="grid-3">
          {/* API Gateway */}
          <ServiceCard
            name="API Gateway"
            port="8080"
            role="Centralized reverse proxy entry point. Handles CORS, JWT token verification, role enforcement, and downstream routing."
            routePrefix="[All Routes -> lb://*]"
            techStack="Spring Cloud Gateway, Netty Reactive"
            status={serviceStatus.gateway}
            icon={Server}
          />

          {/* Eureka Server */}
          <ServiceCard
            name="Eureka Registry"
            port="8761"
            role="Service registry and discovery backbone. Monitors service instances via heartbeats and facilitates client-side load balancing."
            routePrefix="http://localhost:8761/eureka"
            techStack="Netflix Eureka, Spring Cloud Netflix"
            status={serviceStatus.eureka}
            icon={Radio}
          />

          {/* Auth Service */}
          <ServiceCard
            name="Auth Service"
            port="8090"
            role="Manages user credentials, password encryption, and signs HMAC-SHA256 JWT tokens. Enforces RIDER-only public registrations."
            routePrefix="/auth/**"
            database="urban_auth_db (MySQL)"
            techStack="Spring Security, jjwt, BCrypt, JPA"
            status={serviceStatus.auth}
            icon={Key}
          />

          {/* Driver Service */}
          <ServiceCard
            name="Driver Service"
            port="8087"
            role="Maintains driver fleet telemetry, GPS coordinates, and provides atomic single-query driver reservation to eliminate booking races."
            routePrefix="/drivers/**"
            database="urban_driver_db (MySQL)"
            techStack="Spring Data JPA, Haversine Engine"
            status={serviceStatus.driver}
            icon={Car}
          />

          {/* Ride Service */}
          <ServiceCard
            name="Ride Service"
            port="8086"
            role="Coordinates the 9-state ride lifecycle, dynamic fare calculation, and inter-service communication with Driver and Payment services."
            routePrefix="/rides/**"
            database="urban_ride_db (MySQL)"
            techStack="OpenFeign, Resilience4j Circuit Breaker"
            status={serviceStatus.ride}
            icon={Compass}
          />

          {/* Payment Service */}
          <ServiceCard
            name="Payment Service"
            port="8088"
            role="Processes automated fare deductions with BigDecimal financial precision, creates audit transaction IDs, and processes refunds."
            routePrefix="/payments/**"
            database="urban_payment_db (MySQL)"
            techStack="Spring Data JPA, BigDecimal Precision"
            status={serviceStatus.payment}
            icon={CreditCard}
          />
        </div>
      </div>

      {/* Demonstration Viva Guide Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(16, 185, 129, 0.08))', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} style={{ color: 'var(--color-primary)' }} /> Viva & Academic Demonstration Checklist
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div><strong>1. Gateway Routing:</strong> Show that React calls only port <code>:8080</code>. Gateway validates the JWT and routes via Eureka.</div>
            <div><strong>2. Atomic Dispatch:</strong> Demonstrate that booking a ride invokes atomic SQL update in Driver Service, preventing double-assignment.</div>
            <div><strong>3. Circuit Breaker:</strong> Demonstrate Resilience4j fallback if Payment Service or Driver Service is paused.</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div><strong>4. State Machine:</strong> Walk through <code>REQUESTED ➔ ASSIGNED ➔ ACCEPTED ➔ ARRIVED ➔ STARTED ➔ COMPLETED ➔ PAID</code>.</div>
            <div><strong>5. Financial Accuracy:</strong> Show <code>BigDecimal</code> 2-decimal fare calculation and automated transaction ID generation.</div>
            <div><strong>6. Database Separation:</strong> Show independent MySQL databases for Auth, Driver, Ride, and Payment services.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
