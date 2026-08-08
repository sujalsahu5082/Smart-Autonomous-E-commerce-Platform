import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="pt-5 pb-3 mt-auto">
      <div className="container">
        <div className="row g-4">

          {/* Brand Column */}
          <div className="col-md-4">
            <div className="footer-brand text-white mb-3 d-flex align-items-center gap-2">
              <i className="fa-solid fa-bolt" style={{ color: '#fbbf24' }}></i>
              Smart E-Commerce
            </div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', lineHeight: 1.7 }}>
              Your one-stop destination for electronics, fashion, home appliances, and unbeatable online deals — delivered fast.
            </p>
            <div className="d-flex gap-3 mt-4">
              {[
                { icon: 'fab fa-twitter', color: '#38bdf8' },
                { icon: 'fab fa-instagram', color: '#f472b6' },
                { icon: 'fab fa-facebook', color: '#60a5fa' },
                { icon: 'fab fa-youtube', color: '#f87171' },
              ].map((s, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    width: 38, height: 38,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: s.color,
                    transition: 'all 0.25s ease',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <i className={s.icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 col-6">
            <h6 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Quick Links
            </h6>
            <ul className="list-unstyled" style={{ fontSize: '0.88rem' }}>
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'All Products' },
                { to: '/cart', label: 'Shopping Cart' },
                { to: '/wishlist', label: 'My Wishlist' },
                { to: '/orders', label: 'My Orders' },
              ].map((link) => (
                <li key={link.to} className="mb-2">
                  <Link
                    to={link.to}
                    style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s ease' }}
                    onMouseEnter={e => e.target.style.color = '#38bdf8'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
                  >
                    <i className="fa-solid fa-chevron-right me-2" style={{ fontSize: '0.65rem', color: '#6366f1' }}></i>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div className="col-md-4 col-6">
            <h6 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Support
            </h6>
            <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)' }}>
              {[
                { icon: 'fa-envelope', text: 'support@smartecommerce.com', color: '#818cf8' },
                { icon: 'fa-phone', text: '+1 800 123 4567', color: '#34d399' },
                { icon: 'fa-location-dot', text: '123 Tech Park, Silicon Valley', color: '#f472b6' },
              ].map((item, i) => (
                <p key={i} className="mb-3 d-flex align-items-start gap-2">
                  <i className={`fa-solid ${item.icon} mt-1`} style={{ color: item.color, width: '16px' }}></i>
                  <span>{item.text}</span>
                </p>
              ))}
            </div>
          </div>
        </div>

        <hr className="footer-divider my-4" />

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', margin: 0 }}>
            &copy; {new Date().getFullYear()} Smart E-Commerce. All rights reserved.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', margin: 0 }}>
            Made with <i className="fa-solid fa-heart" style={{ color: '#f472b6', fontSize: '0.75rem' }}></i> for great shopping
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
