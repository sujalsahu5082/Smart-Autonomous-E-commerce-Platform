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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = registerUser({
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      address: address.trim()
    });

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div class="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div class="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '550px', width: '100%' }}>
        <div class="card-header custom-color text-white text-center py-4 border-0">
          <img src="/Images/signUp.png" alt="Register Icon" style={{ width: '60px' }} class="mb-2" />
          <h4 class="fw-bold mb-0">Create Your Account</h4>
          <p class="small text-white-50 mb-0">Join EazyDeals for fast checkout and exclusive offers</p>
        </div>
        <div class="card-body p-4 p-md-5">
          {error && <div class="alert alert-danger py-2 text-center small">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label fw-semibold">Full Name</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Email Address</label>
                <input
                  type="email"
                  class="form-control"
                  placeholder="john@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Phone Number</label>
                <input
                  type="tel"
                  class="form-control"
                  placeholder="9876543210"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div class="col-12">
                <label class="form-label fw-semibold">Password</label>
                <input
                  type="password"
                  class="form-control"
                  placeholder="Create password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div class="col-12">
                <label class="form-label fw-semibold">Delivery Address</label>
                <textarea
                  class="form-control"
                  rows="2"
                  placeholder="Enter house, street, city"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                ></textarea>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-100 fw-bold mt-4 shadow-sm">
              Register Account <i class="fa-solid fa-user-plus ms-2"></i>
            </button>
          </form>

          <div class="text-center mt-4">
            <span class="text-muted small">Already have an account? </span>
            <Link to="/login" class="fw-bold text-primary text-decoration-none small">Sign In Here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
