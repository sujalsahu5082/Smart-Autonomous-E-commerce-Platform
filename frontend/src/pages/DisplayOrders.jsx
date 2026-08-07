import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const DisplayOrders = () => {
  const { orders, updateOrderStatus } = useStore();

  return (
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="fw-bold m-0"><i class="fa-solid fa-cart-flatbed me-2 text-warning"></i>Customer Orders ({orders.length})</h4>
        <Link to="/admin" class="btn btn-outline-secondary btn-sm"><i class="fa-solid fa-arrow-left me-1"></i>Dashboard</Link>
      </div>

      {orders.length === 0 ? (
        <div class="card shadow-sm border-0 p-5 text-center">
          <h5>No Orders Received Yet</h5>
        </div>
      ) : (
        <div class="card shadow-sm border-0 rounded-3 overflow-hidden">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-warning">
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name & Phone</th>
                  <th>Date</th>
                  <th>Total (₹)</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.orderId}>
                    <td class="fw-bold">{ord.orderId}</td>
                    <td>
                      <div class="fw-semibold">{ord.userName}</div>
                      <div class="text-muted extra-small">{ord.userPhone}</div>
                    </td>
                    <td>{ord.date}</td>
                    <td class="fw-bold text-primary">₹{ord.totalAmount.toLocaleString()}</td>
                    <td><span class="badge bg-light text-dark border">{ord.paymentMethod}</span></td>
                    <td>
                      <span class={`badge ${ord.status === 'Delivered' ? 'bg-success' : 'bg-info text-dark'}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td>
                      <select
                        class="form-select form-select-sm"
                        value={ord.status}
                        onChange={(e) => updateOrderStatus(ord.orderId, e.target.value)}
                        style={{ width: '150px' }}
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayOrders;
