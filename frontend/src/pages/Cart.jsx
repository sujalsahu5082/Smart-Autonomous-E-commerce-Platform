import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart } = useStore();
  const navigate = useNavigate();

  const totalOriginal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalDiscount = cart.reduce((sum, item) => {
    const d = (item.product.price * item.product.discount) / 100;
    return sum + d * item.quantity;
  }, 0);
  const grandTotal = Math.round(totalOriginal - totalDiscount);

  if (cart.length === 0) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '65vh' }}>
        <div className="empty-state-card" style={{ maxWidth: 420, width: '100%' }}>
          <div style={{
            width: 90, height: 90, borderRadius: '50%',
            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <i className="fa-solid fa-cart-shopping" style={{ fontSize: '2.2rem', color: '#6366f1' }}></i>
          </div>
          <h4 className="fw-bold mb-2">Your Cart is Empty</h4>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Looks like you haven't added anything yet. Browse our store!</p>
          <Link to="/products" className="btn btn-primary fw-semibold mt-3 px-4">
            <i className="fa-solid fa-store me-2"></i>Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Page title */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div style={{
          width: 42, height: 42, borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #4338ca)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="fa-solid fa-bag-shopping text-white" style={{ fontSize: '1rem' }}></i>
        </div>
        <div>
          <h3 className="fw-bold mb-0">Shopping Cart</h3>
          <p className="mb-0" style={{ fontSize: '0.83rem', color: '#64748b' }}>
            {cart.reduce((s, i) => s + i.quantity, 0)} items in your cart
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* ── Cart Items ── */}
        <div className="col-lg-8">
          <div className="card p-0" style={{ borderRadius: '18px', overflow: 'hidden' }}>
            {cart.map((item, idx) => {
              const unitPrice = Math.round(item.product.price - (item.product.price * item.product.discount) / 100);
              return (
                <div
                  key={item.product.pid}
                  className="p-4"
                  style={{
                    borderBottom: idx < cart.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="row align-items-center g-3">
                    {/* Image */}
                    <div className="col-3 col-md-2">
                      <div style={{
                        background: '#f8fafc', borderRadius: '12px',
                        padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        height: '72px',
                      }}>
                        <img
                          src={item.product.image ? (item.product.image.startsWith('http') ? item.product.image : `/Images/${item.product.image}`) : '/Images/product.png'}
                          alt={item.product.name}
                          style={{ maxHeight: '56px', objectFit: 'contain', maxWidth: '100%' }}
                          onError={(e) => { e.target.src = '/Images/product.png'; }}
                        />
                      </div>
                    </div>

                    {/* Name + price */}
                    <div className="col-9 col-md-5">
                      <h6 className="fw-bold mb-1" style={{ fontSize: '0.92rem', color: '#0f172a' }}>
                        {item.product.name}
                      </h6>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        ₹{unitPrice.toLocaleString()} each
                        {item.product.discount > 0 && (
                          <span style={{
                            marginLeft: 6, background: '#dcfce7', color: '#166534',
                            borderRadius: '999px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700,
                          }}>
                            {item.product.discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Qty stepper */}
                    <div className="col-6 col-md-3">
                      <div className="qty-stepper">
                        <button onClick={() => updateCartQuantity(item.product.pid, item.quantity - 1)}>−</button>
                        <span className="qty-value">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.product.pid, item.quantity + 1)}>+</button>
                      </div>
                    </div>

                    {/* Total + Remove */}
                    <div className="col-6 col-md-2 text-end">
                      <div className="fw-bold mb-2" style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                        ₹{(unitPrice * item.quantity).toLocaleString()}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.pid)}
                        title="Remove"
                        style={{
                          background: '#fff1f2', border: '1px solid #fecdd3',
                          borderRadius: '8px', color: '#e11d48',
                          width: 32, height: 32, padding: 0,
                          cursor: 'pointer', display: 'inline-flex',
                          alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#e11d48'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48'; }}
                      >
                        <i className="fa-solid fa-trash" style={{ fontSize: '0.75rem' }}></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Order Summary ── */}
        <div className="col-lg-4">
          <div className="card p-4" style={{ borderRadius: '18px', position: 'sticky', top: '90px' }}>
            <h5 className="fw-bold mb-4" style={{ color: '#0f172a' }}>Order Summary</h5>

            {/* Savings banner */}
            {totalDiscount > 0 && (
              <div className="savings-banner">
                <span><i className="fa-solid fa-tag me-2"></i>Your savings</span>
                <span className="fw-bold">₹{Math.round(totalDiscount).toLocaleString()}</span>
              </div>
            )}

            {/* Price rows */}
            {[
              { label: 'Subtotal', value: `₹${Math.round(totalOriginal).toLocaleString()}`, muted: true },
              { label: 'Discount', value: `− ₹${Math.round(totalDiscount).toLocaleString()}`, green: true },
              { label: 'Delivery', value: 'FREE', green: true },
            ].map((row) => (
              <div key={row.label} className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}>
                <span style={{ color: '#64748b' }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: row.green ? '#059669' : '#0f172a' }}>{row.value}</span>
              </div>
            ))}

            <hr style={{ borderColor: '#f1f5f9', margin: '12px 0' }} />

            <div className="d-flex justify-content-between mb-4">
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>Total</span>
              <span style={{
                fontWeight: 800, fontSize: '1.2rem',
                background: 'linear-gradient(135deg, #0f172a, #312e81)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                ₹{grandTotal.toLocaleString()}
              </span>
            </div>

            <button
              className="btn btn-primary w-100 py-3 fw-bold"
              onClick={() => navigate('/checkout')}
              style={{ borderRadius: '14px', fontSize: '1rem' }}
            >
              Proceed to Checkout <i className="fa-solid fa-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
