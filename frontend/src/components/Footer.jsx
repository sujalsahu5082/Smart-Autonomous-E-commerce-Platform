import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  const quickLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'All Products' },
    { to: '/cart', label: 'Shopping Cart' },
    { to: '/wishlist', label: 'My Wishlist' },
    { to: '/orders', label: 'My Orders' },
    { to: '/profile', label: 'My Account' },
  ];

  const helpLinks = [
    { to: '/login', label: 'Sign In' },
    { to: '/register', label: 'Create Account' },
    { to: '/forgot-password', label: 'Reset Password' },
    { to: '/orders', label: 'Track Order' },
    { to: '/adminlogin', label: 'Admin Portal' },
  ];

  const socials = [
    { icon: 'fab fa-twitter', color: '#38bdf8', href: '#' },
    { icon: 'fab fa-instagram', color: '#f472b6', href: '#' },
    { icon: 'fab fa-facebook', color: '#60a5fa', href: '#' },
    { icon: 'fab fa-youtube', color: '#f87171', href: '#' },
    { icon: 'fab fa-whatsapp', color: '#4ade80', href: '#' },
  ];

  const paymentMethods = [
    { icon: 'fa-credit-card', label: 'Visa / MC' },
    { icon: 'fa-mobile-screen-button', label: 'UPI' },
    { icon: 'fa-wallet', label: 'Wallets' },
    { icon: 'fa-building-columns', label: 'Net Banking' },
    { icon: 'fa-money-bill-wave', label: 'COD' },
  ];

  return (
    <footer>
      {/* ── Footer Top ── */}
      <div className="footer-top">
        <div className="container">
          <div className="row g-4">

            {/* Brand Column */}
            <div className="col-md-4 col-lg-3">
              <div className="footer-logo-text">
                <i className="fa-solid fa-bolt logo-accent"></i>
                Smart<span className="logo-accent">Shop</span>
              </div>
              <p className="footer-desc">
                Your one-stop destination for electronics, fashion, home appliances, and unbeatable online deals — delivered fast across India.
              </p>

              {/* Social Icons */}
              <div className="d-flex flex-wrap">
                {socials.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    className="footer-social-btn"
                    style={{ color: s.color }}
                    aria-label={s.icon}
                  >
                    <i className={s.icon}></i>
                  </a>
                ))}
              </div>

              {/* App download hint */}
              <div
                style={{
                  marginTop: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <i className="fa-solid fa-mobile-screen" style={{ color: '#FF9F00', fontSize: '1.4rem' }}></i>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>Download the app</div>
                  <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 700 }}>Shop on the go</div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-md-2 col-6">
              <div className="footer-col-title">Shop</div>
              {quickLinks.map((l) => (
                <Link key={l.to} to={l.to} className="footer-link">
                  <i className="fa-solid fa-angle-right me-2" style={{ fontSize: '0.65rem', color: '#FF9F00' }}></i>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Help Links */}
            <div className="col-md-2 col-6">
              <div className="footer-col-title">Help</div>
              {helpLinks.map((l) => (
                <Link key={l.to} to={l.to} className="footer-link">
                  <i className="fa-solid fa-angle-right me-2" style={{ fontSize: '0.65rem', color: '#FF9F00' }}></i>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Contact & Info */}
            <div className="col-md-4 col-lg-5">
              <div className="footer-col-title">Contact Us</div>
              <div style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.55)' }}>
                {[
                  { icon: 'fa-envelope', text: 'support@smartshop.in', color: '#818cf8' },
                  { icon: 'fa-phone', text: '1800-123-4567 (Toll Free)', color: '#34d399' },
                  { icon: 'fa-location-dot', text: 'SmartShop HQ, Tech Park, Bengaluru — 560001', color: '#f472b6' },
                  { icon: 'fa-clock', text: 'Mon–Sat: 9 AM – 8 PM IST', color: '#FB923C' },
                ].map((item, i) => (
                  <p key={i} className="mb-3 d-flex align-items-start gap-2">
                    <i className={`fa-solid ${item.icon} mt-1`} style={{ color: item.color, width: 16, flexShrink: 0 }}></i>
                    <span>{item.text}</span>
                  </p>
                ))}
              </div>

              {/* Trust Badges */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '12px 16px',
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                {[
                  { icon: 'fa-shield-halved', label: '100% Secure', color: '#4ade80' },
                  { icon: 'fa-rotate-left', label: 'Easy Returns', color: '#60a5fa' },
                  { icon: 'fa-truck-fast', label: 'Fast Delivery', color: '#FF9F00' },
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>
                    <i className={`fa-solid ${b.icon}`} style={{ color: b.color }}></i>
                    {b.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <hr className="footer-divider my-4" />
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginRight: 6 }}>
              <i className="fa-solid fa-lock me-1"></i> Safe & Secure Payments:
            </span>
            {paymentMethods.map((p, i) => (
              <span key={i} className="footer-payment-badge">
                <i className={`fa-solid ${p.icon}`}></i>
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer Bottom Strip ── */}
      <div className="footer-bottom-strip">
        <div className="container d-flex flex-wrap justify-content-between align-items-center gap-2">
          <p className="footer-legal mb-0">
            © {year} SmartShop India Pvt. Ltd. All rights reserved.
          </p>
          <div className="d-flex gap-3">
            {['Privacy Policy', 'Terms of Use', 'Shipping Policy', 'Grievance Redressal'].map((t) => (
              <a key={t} href="#" className="footer-legal" style={{ textDecoration: 'none' }}>
                {t}
              </a>
            ))}
          </div>
          <p className="footer-legal mb-0">
            Made with <i className="fa-solid fa-heart" style={{ color: '#f472b6', fontSize: '0.7rem' }}></i> in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
