import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const statTiles = [
  {
    key: 'categories', label: 'Categories', desc: 'Manage product categories',
    icon: 'fa-folder-open', grad: 'linear-gradient(135deg, #6366f1, #4338ca)',
    glow: 'rgba(99,102,241,0.3)', to: '/admin/display-category',
  },
  {
    key: 'products', label: 'Products', desc: 'Manage inventory & pricing',
    icon: 'fa-box-open', grad: 'linear-gradient(135deg, #10b981, #059669)',
    glow: 'rgba(16,185,129,0.3)', to: '/admin/display-products',
  },
  {
    key: 'orders', label: 'Orders', desc: 'Track order dispatch status',
    icon: 'fa-truck', grad: 'linear-gradient(135deg, #f59e0b, #d97706)',
    glow: 'rgba(245,158,11,0.3)', to: '/admin/display-orders',
  },
  {
    key: 'users', label: 'Customers', desc: 'View registered customer accounts',
    icon: 'fa-users', grad: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    glow: 'rgba(14,165,233,0.3)', to: '/admin/display-users',
  },
  {
    key: 'admins', label: 'Admin Team', desc: 'Manage admin accounts',
    icon: 'fa-user-shield', grad: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    glow: 'rgba(139,92,246,0.3)', to: '/admin/display-admin',
  },
];

const AdminDashboard = ({ onOpenAddCategory, onOpenAddProduct }) => {
  const { categories, products, users, orders, admins, activeAdmin } = useStore();
  const navigate = useNavigate();

  if (!activeAdmin) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '65vh' }}>
        <div className="empty-state-card" style={{ maxWidth: 380, width: '100%' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <i className="fa-solid fa-lock" style={{ fontSize: '2rem', color: '#d97706' }}></i>
          </div>
          <h5 className="fw-bold mb-2">Access Denied</h5>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>Admin authentication is required to view this page.</p>
          <button className="btn btn-primary mt-2 px-4" onClick={() => navigate('/adminlogin')}>
            <i className="fa-solid fa-right-to-bracket me-2"></i>Admin Login
          </button>
        </div>
      </div>
    );
  }

  const statValues = { categories: categories.length, products: products.length, orders: orders.length, users: users.length, admins: admins.length };

  return (
    <div className="container py-5">

      {/* ── Welcome Header ── */}
      <div
        className="p-4 mb-5 d-flex flex-wrap justify-content-between align-items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          borderRadius: '22px',
          boxShadow: '0 10px 40px -10px rgba(79,70,229,0.4)',
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div style={{
            width: 56, height: 56, borderRadius: '16px',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="fa-solid fa-gauge-high text-white" style={{ fontSize: '1.4rem' }}></i>
          </div>
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 800, margin: 0 }}>Admin Dashboard</h4>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', margin: 0 }}>
              Welcome back, <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{activeAdmin.name}</span>
            </p>
          </div>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn fw-semibold"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff', borderRadius: '12px',
              padding: '8px 18px', fontSize: '0.88rem',
            }}
            onClick={onOpenAddCategory}
          >
            <i className="fa-solid fa-plus me-2" style={{ color: '#a5b4fc' }}></i>Add Category
          </button>
          <button
            className="btn fw-semibold"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              border: 'none', color: '#0f172a', borderRadius: '12px',
              padding: '8px 18px', fontSize: '0.88rem',
            }}
            onClick={onOpenAddProduct}
          >
            <i className="fa-solid fa-plus me-2"></i>Add Product
          </button>
        </div>
      </div>

      {/* ── Stat Tiles ── */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
        {statTiles.map((tile) => (
          <div key={tile.key} className="col">
            <div
              className="card admin-stat-card h-100"
              style={{ overflow: 'hidden' }}
            >
              {/* Coloured top bar */}
              <div style={{ height: 5, background: tile.grad }}></div>

              <div className="p-4 d-flex flex-column h-100">
                {/* Icon + count */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div style={{
                    width: 52, height: 52, borderRadius: '14px',
                    background: tile.grad,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 6px 18px -4px ${tile.glow}`,
                  }}>
                    <i className={`fa-solid ${tile.icon} text-white`} style={{ fontSize: '1.2rem' }}></i>
                  </div>
                  <span style={{
                    fontSize: '2.2rem', fontWeight: 800,
                    background: tile.grad,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                  }}>
                    {statValues[tile.key]}
                  </span>
                </div>

                <h5 className="fw-bold mb-1" style={{ color: '#0f172a' }}>{tile.label}</h5>
                <p style={{ fontSize: '0.83rem', color: '#64748b', flexGrow: 1 }}>{tile.desc}</p>

                <Link
                  to={tile.to}
                  className="btn btn-sm fw-semibold mt-2"
                  style={{
                    background: '#f8fafc', color: '#4f46e5',
                    border: '1.5px solid #e0e7ff', borderRadius: '10px',
                    padding: '8px 16px', fontSize: '0.83rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = tile.grad;
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = '#4f46e5';
                    e.currentTarget.style.borderColor = '#e0e7ff';
                  }}
                >
                  Manage {tile.label} <i className="fa-solid fa-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
