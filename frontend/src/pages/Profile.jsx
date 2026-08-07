import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Profile = () => {
  const { activeUser, orders, wishlist } = useStore();
  const navigate = useNavigate();

  if (!activeUser) {
    return (
      <div class="container py-5 text-center">
        <h4>Please log in to view your profile</h4>
        <button class="btn btn-primary mt-3" onClick={() => navigate('/login')}>Login Now</button>
      </div>
    );
  }

  const myOrdersCount = orders.filter(o => o.userId === activeUser.id).length;

  return (
    <div class="container py-5">
      <div class="row g-4">
        {/* User Card */}
        <div class="col-md-4">
          <div class="card shadow-sm border-0 rounded-3 text-center p-4">
            <img
              src="/Images/profile.png"
              alt="Profile Avatar"
              class="mx-auto rounded-circle mb-3 border p-2"
              style={{ width: '110px', height: '110px', objectFit: 'cover' }}
            />
            <h5 class="fw-bold mb-1">{activeUser.name}</h5>
            <p class="text-muted small mb-3">{activeUser.email}</p>
            <div class="badge bg-primary-subtle text-primary px-3 py-2 fs-6 mb-3">Customer Account</div>
            <div>
              <Link to="/personal-info" class="btn btn-outline-primary btn-sm fw-semibold w-100">
                <i class="fa-solid fa-pen-to-square me-1"></i>Edit Personal Details
              </Link>
            </div>
          </div>
        </div>

        {/* Account Quick Stats & Links */}
        <div class="col-md-8">
          <div class="row g-3 mb-4">
            <div class="col-sm-6">
              <div class="card shadow-sm border-0 rounded-3 p-4 bg-primary text-white">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-white-50 mb-1">My Orders</h6>
                    <h3 class="fw-bold mb-0">{myOrdersCount}</h3>
                  </div>
                  <i class="fa-solid fa-box-open fs-1 text-white-50"></i>
                </div>
                <Link to="/orders" class="text-white text-decoration-none small mt-3 d-block fw-semibold">
                  View Order History <i class="fa-solid fa-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>

            <div class="col-sm-6">
              <div class="card shadow-sm border-0 rounded-3 p-4 bg-danger text-white">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-white-50 mb-1">Saved Wishlist</h6>
                    <h3 class="fw-bold mb-0">{wishlist.length}</h3>
                  </div>
                  <i class="fa-solid fa-heart fs-1 text-white-50"></i>
                </div>
                <Link to="/wishlist" class="text-white text-decoration-none small mt-3 d-block fw-semibold">
                  View Saved Items <i class="fa-solid fa-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>

          <div class="card shadow-sm border-0 rounded-3 p-4">
            <h5 class="fw-bold mb-3"><i class="fa-solid fa-address-card me-2 text-primary"></i>Contact Information</h5>
            <div class="row g-3">
              <div class="col-sm-6">
                <label class="text-muted small d-block">Phone Number</label>
                <span class="fw-semibold">{activeUser.phone || 'Not provided'}</span>
              </div>
              <div class="col-sm-6">
                <label class="text-muted small d-block">Default Address</label>
                <span class="fw-semibold">{activeUser.address || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
