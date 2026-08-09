import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminModals from './components/AdminModals';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import OtpCode from './pages/OtpCode';
import ChangePassword from './pages/ChangePassword';
import Profile from './pages/Profile';
import PersonalInfo from './pages/PersonalInfo';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DisplayAdmin from './pages/DisplayAdmin';
import DisplayCategory from './pages/DisplayCategory';
import DisplayOrders from './pages/DisplayOrders';
import DisplayProducts from './pages/DisplayProducts';
import DisplayUsers from './pages/DisplayUsers';
import UpdateCategory from './pages/UpdateCategory';
import UpdateProduct from './pages/UpdateProduct';
import NotFound from './pages/NotFound';

function App() {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar
        onOpenAddCategory={() => setShowAddCategory(true)}
        onOpenAddProduct={() => setShowAddProduct(true)}
      />

      <AdminModals
        showAddCategory={showAddCategory}
        setShowAddCategory={setShowAddCategory}
        showAddProduct={showAddProduct}
        setShowAddProduct={setShowAddProduct}
      />

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order" element={<Orders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-code" element={<OtpCode />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/personal-info" element={<PersonalInfo />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminDashboard
                onOpenAddCategory={() => setShowAddCategory(true)}
                onOpenAddProduct={() => setShowAddProduct(true)}
              />
            }
          />
          <Route path="/admin/display-admin" element={<DisplayAdmin />} />
          <Route
            path="/admin/display-category"
            element={<DisplayCategory onOpenAddCategory={() => setShowAddCategory(true)} />}
          />
          <Route path="/admin/display-orders" element={<DisplayOrders />} />
          <Route
            path="/admin/display-products"
            element={<DisplayProducts onOpenAddProduct={() => setShowAddProduct(true)} />}
          />
          <Route path="/admin/display-users" element={<DisplayUsers />} />
          <Route path="/admin/update-category/:id" element={<UpdateCategory />} />
          <Route path="/admin/update-product/:id" element={<UpdateProduct />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
