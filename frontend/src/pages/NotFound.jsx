import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div class="container py-5 text-center my-auto">
      <div class="card shadow-sm border-0 p-5 mx-auto" style={{ maxWidth: '500px' }}>
        <img src="/Images/error.png" alt="404 Error" class="mx-auto mb-3" style={{ width: '140px' }} />
        <h2 class="fw-bold text-danger">404 - Page Not Found</h2>
        <p class="text-muted small">The page you are looking for does not exist or has been moved.</p>
        <Link to="/" class="btn btn-primary fw-semibold mt-3">Return to Home Page</Link>
      </div>
    </div>
  );
};

export default NotFound;
