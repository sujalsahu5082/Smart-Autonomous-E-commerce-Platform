import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer class="bg-dark text-light pt-4 pb-3 mt-auto border-top">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-4">
            <h5 class="fw-bold text-white mb-3">
              <i class="fa-sharp fa-solid fa-house text-primary me-2"></i>EazyDeals
            </h5>
            <p class="text-secondary small">
              Your one-stop destination for electronics, fashion, home appliances, and unbeatable online deals.
            </p>
          </div>
          <div class="col-md-4">
            <h6 class="fw-bold text-white mb-3">Quick Links</h6>
            <ul class="list-unstyled small">
              <li class="mb-1"><Link to="/" class="text-secondary text-decoration-none">Home</Link></li>
              <li class="mb-1"><Link to="/products" class="text-secondary text-decoration-none">All Products</Link></li>
              <li class="mb-1"><Link to="/cart" class="text-secondary text-decoration-none">Shopping Cart</Link></li>
              <li class="mb-1"><Link to="/wishlist" class="text-secondary text-decoration-none">My Wishlist</Link></li>
            </ul>
          </div>
          <div class="col-md-4">
            <h6 class="fw-bold text-white mb-3">Customer Support</h6>
            <p class="text-secondary small mb-1"><i class="fa-solid fa-envelope me-2"></i>support@eazydeals.com</p>
            <p class="text-secondary small mb-1"><i class="fa-solid fa-phone me-2"></i>+1 800 123 4567</p>
            <p class="text-secondary small"><i class="fa-solid fa-location-dot me-2"></i>123 Tech Park, Silicon Valley</p>
          </div>
        </div>
        <hr class="border-secondary my-3" />
        <div class="text-center text-secondary small">
          &copy; {new Date().getFullYear()} EazyDeals. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
