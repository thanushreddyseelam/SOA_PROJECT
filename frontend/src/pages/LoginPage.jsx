import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  Car,
  Compass,
  Zap,
  Sparkles,
  CheckCircle2,
  Key
} from 'lucide-react';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const LoginPage = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') === 'driver' ? 'DRIVER' : 'RIDER';

  const [activeTab, setActiveTab] = useState(initialRole);
  const [username, setUsername] = useState(initialRole === 'DRIVER' ? 'driver_raju' : 'rider_john');
  const [password, setPassword] = useState('rider123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (role) => {
    setActiveTab(role);
    setError('');
    if (role === 'RIDER') {
      setUsername('rider_john');
      setPassword('rider123');
    } else if (role === 'DRIVER') {
      setUsername('driver_raju');
      setPassword('driver123');
    } else if (role === 'ADMIN') {
      setUsername('admin');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(username, password);
      success(`Welcome back, ${response.username}! Authenticated as ${response.role}.`);

      if (response.role === 'DRIVER') {
        navigate('/driver');
      } else if (response.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/book');
      }
    } catch (err) {
      const msg = err.message || 'Invalid username or password. Please try again.';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <div className="card card-elevated" style={{ padding: '36px' }}>
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div className="brand" style={{ justifyContent: 'center', marginBottom: '12px' }}>
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                  <path d="M4 15l2.2-6.6A2 2 0 0 1 8.1 7h7.8a2 2 0 0 1 1.9 1.4L20 15" stroke="#030712" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="7.5" cy="16.5" r="1.6" fill="#030712"/>
                  <circle cx="16.5" cy="16.5" r="1.6" fill="#030712"/>
                  <path d="M4 15h16" stroke="#030712" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </span>
              UrbanGlide
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '4px 0' }}>
              Sign In to Your Portal
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Authenticate cryptographically via API Gateway (:8080)
            </p>
          </div>

          {/* Role Tabs */}
          <div className="tabs-nav">
            <button
              type="button"
              onClick={() => handleTabChange('RIDER')}
              className={`tab-btn ${activeTab === 'RIDER' ? 'active rider' : ''}`}
            >
              <Compass size={16} /> Rider
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('DRIVER')}
              className={`tab-btn ${activeTab === 'DRIVER' ? 'active driver' : ''}`}
            >
              <Car size={16} /> Driver
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('ADMIN')}
              className={`tab-btn ${activeTab === 'ADMIN' ? 'active admin' : ''}`}
            >
              <ShieldCheck size={16} /> Admin
            </button>
          </div>

          {error && <ErrorMessage message={error} />}

          {/* Quick Pre-fill helper badge */}
          <div style={{
            background: 'rgba(11, 15, 25, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem'
          }}>
            <span style={{ color: 'var(--text-dim)' }}>
              Demo profile loaded: <strong style={{ color: '#FFFFFF' }}>{username}</strong>
            </span>
            <span className={`badge ${activeTab === 'ADMIN' ? 'badge-purple' : activeTab === 'DRIVER' ? 'badge-amber' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
              {activeTab}
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                placeholder="Enter username"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn btn-lg ${activeTab === 'DRIVER' ? 'btn-amber' : activeTab === 'ADMIN' ? 'btn-cyan' : 'btn-primary'}`}
              style={{ width: '100%', fontWeight: 800 }}
            >
              {loading ? (
                <LoadingSpinner size={18} text="Authenticating with Auth Service..." />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span>Sign In as {activeTab}</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to={activeTab === 'DRIVER' ? '/register?role=driver' : '/register'} style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
