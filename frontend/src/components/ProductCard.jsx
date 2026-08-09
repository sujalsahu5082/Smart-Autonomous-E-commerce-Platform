import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const navigate = useNavigate();

  const discountPrice = Math.round(product.price - (product.price * product.discount) / 100);
  const isWish = isInWishlist(product.pid);

  // Deterministic "rating" and "review" count from product id
  const rating = ((product.pid % 15) * 0.1 + 3.5).toFixed(1);
  const reviews = ((product.pid * 37 + 123) % 4500) + 200;
  const isAssured = product.pid % 3 !== 0;

  const savingsAmount = product.discount > 0
    ? (product.price - discountPrice).toLocaleString()
    : null;

  return (
    <div className="col">
      <div className="card h-100 cus-card position-relative">

        {/* Discount Ribbon */}
        {product.discount > 0 && (
          <div className="discount-ribbon">
            -{product.discount}% OFF
          </div>
        )}

        {/* Wishlist Heart */}
        <button
          className={`wishlist-btn ${isWish ? 'text-danger' : 'text-muted'}`}
          onClick={() => toggleWishlist(product)}
          title={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <i
            className={`fa-heart ${isWish ? 'fa-solid' : 'fa-regular'}`}
            style={{ fontSize: '0.9rem' }}
          ></i>
        </button>

        {/* Product Image */}
        <div
          className="card-img-top-wrapper"
          onClick={() => navigate(`/product/${product.pid}`)}
          style={{ cursor: 'pointer' }}
        >
          <img
            src={product.image ? `/Images/${product.image}` : '/Images/product.png'}
            alt={product.name}
            onError={(e) => { e.target.src = '/Images/product.png'; }}
          />
        </div>

        {/* Card Body */}
        <div className="card-body d-flex flex-column" style={{ padding: '12px' }}>

          {/* Product Name */}
          <div
            className="product-title"
            onClick={() => navigate(`/product/${product.pid}`)}
            title={product.name}
          >
            {product.name}
          </div>

          {/* Assured badge */}
          {isAssured && (
            <div className="mb-1">
              <span className="assured-badge">
                <i className="fa-solid fa-shield-check" style={{ fontSize: '0.65rem' }}></i>
                Assured
              </span>
            </div>
          )}

          {/* Star Rating */}
          <div className="star-rating mb-1">
            <span className="stars">
              {rating}
              <i className="fa-solid fa-star" style={{ fontSize: '0.62rem' }}></i>
            </span>
            <span className="review-count">({reviews.toLocaleString()})</span>
          </div>

          {/* Price Section */}
          <div className="d-flex align-items-baseline gap-2 flex-wrap mb-1">
            <span className="real-price">₹{discountPrice.toLocaleString()}</span>
            {product.discount > 0 && (
              <>
                <span className="product-price">₹{product.price.toLocaleString()}</span>
                <span className="product-discount">{product.discount}% off</span>
              </>
            )}
          </div>

          {/* Savings */}
          {savingsAmount && (
            <div style={{ fontSize: '0.75rem', color: '#388E3C', fontWeight: 600, marginBottom: '8px' }}>
              <i className="fa-solid fa-tag me-1"></i>
              Save ₹{savingsAmount}
            </div>
          )}

          {/* Free Delivery hint */}
          <div style={{ fontSize: '0.72rem', color: '#565959', marginBottom: '10px' }}>
            <i className="fa-solid fa-truck-fast me-1" style={{ color: '#028FC8' }}></i>
            Free Delivery
          </div>

          {/* Add to Cart */}
          <div className="mt-auto">
            <button
              className="btn-add-cart"
              onClick={() => addToCart(product)}
            >
              <i className="fa-solid fa-cart-shopping me-2"></i>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
