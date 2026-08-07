import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories, addToCart, toggleWishlist, isInWishlist } = useStore();
  const [qty, setQty] = useState(1);

  const product = products.find(p => p.pid === Number(id));

  if (!product) {
    return (
      <div class="container py-5 text-center">
        <h4>Product Not Found</h4>
        <button class="btn btn-primary mt-3" onClick={() => navigate('/products')}>Back to Products</button>
      </div>
    );
  }

  const category = categories.find(c => c.cid === product.cid);
  const discountPrice = Math.round(product.price - (product.price * product.discount) / 100);
  const isWish = isInWishlist(product.pid);

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/cart');
  };

  return (
    <div class="container py-5">
      <div class="card shadow border-0 rounded-3 overflow-hidden">
        <div class="row g-0">
          {/* Product Image Column */}
          <div class="col-md-5 p-4 text-center bg-white border-end d-flex align-items-center justify-content-center">
            <img
              src={product.image ? `/Images/${product.image}` : '/Images/product.png'}
              alt={product.name}
              class="img-fluid"
              style={{ maxHeight: '350px', objectFit: 'contain' }}
              onError={(e) => { e.target.src = '/Images/product.png'; }}
            />
          </div>

          {/* Product Info Column */}
          <div class="col-md-7 p-4 bg-white d-flex flex-column justify-content-between">
            <div>
              <span class="badge bg-primary-subtle text-primary mb-2">
                {category ? category.name : 'General'}
              </span>
              <h3 class="fw-bold text-dark">{product.name}</h3>

              <div class="d-flex align-items-baseline gap-3 my-3">
                <span class="fs-2 fw-bold text-dark">₹{discountPrice.toLocaleString()}</span>
                {product.discount > 0 && (
                  <>
                    <span class="fs-5 text-muted text-decoration-line-through">₹{product.price.toLocaleString()}</span>
                    <span class="fs-6 fw-semibold text-success">{product.discount}% off</span>
                  </>
                )}
              </div>

              <p class="text-muted leading-relaxed">{product.description}</p>

              <div class="my-3">
                <span class={`badge ${product.quantity > 0 ? 'bg-success' : 'bg-danger'} px-3 py-2 fs-6`}>
                  {product.quantity > 0 ? `In Stock (${product.quantity} units available)` : 'Out of Stock'}
                </span>
              </div>

              {/* Quantity Selector */}
              <div class="d-flex align-items-center gap-3 my-4">
                <label class="fw-semibold">Quantity:</label>
                <div class="input-group" style={{ width: '130px' }}>
                  <button
                    class="btn btn-outline-secondary"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    class="form-control text-center"
                    value={qty}
                    readOnly
                  />
                  <button
                    class="btn btn-outline-secondary"
                    onClick={() => setQty(Math.min(product.quantity, qty + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div class="d-flex flex-wrap gap-3 mt-4">
              <button
                class="btn btn-primary btn-lg px-4 fw-semibold"
                onClick={() => addToCart(product, qty)}
              >
                <i class="fa-solid fa-cart-plus me-2"></i>Add to Cart
              </button>

              <button
                class="btn btn-warning btn-lg px-4 text-dark fw-semibold"
                onClick={handleBuyNow}
              >
                <i class="fa-solid fa-bolt me-2"></i>Buy Now
              </button>

              <button
                class={`btn btn-outline-danger btn-lg px-3 ${isWish ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
              >
                <i class={`fa-solid fa-heart ${isWish ? '' : 'fa-regular'} me-1`}></i>
                {isWish ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
