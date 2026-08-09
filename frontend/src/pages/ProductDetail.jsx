import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isInWishlist, activeUser, fetchReviews, postReview } = useStore();

  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  const product = products.find((p) => p.pid === Number(id));

  useEffect(() => {
    if (id) {
      fetchReviews(Number(id)).then(setReviews);
    }
  }, [id, fetchReviews]);

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h4>Product Not Found</h4>
        <p style={{ color: '#64748b' }}>The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="btn btn-primary mt-2">Back to Products</Link>
      </div>
    );
  }

  const discountPrice = Math.round(product.price - (product.price * product.discount) / 100);
  const isWish = isInWishlist(product.pid);
  const savings = product.price - discountPrice;

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    setReviewMsg('');
    const res = await postReview(product.pid, { rating: Number(rating), comment: comment.trim() });
    if (res.success) {
      setReviewMsg('Thank you! Your review has been published.');
      setComment('');
      setRating(5);
      const updated = await fetchReviews(product.pid);
      setReviews(updated);
    } else {
      setReviewMsg(res.message || 'Failed to submit review.');
    }
    setSubmitting(false);
  };

  return (
    <div className="container py-5">
      {/* ── Product Card ── */}
      <div className="card mb-5" style={{ borderRadius: '22px', overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
        <div className="row g-0">

          {/* Image Panel */}
          <div
            className="col-md-5 d-flex align-items-center justify-content-center p-5"
            style={{ background: 'radial-gradient(circle at center, #eef2ff 0%, #f8fafc 100%)', minHeight: '380px' }}
          >
            <img
              src={product.image ? (product.image.startsWith('http') ? product.image : `/Images/${product.image}`) : '/Images/product.png'}
              alt={product.name}
              style={{ maxHeight: '320px', maxWidth: '100%', objectFit: 'contain' }}
              onError={(e) => { e.target.src = '/Images/product.png'; }}
            />
          </div>

          {/* Details Panel */}
          <div className="col-md-7 p-4 p-md-5 d-flex flex-column" style={{ background: '#ffffff' }}>
            <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
              <span
                style={{
                  background: '#eef2ff',
                  color: '#4f46e5',
                  borderRadius: '999px',
                  padding: '3px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {product.category_name || 'Electronics'}
              </span>
              <span
                style={{
                  background: product.quantity > 0 ? '#dcfce7' : '#fee2e2',
                  color: product.quantity > 0 ? '#166534' : '#991b1b',
                  borderRadius: '999px',
                  padding: '3px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {product.quantity > 0 ? `In Stock (${product.quantity})` : 'Out of Stock'}
              </span>
            </div>

            <h2 className="fw-bold mb-2" style={{ color: '#0f172a', fontSize: '1.6rem' }}>
              {product.name}
            </h2>

            {/* Price */}
            <div className="d-flex align-items-baseline gap-3 mb-3">
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                ₹{discountPrice.toLocaleString()}
              </span>
              {product.discount > 0 && (
                <>
                  <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: '#94a3b8', fontWeight: 500 }}>
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff',
                      borderRadius: '999px',
                      padding: '4px 14px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                    }}
                  >
                    {product.discount}% OFF
                  </span>
                </>
              )}
            </div>

            {savings > 0 && (
              <p style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600, marginBottom: '1rem' }}>
                <i className="fa-solid fa-tag me-1"></i> You save ₹{savings.toLocaleString()} on this order
              </p>
            )}

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

      {/* ── Customer Reviews & Ratings Section ── */}
      <div className="card p-4 p-md-5" style={{ borderRadius: '22px', border: '1.5px solid #e2e8f0' }}>
        <h4 className="fw-bold mb-4" style={{ color: '#0f172a' }}>
          <i className="fa-solid fa-star text-warning me-2"></i>Customer Reviews ({reviews.length})
        </h4>

        {/* Add Review Form */}
        {activeUser ? (
          <form onSubmit={handleReviewSubmit} className="mb-4 p-4 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h6 className="fw-bold mb-3">Write a Customer Review</h6>
            {reviewMsg && <div className="alert alert-info py-2 mb-3">{reviewMsg}</div>}
            <div className="mb-3">
              <label className="form-label fw-semibold">Rating</label>
              <select className="form-select w-auto" value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                <option value={3}>⭐⭐⭐ (3 Stars)</option>
                <option value={2}>⭐⭐ (2 Stars)</option>
                <option value={1}>⭐ (1 Star)</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Your Review</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Share details of your experience with this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary fw-semibold" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <div className="alert alert-light border p-3 mb-4" style={{ borderRadius: '12px' }}>
            <i className="fa-solid fa-circle-info me-2 text-primary"></i>
            Please <Link to="/login" className="fw-bold">Sign In</Link> to write a customer review.
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No reviews yet for this product. Be the first to write one!</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {reviews.map((r) => (
              <div key={r.id} className="p-3 border-bottom">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <div className="fw-bold" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                    <i className="fa-solid fa-user-circle me-1 text-secondary"></i>
                    {r.user_name || 'Verified Customer'}
                  </div>
                  <div className="text-warning" style={{ fontSize: '0.85rem' }}>
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </div>
                </div>
                <p className="mb-0" style={{ fontSize: '0.88rem', color: '#475569' }}>
                  {r.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
