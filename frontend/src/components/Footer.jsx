import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Phone,
  Mail,
  MapPin,
  Headphones,
  ShieldCheck,
  Clock,
  HelpCircle,
  MessageSquare,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const Footer = () => {
  const { isAdmin } = useAuth();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessageSent, setSupportMessageSent] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    setSupportMessageSent(true);
    setTimeout(() => {
      setSupportMessageSent(false);
      setShowSupportModal(false);
      setTicketSubject('');
      setTicketMessage('');
    }, 2000);
  };

  return (
    <footer className="site-footer">
      {/* 1. TOP CONTACT DETAILS BAR */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '16px 0'
      }}>
        <div className="wrap" style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Quick Helpline Hotline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Phone size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  24x7 Customer Care
                </div>
                <a href="tel:18002004543" style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', textDecoration: 'none' }}>
                  1800-200-GLIDE (Toll-Free)
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Mail size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Emergency & Support Email
                </div>
                <a href="mailto:support@urbanglide.com" style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
                  support@urbanglide.com
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MapPin size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Central Ops Command
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Benz Circle, Vijayawada, AP
                </span>
              </div>
            </div>
          </div>

          {/* Quick Support Dialog Trigger */}
          <button
            type="button"
            onClick={() => setShowSupportModal(true)}
            className="btn btn-sm btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: 700
            }}
          >
            <Headphones size={16} />
            <span>Open Help & Support Desk</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN FOOTER SITEMAP */}
      <div className="wrap" style={{ paddingTop: '36px', paddingBottom: '32px' }}>
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand" style={{ marginBottom: '10px' }}>
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 15l2.2-6.6A2 2 0 0 1 8.1 7h7.8a2 2 0 0 1 1.9 1.4L20 15" stroke="#1A1305" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="7.5" cy="16.5" r="1.6" fill="#1A1305"/>
                  <circle cx="16.5" cy="16.5" r="1.6" fill="#1A1305"/>
                  <path d="M4 15h16" stroke="#1A1305" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              UrbanGlide
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              A real-time ride dispatch and mobility orchestration platform, built on an enterprise microservices architecture with Eureka discovery, Resilience4j circuit breakers, and distributed transactional consistency.
            </p>
          </div>

          <div className="footer-col">
            <h5>Platform</h5>
            <a href="/#how">How it works</a>
            {isAdmin ? (
              <Link to="/architecture">Architecture & Telemetry</Link>
            ) : (
              <a href="/#architecture">Architecture Overview</a>
            )}
            <Link to="/book">Dispatch Console</Link>
            <Link to="/login?role=driver">Driver Fleet</Link>
          </div>

          <div className="footer-col">
            <h5>Microservices</h5>
            {isAdmin ? (
              <>
                <Link to="/architecture">API Gateway (:8080)</Link>
                <Link to="/architecture">Eureka Discovery (:8761)</Link>
                <Link to="/architecture">Ride Service (:8086)</Link>
                <Link to="/architecture">Driver Service (:8087)</Link>
                <Link to="/architecture">Payment Service (:8088)</Link>
              </>
            ) : (
              <>
                <a href="/#architecture">API Gateway (:8080)</a>
                <a href="/#architecture">Eureka Discovery (:8761)</a>
                <a href="/#architecture">Ride Service (:8086)</a>
                <a href="/#architecture">Driver Service (:8087)</a>
                <a href="/#architecture">Payment Service (:8088)</a>
              </>
            )}
          </div>

          <div className="footer-col">
            <h5>Accounts & Access</h5>
            <Link to="/login">Rider Portal</Link>
            <Link to="/login?role=driver">Driver Portal</Link>
            <Link to="/register">Register Account</Link>
            <Link to="/profile">Profile & Telemetry</Link>
          </div>

          <div className="footer-col">
            <h5>Support & Care</h5>
            <button
              type="button"
              onClick={() => setShowSupportModal(true)}
              style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', font: 'inherit', textAlign: 'left', cursor: 'pointer' }}
            >
              Customer Care Desk
            </button>
            <a href="tel:18002004543">1-800-200-GLIDE</a>
            <a href="mailto:support@urbanglide.com">support@urbanglide.com</a>
            <button
              type="button"
              onClick={() => setShowSupportModal(true)}
              style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', font: 'inherit', textAlign: 'left', cursor: 'pointer' }}
            >
              Ride Safety & SOS
            </button>
          </div>
        </div>

        <div className="footer-bottom" style={{ marginTop: '36px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <span>© 2026 UrbanGlide Mobility Orchestration System (PS018)</span>
          <span>Ride Service · Driver Service · Payment Service · API Gateway · Eureka · Auth</span>
        </div>
      </div>

      {/* 3. INTERACTIVE CUSTOMER CARE & SUPPORT MODAL */}
      {showSupportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="card" style={{
            maxWidth: 560,
            width: '100%',
            padding: '28px',
            background: 'var(--panel-2, #0f172a)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg, 16px)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Headphones size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Customer Care & Help Desk</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
                    Direct dispatch assistance & rider safety escalation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {supportMessageSent ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px'
              }}>
                <ShieldCheck size={48} style={{ color: '#10b981', margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                  Support Ticket Submitted!
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 380, margin: '0 auto' }}>
                  Ticket #UG-{Math.floor(100000 + Math.random() * 900000)} has been logged. Our dispatch operations team will reach out immediately.
                </p>
              </div>
            ) : (
              <div>
                {/* Emergency Hotline Banner */}
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '18px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 800 }}>EMERGENCY RIDE SOS</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>24/7 Police & Safety Helpline</div>
                  </div>
                  <a href="tel:112" className="btn btn-sm btn-danger" style={{ padding: '6px 14px', fontWeight: 800 }}>
                    Call 112
                  </a>
                </div>

                {/* Common Questions Pill List */}
                <div style={{ marginBottom: '18px' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                    Frequently Asked Questions
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      fontSize: '0.85rem'
                    }}>
                      <strong style={{ color: 'var(--color-primary)' }}>Q: How are fares calculated?</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                        Fares use base rates + Haversine GPS distance calculated with BigDecimal precision by FareCalculationService (:8086).
                      </div>
                    </div>

                    <div style={{
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      fontSize: '0.85rem'
                    }}>
                      <strong style={{ color: 'var(--color-primary)' }}>Q: How do drivers get reserved?</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                        Atomic updates reserve the nearest driver from AVAILABLE to BUSY, preventing double-booking across concurrent requests.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Message Form */}
                <form onSubmit={handleSupportSubmit}>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g. Fare discrepancy or lost item"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '18px' }}>
                    <label className="form-label">Message Details</label>
                    <textarea
                      required
                      rows={3}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Describe your issue with ride details..."
                      className="form-input"
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowSupportModal(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                      Submit Support Request
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
