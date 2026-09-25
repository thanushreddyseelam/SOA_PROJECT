import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  Compass,
  History,
  CreditCard,
  Layers,
  LogOut,
  User,
  ShieldCheck,
  Gauge,
  Menu,
  X,
  LogIn,
  Activity,
  Zap,
  Server
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isDriver, isRider, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="site-header">
      <nav className="wrap nav-wrap">
        {/* Brand Logo with Glow */}
        <Link to="/" className="brand" onClick={() => setMobileOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path d="M4 15l2.2-6.6A2 2 0 0 1 8.1 7h7.8a2 2 0 0 1 1.9 1.4L20 15" stroke="#030712" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="7.5" cy="16.5" r="1.6" fill="#030712"/>
              <circle cx="16.5" cy="16.5" r="1.6" fill="#030712"/>
              <path d="M4 15h16" stroke="#030712" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ lineHeight: 1 }}>UrbanGlide</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--accent-amber)', letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase' }}>
              Mobility OS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links">
          {/* Public Link */}
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>

          {/* RIDER-SPECIFIC NAVIGATION */}
          {isAuthenticated && (isRider || isAdmin) && (
            <>
              <NavLink to="/book" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Compass size={16} />
                <span>Book Ride</span>
              </NavLink>
              <NavLink to="/rides" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <History size={16} />
                <span>My Trips</span>
              </NavLink>
              <NavLink to="/payments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <CreditCard size={16} />
                <span>Payments</span>
              </NavLink>
            </>
          )}

          {/* DRIVER-SPECIFIC NAVIGATION */}
          {isAuthenticated && (isDriver || isAdmin) && (
            <NavLink to="/driver" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Gauge size={16} />
              <span>Driver Console</span>
              <span className="badge badge-amber" style={{ fontSize: '0.62rem', padding: '1px 5px', marginLeft: 2 }}>
                FLEET
              </span>
            </NavLink>
          )}

          {/* ADMIN-SPECIFIC NAVIGATION */}
          {isAuthenticated && isAdmin && (
            <>
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <ShieldCheck size={16} color="#A5B4FC" />
                <span>Command Center</span>
              </NavLink>
              <NavLink to="/architecture" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Layers size={16} />
                <span>Architecture</span>
                <span className="pulse-dot online" style={{ marginLeft: 2 }} title="Cluster Live" />
              </NavLink>
            </>
          )}

          {/* GUEST NAVIGATION */}
          {!isAuthenticated && (
            <>
              <a href="/#how" className="nav-link">How it works</a>
              <a href="/#architecture" className="nav-link">Architecture</a>
              <NavLink to="/login?role=driver" className="nav-link">Driver Portal</NavLink>
            </>
          )}
        </div>

        {/* CTA & User Profile Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Live Cluster Health Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: '#34D399'
          }}>
            <span className="pulse-dot online" />
            <span style={{ fontWeight: 600 }}>GATEWAY :8080</span>
          </div>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/profile" className="btn btn-ghost btn-sm" style={{ gap: '8px', padding: '6px 14px' }}>
                <User size={15} color={isAdmin ? '#A5B4FC' : isDriver ? 'var(--accent-amber)' : 'var(--accent-cyan)'} />
                <span style={{ fontWeight: 700 }}>{user?.username}</span>
                <span className={`badge ${isAdmin ? 'badge-purple' : isDriver ? 'badge-amber' : 'badge-cyan'}`} style={{ fontSize: '0.62rem' }}>
                  {user?.role}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                title="Sign Out"
                style={{ padding: '6px 10px', color: 'var(--text-dim)' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link to="/login?role=driver" className="btn btn-ghost btn-sm">
                Driver Sign In
              </Link>
              <Link to="/login" className="btn btn-primary btn-sm">
                Rider Sign In
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
