import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Car,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const RegisterPage = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') === 'driver' ? 'DRIVER' : 'RIDER';

  const [activeTab, setActiveTab] = useState(initialRole);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'DRIVER') {
        await authService.registerDriver(username, email, password);
      } else {
        await authService.register(username, email, password);
      }

      success(`Account created successfully! Logging you in as ${activeTab}...`);
      const auth = await login(username, password);

      if (auth.role === 'DRIVER') {
        navigate('/driver');
      } else {
        navigate('/book');
      }
    } catch (err) {
      const msg = err.message || 'Registration failed. Please check your credentials.';
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
              Create an Account
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Register as a passenger or onboard as a fleet driver
            </p>
          </div>

          {/* Role Tabs */}
          <div className="tabs-nav">
            <button
              type="button"
              onClick={() => { setActiveTab('RIDER'); setError(''); }}
              className={`tab-btn ${activeTab === 'RIDER' ? 'active rider' : ''}`}
            >
              <Compass size={16} /> Register Rider
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('DRIVER'); setError(''); }}
              className={`tab-btn ${activeTab === 'DRIVER' ? 'active driver' : ''}`}
            >
              <Car size={16} /> Register Driver
            </button>
          </div>

          {error && <ErrorMessage message={error} />}

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                placeholder="e.g. user_raj"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="e.g. user@example.com"
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
                placeholder="Minimum 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn btn-lg ${activeTab === 'DRIVER' ? 'btn-amber' : 'btn-primary'}`}
              style={{ width: '100%', fontWeight: 800 }}
            >
              {loading ? (
                <LoadingSpinner size={18} text="Provisioning account in urban_auth_db..." />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span>Register as {activeTab}</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to={activeTab === 'DRIVER' ? '/login?role=driver' : '/login'} style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
