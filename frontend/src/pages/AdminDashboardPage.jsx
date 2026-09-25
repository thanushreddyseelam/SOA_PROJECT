import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { systemService } from '../services/systemService';
import { driverService } from '../services/driverService';
import { rideService } from '../services/rideService';
import { ServiceCard } from '../components/ServiceCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Server,
  Activity,
  Layers,
  Cpu,
  RefreshCw,
  Car,
  Users,
  CreditCard,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Lock,
  ArrowRight,
  Database,
  Workflow
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { success, info, error: toastError } = useToast();
  const [healthData, setHealthData] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [allRides, setAllRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [securityTestResult, setSecurityTestResult] = useState(null);
  const [securityTesting, setSecurityTesting] = useState(false);

  const fetchAdminData = async () => {
    setError('');
    try {
      // 1. Fetch system health for all 6 microservices
      const health = await systemService.checkAllHealth();
      setHealthData(health || []);

      // 2. Fetch driver fleet
      try {
        const driverList = await driverService.getAllDrivers();
        setDrivers(Array.isArray(driverList) ? driverList : []);
      } catch (err) {
        console.warn('Could not fetch drivers:', err);
      }

      // 3. Fetch recent platform rides if available
      try {
        // Fetch rider rides or available demo trips
        const rides = await rideService.getRidesByRider(1);
        setAllRides(Array.isArray(rides) ? rides : []);
      } catch (err) {
        console.warn('Could not fetch rides:', err);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch admin system telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    info('Polling Eureka cluster and microservices registry...');
    fetchAdminData();
  };

  const runSecurityAuditTest = async () => {
    setSecurityTesting(true);
    setSecurityTestResult(null);
    try {
      // Test unauthenticated call to /rides/1 (expect 401)
      const res = await fetch('http://localhost:8080/rides/1');
      const data = await res.json().catch(() => ({}));
      const passed = res.status === 401;
      setSecurityTestResult({
        test: 'Unauthenticated Request to /rides/1',
        expected: '401 Unauthorized',
        actualStatus: res.status,
        passed,
        response: data
      });
      if (passed) {
        success('Security Assertion PASSED: 401 Unauthorized enforced by API Gateway');
      } else {
        toastError(`Security Assertion FAILED: Received ${res.status}`);
      }
    } catch (err) {
      setSecurityTestResult({
        test: 'Unauthenticated Request to /rides/1',
        expected: '401 Unauthorized',
        actualStatus: 'Error / Gateway offline',
        passed: false,
        response: { message: err.message }
      });
      toastError('Security test error: Gateway unreachable');
    } finally {
      setSecurityTesting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Polling Microservices & Eureka Registry (:8761)..." />;
  }

  const onlineServicesCount = healthData.filter(s => s.status === 'UP').length;
  const availableDriversCount = drivers.filter(d => d.status === 'AVAILABLE' || d.availability).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.05) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        borderRadius: '16px',
        padding: '1.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={24} color="#A78BFA" />
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              System Command Center
            </h1>
            <span className="badge badge-purple" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
              ADMIN PRIVILEGES
            </span>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Real-Time Microservices Topology, Eureka Service Registry, Fleet Telemetry & Gateway Security Policy Enforcement.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={handleManualRefresh}
            className="btn btn-ghost"
            disabled={refreshing}
            style={{ gap: '0.5rem', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Syncing...' : 'Sync Registry'}
          </button>
          <Link to="/architecture" className="btn btn-amber" style={{ gap: '0.5rem', background: '#8B5CF6', borderColor: '#8B5CF6', color: '#fff' }}>
            <Layers size={16} />
            Explore 3D Architecture
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Top Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem'
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Active Microservices</span>
            <Server size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: onlineServicesCount === 6 ? '#10B981' : '#F59E0B' }}>
            {onlineServicesCount} / 6
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {onlineServicesCount === 6 ? 'All services healthy & registered with Eureka' : 'Checking pending instances'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Registered Fleet Size</span>
            <Car size={18} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38BDF8' }}>
            {drivers.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {availableDriversCount} Available for Immediate Dispatch
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>API Gateway Port</span>
            <Radio size={18} color="#A78BFA" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#A78BFA' }}>
            :8080
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            JWT Filter + Route Stripping Active
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Discovery Registry</span>
            <Database size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B' }}>
            :8761
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Eureka Server Cluster Live
          </div>
        </div>
      </div>

      {/* Section 1: Microservices Health Matrix */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#fff' }}>
              Microservices Cluster Telemetry
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Live health checks across all Spring Boot services connected via Spring Cloud Gateway
            </p>
          </div>
          <span className="pulse-dot online" />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '1.25rem'
        }}>
          {healthData.map((service, idx) => (
            <ServiceCard key={idx} service={service} />
          ))}
        </div>
      </div>

      {/* Section 2: Global Fleet Management */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Car size={20} color="#FFB800" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              Global Fleet Management (`/drivers`)
            </h2>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {drivers.length} registered driver vehicles
          </span>
        </div>

        {drivers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No drivers registered yet. Use Postman or Driver Console to register drivers.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>ID</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Name</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Phone</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Vehicle Number</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Vehicle Type</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>GPS Coordinates</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map(drv => (
                  <tr key={drv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>#{drv.id}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{drv.name}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{drv.phone || 'N/A'}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                        {drv.vehicleNumber || 'N/A'}
                      </code>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className="badge badge-amber">{drv.vehicleType || 'SEDAN'}</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {drv.latitude && drv.longitude ? `${drv.latitude.toFixed(4)}, ${drv.longitude.toFixed(4)}` : 'Awaiting GPS ping'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`badge ${drv.status === 'AVAILABLE' ? 'badge-green' : drv.status === 'BUSY' ? 'badge-amber' : 'badge-danger'}`}>
                        {drv.status || (drv.availability ? 'AVAILABLE' : 'OFFLINE')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3: Live Security & RBAC Console */}
      <div className="card" style={{ padding: '1.5rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} color="#A78BFA" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              Live Security & RBAC Policy Audit
            </h2>
          </div>
          <button
            onClick={runSecurityAuditTest}
            className="btn btn-ghost btn-sm"
            disabled={securityTesting}
            style={{ gap: '0.4rem', borderColor: 'rgba(139, 92, 246, 0.4)', color: '#A78BFA' }}
          >
            <ShieldCheck size={15} />
            {securityTesting ? 'Testing Gateway Filter...' : 'Run Security Policy Test'}
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
          Validates that Spring Cloud Gateway's <code>JwtAuthenticationFilter</code> intercepts unauthenticated requests and rejects them with <code>401 Unauthorized</code> before reaching downstream microservices.
        </p>

        {securityTestResult && (
          <div style={{
            background: securityTestResult.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${securityTestResult.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {securityTestResult.passed ? (
                <CheckCircle2 size={18} color="#10B981" />
              ) : (
                <AlertTriangle size={18} color="#EF4444" />
              )}
              <span style={{ fontWeight: 700, color: securityTestResult.passed ? '#10B981' : '#EF4444' }}>
                {securityTestResult.passed ? 'Security Assertion Passed' : 'Security Assertion Failed'}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong>Test:</strong> {securityTestResult.test} | <strong>Expected:</strong> {securityTestResult.expected} | <strong>Actual Status:</strong> {securityTestResult.actualStatus}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
