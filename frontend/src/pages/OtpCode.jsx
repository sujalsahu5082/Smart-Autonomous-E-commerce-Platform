import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OtpCode = () => {
  const [otp, setOtp] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state ? location.state.email : '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length >= 4) {
      navigate('/change-password', { state: { email } });
    }
  };

  return (
    <div class="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <div class="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '450px', width: '100%' }}>
        <div class="card-header custom-color text-white text-center py-4 border-0">
          <h4 class="fw-bold mb-0"><i class="fa-solid fa-shield-halved me-2"></i>Verify OTP Code</h4>
          <p class="small text-white-50 mb-0">Code sent to {email || 'your email'}</p>
        </div>
        <div class="card-body p-4 p-md-5 text-center">
          <form onSubmit={handleSubmit}>
            <div class="mb-4">
              <label class="form-label fw-semibold">Enter 6-Digit OTP</label>
              <input
                type="text"
                class="form-control text-center fs-4 fw-bold letter-spacing-2"
                placeholder="123456"
                maxLength="6"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button type="submit" class="btn btn-primary btn-lg w-100 fw-bold shadow-sm">
              Verify Code <i class="fa-solid fa-check-double ms-2"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpCode;
