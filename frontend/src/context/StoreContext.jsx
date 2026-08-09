import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAuth, clearAuth } from '../api/client';

const StoreContext = createContext();

const mapOrder = (o) => ({
  id: o.id,
  orderId: o.orderid,
  date: (o.date || '').split('T')[0],
  status: o.status,
  userId: o.userId,
  userName: o.userName,
  userPhone: o.userPhone,
  items: (o.items || []).map((i) => ({
    product: { pid: i.productId, name: i.name, price: i.price, image: i.image },
    quantity: i.quantity
  })),
  totalAmount: o.totalAmount,
  paymentMethod: o.paymentType,
  shippingAddress: o.shippingAddress
});

const mapOrderForAdmin = (o, users) => {
  const user = users.find((u) => u.id === o.userId);
  return { ...mapOrder(o), userName: user ? user.name : 'Guest', userPhone: user ? user.phone : '-' };
};

export const StoreProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [activeAdmin, setActiveAdmin] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- helpers -------------------------------------------------------------

  const loadCatalog = useCallback(async () => {
    try {
      const [cats, prods] = await Promise.all([api.get('/categories'), api.get('/products')]);
      setCategories(cats);
      setProducts(prods);
    } catch (e) {
      console.error('Failed to load catalog', e);
    }
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      const [user, cartData, wishData, orderData] = await Promise.all([
        api.get('/auth/me'),
        api.get('/cart'),
        api.get('/wishlist'),
        api.get('/orders')
      ]);
      setActiveUser(user);
      setCart(cartData);
      setWishlist(wishData.map((w) => w.product).filter(Boolean));
      setOrders(orderData.map(mapOrder));
    } catch (e) {
      console.error('Failed to restore session', e);
      clearAuth();
      setActiveUser(null);
      setActiveAdmin(null);
    }
  }, []);

  const loadAdminData = useCallback(async () => {
    try {
      const [admin, userList, adminList, orderList] = await Promise.all([
        api.get('/auth/me'),
        api.get('/admin/users'),
        api.get('/admin/admins'),
        api.get('/admin/orders')
      ]);
      setActiveAdmin(admin);
      setUsers(userList);
      setAdmins(adminList);
      setOrders(orderList.map((o) => mapOrderForAdmin(o, userList)));
    } catch (e) {
      console.error('Failed to load admin data', e);
      clearAuth();
      setActiveAdmin(null);
    }
  }, []);

  // ---- initial load --------------------------------------------------------

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadCatalog();
      if (localStorage.getItem('ez_role') === 'admin') {
        await loadAdminData();
      } else if (localStorage.getItem('ez_token')) {
        await loadUserData();
      }
      setLoading(false);
    })();
  }, [loadCatalog, loadUserData, loadAdminData]);

  // ---- Auth Operations -----------------------------------------------------

  const registerUser = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      setAuth(res.access_token, 'user');
      setActiveUser(res.user);
      setActiveAdmin(null);
      setCart([]);
      setWishlist([]);
      setOrders([]);
      return { success: true, user: res.user };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const loginUser = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.access_token, 'user');
      setActiveUser(res.user);
      setActiveAdmin(null);
      await loadUserData();
      return { success: true, user: res.user };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const loginAdmin = async (email, password) => {
    try {
      const res = await api.post('/auth/admin-login', { email, password });
      setAuth(res.access_token, 'admin');
      setActiveAdmin(res.admin);
      setActiveUser(null);
      await loadAdminData();
      return { success: true, admin: res.admin };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const logout = () => {
    clearAuth();
    setActiveUser(null);
    setActiveAdmin(null);
    setCart([]);
    setWishlist([]);
    setOrders([]);
    setUsers([]);
    setAdmins([]);
  };

  const updateUserProfile = async (updatedData) => {
    try {
      const user = await api.put('/auth/me', updatedData);
      setActiveUser(user);
      return { success: true };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  // ---- Cart Operations -----------------------------------------------------

  const refreshCart = async () => {
    try {
      const data = await api.get('/cart');
      setCart(data);
    } catch (e) {
      console.error('Failed to refresh cart', e);
    }
  };

  const addToCart = async (product, qty = 1) => {
    if (!activeUser) return;
    try {
      await api.post('/cart', { pid: product.pid, quantity: qty });
      await refreshCart();
    } catch (e) {
      console.error(e.message);
    }
  };

  const updateCartQuantity = async (pid, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(pid);
      return;
    }
    const item = cart.find((i) => i.product && i.product.pid === pid);
    if (!item) return;
    try {
      await api.put(`/cart/${item.id}`, { quantity });
      await refreshCart();
    } catch (e) {
      console.error(e.message);
    }
  };

  const removeFromCart = async (pid) => {
    const item = cart.find((i) => i.product && i.product.pid === pid);
    if (!item) return;
    try {
      await api.delete(`/cart/${item.id}`);
      await refreshCart();
    } catch (e) {
      console.error(e.message);
    }
  };

  const clearCart = () => setCart([]);

  // ---- Wishlist Operations -------------------------------------------------

  const refreshWishlist = async () => {
    try {
      const data = await api.get('/wishlist');
      setWishlist(data.map((w) => w.product).filter(Boolean));
    } catch (e) {
      console.error('Failed to refresh wishlist', e);
    }
  };

  const toggleWishlist = async (product) => {
    const exists = wishlist.some((p) => p.pid === product.pid);
    try {
      if (exists) {
        await api.delete(`/wishlist/${product.pid}`);
      } else {
        await api.post('/wishlist', { pid: product.pid });
      }
      await refreshWishlist();
    } catch (e) {
      console.error(e.message);
    }
  };

  const isInWishlist = (pid) => wishlist.some((p) => p.pid === pid);

  // ---- Category CRUD (admin) ----------------------------------------------

  const addCategory = async (category) => {
    try {
      const created = await api.post('/categories', category);
      setCategories([...categories, created]);
    } catch (e) {
      console.error(e.message);
    }
  };

  const updateCategory = async (cid, updated) => {
    try {
      const data = await api.put(`/categories/${cid}`, updated);
      setCategories(categories.map((c) => (c.cid === Number(cid) ? { ...c, ...data } : c)));
    } catch (e) {
      console.error(e.message);
    }
  };

  const deleteCategory = async (cid) => {
    try {
      await api.delete(`/categories/${cid}`);
      setCategories(categories.filter((c) => c.cid !== Number(cid)));
    } catch (e) {
      console.error(e.message);
    }
  };

  // ---- Product CRUD (admin) ------------------------------------------------

  const addProduct = async (product) => {
    try {
      const created = await api.post('/products', product);
      setProducts([...products, created]);
    } catch (e) {
      console.error(e.message);
    }
  };

  const updateProduct = async (pid, updated) => {
    try {
      const data = await api.put(`/products/${pid}`, updated);
      setProducts(products.map((p) => (p.pid === Number(pid) ? { ...p, ...data } : p)));
    } catch (e) {
      console.error(e.message);
    }
  };

  const deleteProduct = async (pid) => {
    try {
      await api.delete(`/products/${pid}`);
      setProducts(products.filter((p) => p.pid !== Number(pid)));
    } catch (e) {
      console.error(e.message);
    }
  };

  // ---- Orders --------------------------------------------------------------

  const placeOrder = async (orderData) => {
    try {
      const created = await api.post('/orders', {
        items: cart.map((i) => ({ productId: i.product.pid, quantity: i.quantity })),
        paymentMethod: orderData.paymentMethod,
        shippingAddress: orderData.shippingAddress
      });
      const mapped = {
        ...mapOrder(created),
        userName: activeUser ? activeUser.name : orderData.name,
        userPhone: activeUser ? activeUser.phone : orderData.phone
      };
      setOrders([mapped, ...orders]);
      setCart([]);
      return mapped;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;
    try {
      const data = await api.put(`/orders/${order.id}`, { status });
      setOrders(orders.map((o) => (o.id === data.id ? mapOrderForAdmin(data, users) : o)));
    } catch (e) {
      console.error(e.message);
    }
  };

  // ---- User & Admin Management (admin) -------------------------------------

  const deleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (e) {
      console.error(e.message);
    }
  };

  const addAdmin = async (adminData) => {
    try {
      const created = await api.post('/admin/admins', adminData);
      setAdmins([...admins, created]);
    } catch (e) {
      console.error(e.message);
    }
  };

  const deleteAdmin = async (adminId) => {
    try {
      await api.delete(`/admin/admins/${adminId}`);
      setAdmins(admins.filter((a) => a.id !== adminId));
    } catch (e) {
      console.error(e.message);
    }
  };

  return (
    <StoreContext.Provider value={{
      categories, products, users, admins, activeUser, activeAdmin, cart, wishlist, orders, loading,
      registerUser, loginUser, loginAdmin, logout, updateUserProfile,
      addToCart, updateCartQuantity, removeFromCart, clearCart,
      toggleWishlist, isInWishlist,
      addCategory, updateCategory, deleteCategory,
      addProduct, updateProduct, deleteProduct,
      placeOrder, updateOrderStatus,
      deleteUser, addAdmin, deleteAdmin
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
