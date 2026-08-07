import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Login = () => {
  const { loginUser } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = loginUser(email.trim(), password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div class="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <div class="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '450px', width: '100%' }}>
        <div class="card-header custom-color text-white text-center py-4 border-0">
          <img src="/Images/login.png" alt="Login Icon" style={{ width: '60px' }} class="mb-2" />
          <h4 class="fw-bold mb-0">Welcome Back</h4>
          <p class="small text-white-50 mb-0">Login to access your account & orders</p>
        </div>
        <div class="card-body p-4 p-md-5">
          {error && <div class="alert alert-danger py-2 text-center small">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div class="mb-3">
              <label class="form-label fw-semibold">Email Address</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="fa-solid fa-envelope text-muted"></i></span>
                <input
                  type="email"
                  class="form-control"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div class="mb-3">
              <div class="d-flex justify-content-between">
                <label class="form-label fw-semibold">Password</label>
                <Link to="/forgot-password" class="small text-decoration-none text-primary">Forgot Password?</Link>
              </div>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="fa-solid fa-key text-muted"></i></span>
                <input
                  type="password"
                  class="form-control"
                  placeholder="Enter password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-100 fw-bold mt-3 shadow-sm">
              Sign In <i class="fa-solid fa-arrow-right-to-bracket ms-2"></i>
            </button>
          </form>

          <div class="text-center mt-4">
            <span class="text-muted small">Don't have an account? </span>
            <Link to="/register" class="fw-bold text-primary text-decoration-none small">Create New Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
