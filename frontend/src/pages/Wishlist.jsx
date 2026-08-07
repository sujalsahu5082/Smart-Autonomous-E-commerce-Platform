import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

const Wishlist = () => {
  const { wishlist, addToCart, toggleWishlist } = useStore();
  const navigate = useNavigate();

  if (wishlist.length === 0) {
    return (
      <div class="container py-5 text-center">
        <div class="card shadow-sm border-0 p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <img src="/Images/wishlist.png" alt="Empty Wishlist" class="mx-auto mb-4" style={{ width: '140px' }} />
          <h4 class="fw-bold">Your Wishlist is Empty</h4>
          <p class="text-muted small">Explore products and click the heart icon to save your favorite items here.</p>
          <Link to="/products" class="btn btn-primary fw-semibold mt-3">Explore Catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="fw-bold m-0"><i class="fa-solid fa-heart text-danger me-2"></i>My Saved Wishlist</h3>
        <span class="text-muted">{wishlist.length} item(s) saved</span>
      </div>

      <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
        {wishlist.map((prod) => (
          <ProductCard key={prod.pid} product={prod} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
