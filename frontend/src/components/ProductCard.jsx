import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const navigate = useNavigate();

  const discountPrice = Math.round(product.price - (product.price * product.discount) / 100);
  const isWish = isInWishlist(product.pid);

  return (
    <div class="col">
      <div class="card h-100 cus-card shadow-sm position-relative">
        {/* Wishlist Heart Button */}
        <button
          class={`btn btn-light btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow-sm ${isWish ? 'text-danger' : 'text-muted'}`}
          style={{ width: '34px', height: '34px', zIndex: 5 }}
          onClick={() => toggleWishlist(product)}
          title={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <i class={`fa-solid fa-heart ${isWish ? '' : 'fa-regular'}`}></i>
        </button>

        {/* Product Image */}
        <div
          class="p-3 text-center cursor-pointer bg-white rounded-top"
          onClick={() => navigate(`/product/${product.pid}`)}
          style={{ height: '200px', cursor: 'pointer' }}
        >
          <img
            src={product.image ? `/Images/${product.image}` : '/Images/product.png'}
            alt={product.name}
            class="img-fluid h-100"
            style={{ objectFit: 'contain' }}
            onError={(e) => { e.target.src = '/Images/product.png'; }}
          />
        </div>

        {/* Product Details */}
        <div class="card-body d-flex flex-direction-column justify-content-between p-3">
          <div>
            <h6
              class="card-title text-truncate fw-bold mb-1"
              title={product.name}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/product/${product.pid}`)}
            >
              {product.name}
            </h6>
            <p class="card-text text-muted small text-truncate mb-2">
              {product.description}
            </p>
          </div>

          <div>
            {/* Price Section */}
            <div class="d-flex align-items-baseline gap-2 mb-3">
              <span class="real-price">₹{discountPrice.toLocaleString()}</span>
              {product.discount > 0 && (
                <>
                  <span class="product-price">₹{product.price.toLocaleString()}</span>
                  <span class="product-discount">{product.discount}% off</span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div class="d-grid gap-2">
              <button
                class="btn btn-primary btn-sm fw-semibold"
                onClick={() => addToCart(product)}
              >
                <i class="fa-solid fa-cart-plus me-1"></i>Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
