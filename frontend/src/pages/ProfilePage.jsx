import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { User, Mail, Key, Copy, Check, Lock, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const ProfilePage = () => {
  const { user, token } = useAuth();
  const { success, error: toastError } = useToast();
  const [copied, setCopied] = useState(false);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      success('JWT Bearer token copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword.length < 4) {
      setPwdError('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwdError('New password and confirm password do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setPwdSuccess('Password changed successfully! Your account credentials are secure.');
      success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update password. Please check your current password.';
      setPwdError(msg);
      toastError(msg);
    } finally {
      setPwdLoading(false);
    }
  };

  let tokenClaims = null;
  try {
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        tokenClaims = JSON.parse(atob(parts[1]));
      }
    }
  } catch {
    // Parsing error non-critical
  }

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Security & Identity
          </span>
          <span className="badge badge-cyan">JWT AUTHENTICATED</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '2px 0 0 0' }}>User Profile & Security Management</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Identity provisioned in <code>urban_auth_db</code> and validated via Spring Cloud API Gateway (:8080).
        </p>
      </div>

      {/* Profile Summary Card */}
      <div className="card card-elevated" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            fontWeight: 800,
            boxShadow: '0 8px 24px rgba(6, 182, 212, 0.35)'
          }}>
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{user?.username}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 4 }}>
              <span className={`badge ${user?.role === 'ADMIN' ? 'badge-purple' : user?.role === 'DRIVER' ? 'badge-amber' : 'badge-cyan'}`}>
                {user?.role}
              </span>
              {user?.userId && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  User ID: #{user.userId}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(11, 15, 25, 0.8)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-sm)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          fontSize: '0.9rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
              Registered Email
            </div>
            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: 4 }}>
              <Mail size={15} color="var(--accent-cyan)" />
              {user?.email || `${user?.username}@urbanglide.com`}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
              Session Status
            </div>
            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: 4, color: 'var(--accent-emerald)' }}>
              <ShieldCheck size={16} /> Authenticated Active
            </div>
          </div>
        </div>
      </div>

      {/* Change Password & Security Management */}
      <div className="card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Lock size={20} color="var(--accent-amber)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Change Account Password</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Verify your current credentials before setting a new password. All requests are hashed using BCrypt in <code>auth-service</code>.
        </p>

        {pwdError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            color: '#F87171',
            fontSize: '0.88rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} /> {pwdError}
          </div>
        )}

        {pwdSuccess && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            color: '#34D399',
            fontSize: '0.88rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} /> {pwdSuccess}
          </div>
        )}

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: 500 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Current Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                New Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Min. 4 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Confirm New Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: '8px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={pwdLoading}
              style={{ gap: '8px' }}
            >
              {pwdLoading ? 'Updating Credentials...' : 'Update Password Securely'}
            </button>
          </div>
        </form>
      </div>

      {/* JWT Token Claims Inspector */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Key size={18} color="var(--accent-amber)" /> Cryptographic JWT Claims Inspector
          </h3>

          <button onClick={handleCopyToken} className="btn btn-sm btn-outline" style={{ gap: '6px' }}>
            {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy Bearer Token'}
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          This token is verified cryptographically by <strong>API Gateway (:8080)</strong> via <code>JwtAuthenticationFilter</code> before injecting downstream user headers.
        </p>

        {tokenClaims && (
          <div style={{ background: 'rgba(11, 15, 25, 0.8)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Subject (sub):</span>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{tokenClaims.sub}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Authorized Role:</span>
                <div style={{ color: 'var(--accent-amber)', fontWeight: 800, marginTop: 2 }}>{tokenClaims.role}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Expiration (exp):</span>
                <div style={{ fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {tokenClaims.exp ? new Date(tokenClaims.exp * 1000).toLocaleTimeString() : '--'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: '#02050E', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
          <code style={{ fontSize: '0.75rem', color: '#94a3b8', wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>
            {token || 'No active JWT token found.'}
          </code>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
