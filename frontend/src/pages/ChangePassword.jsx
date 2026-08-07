import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setMessage('Password updated successfully!');
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  return (
    <div class="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <div class="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '450px', width: '100%' }}>
        <div class="card-header custom-color text-white text-center py-4 border-0">
          <h4 class="fw-bold mb-0"><i class="fa-solid fa-lock me-2"></i>New Password</h4>
          <p class="small text-white-50 mb-0">Set your new account password</p>
        </div>
        <div class="card-body p-4 p-md-5">
          {message && (
            <div class={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} py-2 text-center small`}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div class="mb-3">
              <label class="form-label fw-semibold">New Password</label>
              <input
                type="password"
                class="form-control"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div class="mb-4">
              <label class="form-label fw-semibold">Confirm Password</label>
              <input
                type="password"
                class="form-control"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" class="btn btn-primary btn-lg w-100 fw-bold shadow-sm">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
