import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const statusConfig = {
  Pending:    { bg: '#fef9c3', color: '#713f12', border: '#fde68a', icon: 'fa-clock' },
  Processing: { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', icon: 'fa-spinner' },
  Shipped:    { bg: '#eef2ff', color: '#3730a3', border: '#c7d2fe', icon: 'fa-truck' },
  Delivered:  { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0', icon: 'fa-circle-check' },
  Cancelled:  { bg: '#fff1f2', color: '#9f1239', border: '#fecdd3', icon: 'fa-circle-xmark' },
};

const Orders = () => {
  const { orders, activeUser } = useStore();
  const { state } = window.history;
  const recentOrderId = state?.usr?.orderId ?? null;

  const userOrders = activeUser
    ? orders.filter((o) => o.userId === activeUser.id)
    : orders;

  return (
    <div className="container py-5">
      {/* Success alert */}
      {recentOrderId && (
        <div
          className="alert alert-success mb-4 d-flex align-items-start gap-3"
          style={{ borderRadius: '16px', padding: '20px 24px' }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: '#bbf7d0', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="fa-solid fa-circle-check" style={{ color: '#16a34a', fontSize: '1.3rem' }}></i>
          </div>
          <div>
            <h5 className="fw-bold mb-1" style={{ color: '#166534' }}>Order Placed Successfully!</h5>
            <p className="mb-0" style={{ fontSize: '0.88rem', color: '#166534' }}>
              Your Order ID is <strong>#{recentOrderId}</strong>. Thank you for shopping with Smart E-Commerce!
            </p>
          </div>
        </div>
      )}

      {/* Page Title */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div style={{
          width: 42, height: 42, borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #4338ca)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="fa-solid fa-box-archive text-white" style={{ fontSize: '1rem' }}></i>
        </div>
        <div>
          <h3 className="fw-bold mb-0">My Orders</h3>
          <p className="mb-0" style={{ fontSize: '0.83rem', color: '#64748b' }}>
            {userOrders.length} order{userOrders.length !== 1 ? 's' : ''} placed
          </p>
        </div>
      </div>

      {userOrders.length === 0 ? (
        <div className="empty-state-card" style={{ maxWidth: 440, margin: '0 auto' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
          }}>
            <i className="fa-solid fa-box-open" style={{ fontSize: '2rem', color: '#6366f1' }}></i>
          </div>
          <h5 className="fw-bold mb-2">No Orders Yet</h5>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>You haven't placed any orders. Start shopping to see them here.</p>
          <Link to="/products" className="btn btn-primary mt-2 px-4">
            <i className="fa-solid fa-store me-2"></i>Start Shopping
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {userOrders.map((ord) => {
            const cfg = statusConfig[ord.status] || statusConfig['Pending'];
            return (
              <div key={ord.orderId} className="card" style={{ borderRadius: '18px', overflow: 'hidden' }}>

                {/* Order Header */}
                <div
                  className="d-flex flex-wrap justify-content-between align-items-center gap-2 px-4 py-3"
                  style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}
                >
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                      Order #{ord.orderId}
                    </span>
                    <span style={{
                      marginLeft: 12, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500,
                    }}>
                      <i className="fa-regular fa-calendar me-1"></i>{ord.date}
                    </span>
                  </div>
                  {/* Status badge */}
                  <span style={{
                    background: cfg.bg, color: cfg.color,
                    border: `1px solid ${cfg.border}`,
                    borderRadius: '999px', padding: '5px 16px',
                    fontSize: '0.78rem', fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}>
                    <i className={`fa-solid ${cfg.icon}`} style={{ fontSize: '0.7rem' }}></i>
                    {ord.status}
                  </span>
                </div>

                {/* Order Body */}
                <div className="card-body p-4">
                  <div className="row g-4">

                    {/* Items */}
                    <div className="col-md-8">
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '12px' }}>
                        Items ({ord.items.length})
                      </p>
                      <div className="d-flex flex-column gap-3">
                        {ord.items.map((it) => {
                          const unitPrice = Math.round(
                            it.product.price - (it.product.price * it.product.discount) / 100
                          );
                          return (
                            <div
                              key={it.product.pid}
                              className="d-flex align-items-center justify-content-between gap-3"
                            >
                              <div className="d-flex align-items-center gap-3">
                                <div style={{
                                  width: 52, height: 52, borderRadius: '10px',
                                  background: '#f8fafc', border: '1px solid #f1f5f9',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  flexShrink: 0,
                                }}>
                                  <img
                                    src={it.product.image ? `/Images/${it.product.image}` : '/Images/product.png'}
                                    alt={it.product.name}
                                    style={{ maxWidth: '40px', maxHeight: '40px', objectFit: 'contain' }}
                                    onError={(e) => { e.target.src = '/Images/product.png'; }}
                                  />
                                </div>
                                <div>
                                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                                    {it.product.name}
                                  </p>
                                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                                    Qty: {it.quantity}
                                  </p>
                                </div>
                              </div>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'nowrap' }}>
                                ₹{(unitPrice * it.quantity).toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shipping + Total */}
                    <div className="col-md-4">
                      <div
                        className="p-3 rounded-3 h-100"
                        style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
                      >
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '10px' }}>
                          Delivery
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '16px' }}>
                          <i className="fa-solid fa-location-dot me-2" style={{ color: '#6366f1' }}></i>
                          {ord.shippingAddress}
                        </p>
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                          Payment
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '16px' }}>
                          <i className="fa-solid fa-credit-card me-2" style={{ color: '#6366f1' }}></i>
                          {ord.paymentMethod}
                        </p>
                        <div
                          className="d-flex justify-content-between align-items-center pt-3"
                          style={{ borderTop: '1px solid #e2e8f0' }}
                        >
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#64748b' }}>Total Paid</span>
                          <span style={{
                            fontWeight: 800, fontSize: '1.1rem',
                            background: 'linear-gradient(135deg, #0f172a, #312e81)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                          }}>
                            ₹{ord.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
