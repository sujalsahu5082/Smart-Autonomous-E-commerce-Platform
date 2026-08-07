import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const AdminLogin = () => {
  const { loginAdmin } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@eazydeals.com');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = loginAdmin(email.trim(), password);
    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.message);
    }
  };

  return (
    <div class="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <div class="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '450px', width: '100%' }}>
        <div class="card-header bg-dark text-white text-center py-4 border-0">
          <img src="/Images/admin.png" alt="Admin Icon" style={{ width: '60px' }} class="mb-2" />
          <h4 class="fw-bold mb-0">Admin Portal Login</h4>
          <p class="small text-white-50 mb-0">Authorized store administrative access</p>
        </div>
        <div class="card-body p-4 p-md-5">
          {error && <div class="alert alert-danger py-2 text-center small">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div class="mb-3">
              <label class="form-label fw-semibold">Admin Email</label>
              <input
                type="email"
                class="form-control"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div class="mb-4">
              <label class="form-label fw-semibold">Admin Password</label>
              <input
                type="password"
                class="form-control"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" class="btn btn-dark btn-lg w-100 fw-bold shadow-sm">
              Login to Admin Portal <i class="fa-solid fa-shield-halved ms-2"></i>
            </button>
          </form>
          <div class="text-center mt-3 text-muted extra-small">
            Default credentials: admin@eazydeals.com / admin
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
