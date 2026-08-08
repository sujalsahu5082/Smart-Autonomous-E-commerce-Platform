import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Profile = () => {
  const { activeUser, orders, wishlist } = useStore();
  const navigate = useNavigate();

  if (!activeUser) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '65vh' }}>
        <div className="empty-state-card" style={{ maxWidth: 380, width: '100%' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <i className="fa-solid fa-user-slash" style={{ fontSize: '2rem', color: '#6366f1' }}></i>
          </div>
          <h5 className="fw-bold mb-2">Not Logged In</h5>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>Please log in to view your profile and account details.</p>
          <button className="btn btn-primary mt-2 px-4" onClick={() => navigate('/login')}>
            <i className="fa-solid fa-right-to-bracket me-2"></i>Login Now
          </button>
        </div>
      </div>
    );
  }

  const myOrdersCount = orders.filter((o) => o.userId === activeUser.id).length;

  const infoItems = [
    { icon: 'fa-phone', label: 'Phone', value: activeUser.phone || 'Not provided', color: '#6366f1' },
    { icon: 'fa-envelope', label: 'Email', value: activeUser.email, color: '#0ea5e9' },
    { icon: 'fa-location-dot', label: 'Address', value: activeUser.address || 'Not provided', color: '#f472b6' },
  ];

  return (
    <div className="container py-5">
      <div className="row g-4">

        {/* ── User Card ── */}
        <div className="col-md-4">
          <div className="card text-center p-4" style={{ borderRadius: '22px' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 16px' }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #4338ca)',
                padding: '3px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img
                  src="/Images/profile.png"
                  alt="Profile"
                  style={{
                    width: '94px', height: '94px', borderRadius: '50%',
                    objectFit: 'cover', background: '#ffffff',
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <span style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 16, height: 16, borderRadius: '50%',
                background: '#10b981', border: '2px solid #ffffff',
              }}></span>
            </div>

            <h5 className="fw-bold mb-1" style={{ color: '#0f172a' }}>{activeUser.name}</h5>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '12px' }}>{activeUser.email}</p>

            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
              color: '#4f46e5', borderRadius: '999px',
              padding: '5px 18px', fontSize: '0.78rem', fontWeight: 700,
              border: '1px solid #c7d2fe', marginBottom: '20px',
            }}>
              <i className="fa-solid fa-star me-1" style={{ fontSize: '0.7rem' }}></i>
              Customer Account
            </span>

            <Link to="/personal-info" className="btn btn-outline-primary fw-semibold w-100" style={{ borderRadius: '12px' }}>
              <i className="fa-solid fa-pen-to-square me-2"></i>Edit Profile
            </Link>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="col-md-8">
          {/* Stat tiles */}
          <div className="row g-3 mb-4">
            {[
              {
                label: 'My Orders', value: myOrdersCount, icon: 'fa-box-open',
                to: '/orders', linkLabel: 'View History',
                grad: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                glow: 'rgba(79,70,229,0.3)',
              },
              {
                label: 'Wishlist', value: wishlist.length, icon: 'fa-heart',
                to: '/wishlist', linkLabel: 'View Saved',
                grad: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                glow: 'rgba(225,29,72,0.3)',
              },
            ].map((tile) => (
              <div key={tile.label} className="col-sm-6">
                <div
                  className="p-4"
                  style={{
                    background: tile.grad, borderRadius: '18px',
                    boxShadow: `0 10px 30px -8px ${tile.glow}`,
                    height: '100%',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', margin: 0, fontWeight: 600 }}>
                        {tile.label}
                      </p>
                      <h2 style={{ color: '#ffffff', fontWeight: 800, margin: '4px 0 0' }}>{tile.value}</h2>
                    </div>
                    <div style={{
                      width: 52, height: 52, borderRadius: '14px',
                      background: 'rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className={`fa-solid ${tile.icon} text-white`} style={{ fontSize: '1.4rem' }}></i>
                    </div>
                  </div>
                  <Link
                    to={tile.to}
                    style={{
                      color: 'rgba(255,255,255,0.85)', fontSize: '0.83rem',
                      fontWeight: 600, textDecoration: 'none',
                    }}
                  >
                    {tile.linkLabel} <i className="fa-solid fa-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div className="card p-4" style={{ borderRadius: '18px' }}>
            <h5 className="fw-bold mb-4" style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 36, height: 36, borderRadius: '10px',
                background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="fa-solid fa-address-card" style={{ color: '#4f46e5', fontSize: '0.9rem' }}></i>
              </span>
              Contact Information
            </h5>

            <div className="row g-3">
              {infoItems.map((item) => (
                <div key={item.label} className="col-12">
                  <div
                    className="d-flex align-items-center gap-3 p-3 rounded-3"
                    style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: '10px',
                      background: `${item.color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <i className={`fa-solid ${item.icon}`} style={{ color: item.color, fontSize: '0.9rem' }}></i>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        {item.label}
                      </p>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
