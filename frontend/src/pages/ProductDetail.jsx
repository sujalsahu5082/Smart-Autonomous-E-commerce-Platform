import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories, addToCart, toggleWishlist, isInWishlist } = useStore();
  const [qty, setQty] = useState(1);

  const product = products.find((p) => p.pid === Number(id));

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <div className="empty-state-card" style={{ maxWidth: 400, margin: '0 auto' }}>
          <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', color: '#94a3b8' }}></i>
          <h4 className="fw-bold mt-3">Product Not Found</h4>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/products')}>
            <i className="fa-solid fa-arrow-left me-2"></i>Back to Products
          </button>
        </div>
      </div>
    );
  }

  const category = categories.find((c) => c.cid === product.cid);
  const discountPrice = Math.round(product.price - (product.price * product.discount) / 100);
  const isWish = isInWishlist(product.pid);
  const savings = product.price - discountPrice;

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/cart');
  };

  return (
    <div className="container py-5">
      <div className="card" style={{ borderRadius: '22px', overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
        <div className="row g-0">

          {/* ── Image Panel ── */}
          <div className="col-md-5 d-flex align-items-center justify-content-center p-5"
            style={{ background: 'radial-gradient(circle at center, #eef2ff 0%, #f8fafc 100%)', minHeight: '380px' }}>
            <img
              src={product.image ? `/Images/${product.image}` : '/Images/product.png'}
              alt={product.name}
              style={{ maxHeight: '300px', maxWidth: '100%', objectFit: 'contain' }}
              onError={(e) => { e.target.src = '/Images/product.png'; }}
            />
          </div>

          {/* ── Info Panel ── */}
          <div className="col-md-7 p-4 p-md-5 d-flex flex-column" style={{ background: '#ffffff' }}>

            {/* Category + Stock badges */}
            <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
              <span style={{
                background: '#eef2ff', color: '#4f46e5',
                borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
                padding: '4px 14px', border: '1px solid #c7d2fe',
              }}>
                {category ? category.name : 'General'}
              </span>
              <span style={{
                background: product.quantity > 0 ? '#f0fdf4' : '#fff1f2',
                color: product.quantity > 0 ? '#166534' : '#9f1239',
                borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
                padding: '4px 14px',
                border: `1px solid ${product.quantity > 0 ? '#bbf7d0' : '#fecdd3'}`,
              }}>
                <i className={`fa-solid fa-circle me-1`} style={{ fontSize: '0.5rem' }}></i>
                {product.quantity > 0 ? `In Stock (${product.quantity})` : 'Out of Stock'}
              </span>
            </div>

            <h2 className="fw-bold mb-3" style={{ color: '#0f172a', lineHeight: 1.3 }}>{product.name}</h2>

            {/* Price block */}
            <div className="p-3 mb-3 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="d-flex align-items-baseline gap-3 flex-wrap mb-2">
                <span style={{
                  fontSize: '2.2rem', fontWeight: 800,
                  background: 'linear-gradient(135deg, #0f172a, #312e81)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  ₹{discountPrice.toLocaleString()}
                </span>
                {product.discount > 0 && (
                  <>
                    <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: '#94a3b8', fontWeight: 500 }}>
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff', borderRadius: '999px',
                      padding: '4px 14px', fontSize: '0.82rem', fontWeight: 700,
                    }}>
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>
              {savings > 0 && (
                <p style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600, margin: 0 }}>
                  <i className="fa-solid fa-tag me-1"></i>
                  You save ₹{savings.toLocaleString()} on this order
                </p>
              )}
            </div>

            <p style={{ color: '#475569', fontSize: '0.93rem', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              {product.description}
            </p>

            {/* Quantity Stepper */}
            <div className="d-flex align-items-center gap-3 mb-4">
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>Qty:</span>
              <div className="qty-stepper">
                <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span className="qty-value">{qty}</span>
                <button onClick={() => setQty(Math.min(product.quantity, qty + 1))}>+</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex flex-wrap gap-3">
              <button
                className="btn btn-primary fw-bold px-4 py-2"
                onClick={() => addToCart(product, qty)}
                style={{ borderRadius: '12px', fontSize: '0.92rem' }}
              >
                <i className="fa-solid fa-bag-shopping me-2"></i>Add to Cart
              </button>
              <button
                className="btn btn-warning fw-bold px-4 py-2"
                onClick={handleBuyNow}
                style={{ borderRadius: '12px', fontSize: '0.92rem' }}
              >
                <i className="fa-solid fa-bolt me-2"></i>Buy Now
              </button>
              <button
                className={`btn btn-outline-danger fw-semibold px-3 py-2 ${isWish ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                style={{ borderRadius: '12px', fontSize: '0.92rem' }}
              >
                <i className={`fa-heart ${isWish ? 'fa-solid' : 'fa-regular'} me-1`}></i>
                {isWish ? 'Saved' : 'Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
