import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Login = () => {
  const { loginUser } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await loginUser(email.trim(), password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '85vh', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)' }}
    >
      <div className="card" style={{ maxWidth: 440, width: '100%', margin: '2rem 1rem', overflow: 'hidden', borderRadius: '24px', border: 'none', boxShadow: '0 20px 60px -10px rgba(79,70,229,0.2)' }}>

        {/* Header Band */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)', padding: '36px 32px 28px', textAlign: 'center' }}>
          <div style={{
            width: 68, height: 68, borderRadius: '18px',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            backdropFilter: 'blur(8px)',
          }}>
            <i className="fa-solid fa-right-to-bracket text-white" style={{ fontSize: '1.6rem' }}></i>
          </div>
          <h4 style={{ color: '#ffffff', fontWeight: 800, marginBottom: 4 }}>Welcome Back</h4>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', margin: 0 }}>Sign in to access your account & orders</p>
        </div>

        {/* Body */}
        <div className="p-4 p-md-5" style={{ background: '#ffffff' }}>
          {error && (
            <div className="alert alert-danger mb-4">
              <i className="fa-solid fa-circle-exclamation me-2"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fa-solid fa-envelope"></i></span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label mb-0">Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div>
              <div className="input-group">
                <span className="input-group-text"><i className="fa-solid fa-lock"></i></span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-3 fw-bold" style={{ borderRadius: '14px', fontSize: '1rem' }}>
              Sign In <i className="fa-solid fa-arrow-right ms-2"></i>
            </button>
          </form>

          <div className="text-center mt-4" style={{ fontSize: '0.87rem' }}>
            <span style={{ color: '#64748b' }}>Don't have an account? </span>
            <Link to="/register" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
