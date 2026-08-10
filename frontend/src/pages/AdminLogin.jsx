import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const AdminLogin = () => {
  const { loginAdmin } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@smartecommerce.com');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    const res = await loginAdmin(email.trim(), password);
    setLoading(false);
    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.message || 'Login failed. Please check backend connection and credentials.');
    }
  };

  const handleFillDefaults = () => {
    setEmail('admin@smartecommerce.com');
    setPassword('admin');
    setError('');
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-header bg-dark text-white text-center py-4 border-0">
          <img src="/Images/admin.png" alt="Admin Icon" style={{ width: '60px' }} className="mb-2" />
          <h4 className="fw-bold mb-0">Admin Portal Login</h4>
          <p className="small text-white-50 mb-0">Authorized store administrative access</p>
        </div>
        <div className="card-body p-4 p-md-5">
          {error && <div className="alert alert-danger py-2 text-center small">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Admin Email</label>
              <input
                type="email"
                className="form-control"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Admin Password</label>
              <input
                type="password"
                className="form-control"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-dark btn-lg w-100 fw-bold shadow-sm" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  Login to Admin Portal <i className="fa-solid fa-shield-halved ms-2"></i>
                </>
              )}
            </button>
          </form>
          <div className="text-center mt-3 text-muted extra-small">
            <span className="d-block mb-1">Default credentials: <strong>admin@smartecommerce.com</strong> / <strong>admin</strong></span>
            <button
              type="button"
              className="btn btn-link btn-sm text-decoration-none text-primary p-0 fw-semibold"
              onClick={handleFillDefaults}
            >
              <i className="fa-solid fa-wand-magic-sparkles me-1"></i>Fill Default Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
