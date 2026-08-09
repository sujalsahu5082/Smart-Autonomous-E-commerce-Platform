import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Register = () => {
  const { registerUser } = useStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await registerUser({
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      address: address.trim(),
    });
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center py-5"
      style={{ minHeight: '85vh', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)' }}
    >
      <div
        className="card"
        style={{
          maxWidth: 560, width: '100%', margin: '0 1rem',
          overflow: 'hidden', borderRadius: '24px',
          border: 'none', boxShadow: '0 20px 60px -10px rgba(79,70,229,0.2)',
        }}
      >
        {/* ── Header Band ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            padding: '32px 32px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 68, height: 68, borderRadius: '18px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <i className="fa-solid fa-user-plus text-white" style={{ fontSize: '1.6rem' }}></i>
          </div>
          <h4 style={{ color: '#ffffff', fontWeight: 800, marginBottom: 4 }}>Create Your Account</h4>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', margin: 0 }}>
            Join Smart E-Commerce for fast checkout &amp; exclusive offers
          </p>
        </div>

        {/* ── Body ── */}
        <div className="p-4 p-md-5" style={{ background: '#ffffff' }}>
          {error && (
            <div className="alert alert-danger mb-4">
              <i className="fa-solid fa-circle-exclamation me-2"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Full Name */}
              <div className="col-12">
                <label className="form-label">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="fa-solid fa-user"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="col-md-6">
                <label className="form-label">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="fa-solid fa-envelope"></i></span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="john@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="col-md-6">
                <label className="form-label">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="fa-solid fa-phone"></i></span>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="9876543210"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="col-12">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="fa-solid fa-lock"></i></span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Create a strong password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="col-12">
                <label className="form-label">Delivery Address</label>
                <div className="input-group align-items-start">
                  <span className="input-group-text" style={{ paddingTop: '11px' }}>
                    <i className="fa-solid fa-location-dot"></i>
                  </span>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="House no., street, city, pincode"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-3 fw-bold mt-4"
              style={{ borderRadius: '14px', fontSize: '1rem' }}
            >
              Create Account <i className="fa-solid fa-arrow-right ms-2"></i>
            </button>
          </form>

          <div className="text-center mt-4" style={{ fontSize: '0.87rem' }}>
            <span style={{ color: '#64748b' }}>Already have an account? </span>
            <Link to="/login" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
