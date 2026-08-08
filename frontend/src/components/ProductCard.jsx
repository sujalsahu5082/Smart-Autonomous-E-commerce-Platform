import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const navigate = useNavigate();

  const discountPrice = Math.round(product.price - (product.price * product.discount) / 100);
  const isWish = isInWishlist(product.pid);

  return (
    <div className="col">
      <div className="card h-100 cus-card position-relative">

        {/* Wishlist Heart Button */}
        <button
          className={`wishlist-btn ${isWish ? 'text-danger' : 'text-muted'}`}
          onClick={() => toggleWishlist(product)}
          title={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <i className={`fa-heart ${isWish ? 'fa-solid' : 'fa-regular'}`} style={{ fontSize: '0.95rem' }}></i>
        </button>

        {/* Discount ribbon */}
        {product.discount > 0 && (
          <div style={{
            position: 'absolute', top: 12, left: 12, zIndex: 4,
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#fff', fontSize: '0.7rem', fontWeight: 700,
            padding: '3px 9px', borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(239,68,68,0.35)',
          }}>
            -{product.discount}%
          </div>
        )}

        {/* Product Image */}
        <div
          className="card-img-top-wrapper"
          onClick={() => navigate(`/product/${product.pid}`)}
        >
          <img
            src={product.image ? `/Images/${product.image}` : '/Images/product.png'}
            alt={product.name}
            onError={(e) => { e.target.src = '/Images/product.png'; }}
          />
        </div>

        {/* Product Details */}
        <div className="card-body d-flex flex-column p-3 pt-2">
          <h6
            className="fw-bold mb-1 text-truncate"
            title={product.name}
            style={{ cursor: 'pointer', fontSize: '0.92rem', color: '#0f172a' }}
            onClick={() => navigate(`/product/${product.pid}`)}
          >
            {product.name}
          </h6>
          <p className="text-truncate mb-3" style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {product.description}
          </p>

          {/* Price */}
          <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
            <span className="real-price">₹{discountPrice.toLocaleString()}</span>
            {product.discount > 0 && (
              <>
                <span className="product-price">₹{product.price.toLocaleString()}</span>
                <span className="product-discount">{product.discount}% off</span>
              </>
            )}
          </div>

          {/* Add to Cart */}
          <div className="mt-auto">
            <button
              className="btn-add-cart"
              onClick={() => addToCart(product)}
            >
              <i className="fa-solid fa-bag-shopping me-2"></i>Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
