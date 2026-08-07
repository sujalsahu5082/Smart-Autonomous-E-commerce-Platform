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
      <div class="container py-5 text-center">
        <div class="card shadow-sm border-0 p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <img src="/Images/empty-cart.png" alt="Empty Cart" class="mx-auto mb-4" style={{ width: '150px' }} />
          <h4 class="fw-bold">Your Cart is Empty</h4>
          <p class="text-muted small">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" class="btn btn-primary fw-semibold mt-3">Start Shopping Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div class="container py-5">
      <h3 class="fw-bold mb-4"><i class="fa-solid fa-cart-shopping text-primary me-2"></i>Shopping Cart</h3>

      <div class="row g-4">
        {/* Cart Items List */}
        <div class="col-lg-8">
          <div class="card shadow-sm border-0 rounded-3">
            <div class="card-body p-0">
              <ul class="list-group list-group-flush">
                {cart.map((item) => {
                  const unitDiscountPrice = Math.round(item.product.price - (item.product.price * item.product.discount) / 100);
                  return (
                    <li key={item.product.pid} class="list-group-item p-4">
                      <div class="row align-items-center">
                        <div class="col-3 col-md-2 text-center">
                          <img
                            src={item.product.image ? `/Images/${item.product.image}` : '/Images/product.png'}
                            alt={item.product.name}
                            class="img-fluid rounded"
                            style={{ maxHeight: '80px', objectFit: 'contain' }}
                            onError={(e) => { e.target.src = '/Images/product.png'; }}
                          />
                        </div>
                        <div class="col-9 col-md-5 mb-2 mb-md-0">
                          <h6 class="fw-bold mb-1">{item.product.name}</h6>
                          <div class="text-muted small mb-1">
                            Price: ₹{unitDiscountPrice.toLocaleString()} {item.product.discount > 0 && <span class="text-success ms-1">({item.product.discount}% OFF)</span>}
                          </div>
                        </div>
                        <div class="col-6 col-md-3">
                          <div class="input-group input-group-sm">
                            <button
                              class="btn btn-outline-secondary"
                              onClick={() => updateCartQuantity(item.product.pid, item.quantity - 1)}
                            >
                              -
                            </button>
                            <input
                              type="text"
                              class="form-control text-center"
                              value={item.quantity}
                              readOnly
                            />
                            <button
                              class="btn btn-outline-secondary"
                              onClick={() => updateCartQuantity(item.product.pid, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div class="col-6 col-md-2 text-end">
                          <div class="fw-bold mb-2">₹{(unitDiscountPrice * item.quantity).toLocaleString()}</div>
                          <button
                            class="btn btn-outline-danger btn-sm"
                            onClick={() => removeFromCart(item.product.pid)}
                            title="Remove item"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div class="col-lg-4">
          <div class="card shadow-sm border-0 rounded-3">
            <div class="card-header bg-white py-3 border-bottom">
              <h5 class="fw-bold mb-0">Price Details</h5>
            </div>
            <div class="card-body p-4">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Total Items</span>
                <span class="fw-semibold">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Original Price</span>
                <span>₹{Math.round(totalOriginal).toLocaleString()}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Discount Savings</span>
                <span class="text-success">- ₹{Math.round(totalDiscount).toLocaleString()}</span>
              </div>
              <div class="d-flex justify-content-between mb-3">
                <span class="text-muted">Delivery Charges</span>
                <span class="text-success fw-semibold">FREE</span>
              </div>
              <hr />
              <div class="d-flex justify-content-between mb-4 fs-5 fw-bold">
                <span>Total Amount</span>
                <span class="text-primary">₹{grandTotal.toLocaleString()}</span>
              </div>

              <button
                class="btn btn-primary btn-lg w-100 fw-semibold"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout <i class="fa-solid fa-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
