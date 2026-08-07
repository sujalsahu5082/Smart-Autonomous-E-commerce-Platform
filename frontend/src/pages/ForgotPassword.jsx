import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      navigate('/otp-code', { state: { email } });
    }
  };

  return (
    <div class="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <div class="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '450px', width: '100%' }}>
        <div class="card-header custom-color text-white text-center py-4 border-0">
          <img src="/Images/forgot-password.png" alt="Forgot Password" style={{ width: '60px' }} class="mb-2" />
          <h4 class="fw-bold mb-0">Reset Password</h4>
          <p class="small text-white-50 mb-0">Enter your registered email to receive OTP</p>
        </div>
        <div class="card-body p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            <div class="mb-4">
              <label class="form-label fw-semibold">Registered Email</label>
              <input
                type="email"
                class="form-control"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" class="btn btn-primary btn-lg w-100 fw-bold shadow-sm">
              Send OTP Code <i class="fa-solid fa-paper-plane ms-2"></i>
            </button>
          </form>
          <div class="text-center mt-4">
            <Link to="/login" class="small text-muted text-decoration-none"><i class="fa-solid fa-arrow-left me-1"></i>Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
