import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Orders = () => {
  const { orders, activeUser } = useStore();
  const location = useLocation();
  const recentOrderId = location.state ? location.state.orderId : null;

  const userOrders = activeUser
    ? orders.filter(o => o.userId === activeUser.id)
    : orders;

  return (
    <div class="container py-5">
      {recentOrderId && (
        <div class="alert alert-success alert-dismissible fade show mb-4 shadow-sm" role="alert">
          <h4 class="alert-heading fw-bold"><i class="fa-solid fa-circle-check me-2"></i>Order Placed Successfully!</h4>
          <p class="mb-0">Your order ID is <strong>{recentOrderId}</strong>. Thank you for shopping with EazyDeals!</p>
        </div>
      )}

      <h3 class="fw-bold mb-4"><i class="fa-solid fa-box-archive text-primary me-2"></i>My Orders History</h3>

      {userOrders.length === 0 ? (
        <div class="text-center py-5 bg-white rounded-3 shadow-sm p-4">
          <img src="/Images/order.png" alt="No Orders" style={{ width: '130px' }} class="mb-3" />
          <h5>No Orders Placed Yet</h5>
          <p class="text-muted small">You haven't placed any orders with us so far.</p>
          <Link to="/products" class="btn btn-primary fw-semibold">Start Shopping</Link>
        </div>
      ) : (
        <div class="d-flex flex-column gap-4">
          {userOrders.map((ord) => (
            <div key={ord.orderId} class="card shadow-sm border-0 rounded-3">
              <div class="card-header bg-light d-flex flex-wrap justify-content-between align-items-center py-3">
                <div>
                  <span class="fw-bold me-3">Order ID: {ord.orderId}</span>
                  <span class="text-muted small">Date: {ord.date}</span>
                </div>
                <div>
                  <span class="badge bg-info text-dark px-3 py-2 fw-semibold">{ord.status}</span>
                </div>
              </div>
              <div class="card-body p-4">
                <div class="row">
                  <div class="col-md-8 border-end">
                    <h6 class="fw-bold mb-3">Items Purchased ({ord.items.length})</h6>
                    <div class="d-flex flex-column gap-2 mb-3">
                      {ord.items.map((it) => {
                        const unitPrice = Math.round(it.product.price - (it.product.price * it.product.discount) / 100);
                        return (
                          <div key={it.product.pid} class="d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center gap-3">
                              <img
                                src={it.product.image ? `/Images/${it.product.image}` : '/Images/product.png'}
                                alt={it.product.name}
                                style={{ width: '45px', height: '45px', objectFit: 'contain' }}
                                onError={(e) => { e.target.src = '/Images/product.png'; }}
                              />
                              <div>
                                <div class="fw-semibold small">{it.product.name}</div>
                                <div class="text-muted extra-small">Qty: {it.quantity}</div>
                              </div>
                            </div>
                            <div class="fw-bold small">₹{(unitPrice * it.quantity).toLocaleString()}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div class="col-md-4 ps-md-4 mt-3 mt-md-0">
                    <h6 class="fw-bold mb-2">Delivery Address</h6>
                    <p class="text-muted small mb-3">{ord.shippingAddress}</p>

                    <h6 class="fw-bold mb-1">Payment Method</h6>
                    <p class="text-muted small mb-3">{ord.paymentMethod}</p>

                    <div class="d-flex justify-content-between align-items-center fs-5 fw-bold text-primary">
                      <span>Total Paid:</span>
                      <span>₹{ord.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
