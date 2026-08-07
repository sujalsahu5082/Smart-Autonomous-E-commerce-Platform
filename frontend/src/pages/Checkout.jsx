import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Checkout = () => {
  const { cart, activeUser, placeOrder } = useStore();
  const navigate = useNavigate();

  const [name, setName] = useState(activeUser ? activeUser.name : '');
  const [phone, setPhone] = useState(activeUser ? activeUser.phone : '');
  const [address, setAddress] = useState(activeUser ? activeUser.address || '' : '');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const totalOriginal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalDiscount = cart.reduce((sum, item) => {
    const d = (item.product.price * item.product.discount) / 100;
    return sum + d * item.quantity;
  }, 0);
  const grandTotal = Math.round(totalOriginal - totalDiscount);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !address) return;

    const fullAddress = `${address}, ${city} - ${pincode}`;
    const newOrder = placeOrder({
      name,
      phone,
      shippingAddress: fullAddress,
      totalAmount: grandTotal,
      paymentMethod
    });

    navigate('/order', { state: { orderId: newOrder.orderId } });
  };

  if (cart.length === 0) {
    return (
      <div class="container py-5 text-center">
        <h4>No items to checkout</h4>
        <button class="btn btn-primary mt-3" onClick={() => navigate('/products')}>Browse Products</button>
      </div>
    );
  }

  return (
    <div class="container py-5">
      <h3 class="fw-bold mb-4"><i class="fa-solid fa-credit-card text-primary me-2"></i>Checkout & Payment</h3>

      <form onSubmit={handleSubmit}>
        <div class="row g-4">
          {/* Shipping Address Form */}
          <div class="col-lg-7">
            <div class="card shadow-sm border-0 rounded-3 mb-4">
              <div class="card-header bg-white py-3 border-bottom">
                <h5 class="fw-bold mb-0"><i class="fa-solid fa-truck-fast me-2 text-primary"></i>Shipping Details</h5>
              </div>
              <div class="card-body p-4">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Full Name</label>
                    <input
                      type="text"
                      class="form-control"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Phone Number</label>
                    <input
                      type="tel"
                      class="form-control"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold">Street Address / House No.</label>
                    <textarea
                      class="form-control"
                      rows="2"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    ></textarea>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">City / Town</label>
                    <input
                      type="text"
                      class="form-control"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Pincode</label>
                    <input
                      type="text"
                      class="form-control"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div class="card shadow-sm border-0 rounded-3">
              <div class="card-header bg-white py-3 border-bottom">
                <h5 class="fw-bold mb-0"><i class="fa-solid fa-wallet me-2 text-primary"></i>Select Payment Method</h5>
              </div>
              <div class="card-body p-4">
                <div class="form-check p-3 border rounded-3 mb-2">
                  <input
                    class="form-check-input ms-0 me-3"
                    type="radio"
                    name="paymentOption"
                    id="cod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label class="form-check-label fw-semibold" htmlFor="cod">
                    Cash on Delivery (COD)
                  </label>
                </div>
                <div class="form-check p-3 border rounded-3 mb-2">
                  <input
                    class="form-check-input ms-0 me-3"
                    type="radio"
                    name="paymentOption"
                    id="card"
                    value="Credit/Debit Card"
                    checked={paymentMethod === 'Credit/Debit Card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label class="form-check-label fw-semibold" htmlFor="card">
                    Credit / Debit Card (Visa, MasterCard)
                  </label>
                </div>
                <div class="form-check p-3 border rounded-3">
                  <input
                    class="form-check-input ms-0 me-3"
                    type="radio"
                    name="paymentOption"
                    id="upi"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label class="form-check-label fw-semibold" htmlFor="upi">
                    UPI / Google Pay / PhonePe
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items & Summary */}
          <div class="col-lg-5">
            <div class="card shadow-sm border-0 rounded-3">
              <div class="card-header bg-white py-3 border-bottom">
                <h5 class="fw-bold mb-0">Order Summary</h5>
              </div>
              <div class="card-body p-4">
                <div class="mb-3 max-vh-50 overflow-auto">
                  {cart.map((item) => {
                    const discountPrice = Math.round(item.product.price - (item.product.price * item.product.discount) / 100);
                    return (
                      <div key={item.product.pid} class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                        <div>
                          <div class="fw-bold small text-truncate" style={{ maxWidth: '200px' }}>{item.product.name}</div>
                          <div class="text-muted extra-small">Qty: {item.quantity} × ₹{discountPrice.toLocaleString()}</div>
                        </div>
                        <div class="fw-bold small">₹{(discountPrice * item.quantity).toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>

                <div class="d-flex justify-content-between mb-2 text-muted">
                  <span>Subtotal</span>
                  <span>₹{Math.round(totalOriginal).toLocaleString()}</span>
                </div>
                <div class="d-flex justify-content-between mb-2 text-success">
                  <span>Discount</span>
                  <span>- ₹{Math.round(totalDiscount).toLocaleString()}</span>
                </div>
                <div class="d-flex justify-content-between mb-3 text-muted">
                  <span>Delivery</span>
                  <span class="text-success fw-semibold">FREE</span>
                </div>
                <hr />
                <div class="d-flex justify-content-between mb-4 fs-4 fw-bold">
                  <span>Total Payable</span>
                  <span class="text-primary">₹{grandTotal.toLocaleString()}</span>
                </div>

                <button type="submit" class="btn btn-success btn-lg w-100 fw-bold shadow-sm">
                  <i class="fa-solid fa-circle-check me-2"></i>Place Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
