import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const PersonalInfo = () => {
  const { activeUser, updateUserProfile } = useStore();
  const navigate = useNavigate();

  const [name, setName] = useState(activeUser ? activeUser.name : '');
  const [email, setEmail] = useState(activeUser ? activeUser.email : '');
  const [phone, setPhone] = useState(activeUser ? activeUser.phone || '' : '');
  const [address, setAddress] = useState(activeUser ? activeUser.address || '' : '');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile({ name, email, phone, address });
    setSuccessMsg('Profile updated successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      navigate('/profile');
    }, 1200);
  };

  if (!activeUser) {
    return (
      <div class="container py-5 text-center">
        <h4>Please log in first</h4>
        <button class="btn btn-primary mt-3" onClick={() => navigate('/login')}>Login</button>
      </div>
    );
  }

  return (
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-7">
          <div class="card shadow-sm border-0 rounded-3">
            <div class="card-header bg-white py-3 border-bottom">
              <h4 class="fw-bold mb-0"><i class="fa-solid fa-user-pen text-primary me-2"></i>Edit Personal Info</h4>
            </div>
            <div class="card-body p-4">
              {successMsg && <div class="alert alert-success py-2 text-center small">{successMsg}</div>}
              <form onSubmit={handleSubmit}>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Full Name</label>
                  <input
                    type="text"
                    class="form-control"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Email Address</label>
                  <input
                    type="email"
                    class="form-control"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Phone Number</label>
                  <input
                    type="tel"
                    class="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div class="mb-4">
                  <label class="form-label fw-semibold">Address</label>
                  <textarea
                    class="form-control"
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  ></textarea>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <button type="button" class="btn btn-outline-secondary" onClick={() => navigate('/profile')}>
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary fw-bold px-4">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
