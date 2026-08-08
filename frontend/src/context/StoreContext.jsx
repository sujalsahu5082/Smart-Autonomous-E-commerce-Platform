import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

const initialCategories = [
  { cid: 1, name: 'Mobiles', image: 'mobiles.jpeg' },
  { cid: 2, name: 'Appliances', image: 'appliances.png' },
  { cid: 3, name: 'Laptops', image: 'newlaptop.jpeg' },
  { cid: 4, name: 'Home & Furniture', image: 'home-furniture.png' },
  { cid: 5, name: 'Books', image: 'books-.png' },
  { cid: 6, name: 'Clothes & Fashion', image: 'cloths.png' },
  { cid: 7, name: 'Electronics', image: 'electronics.png' }
];

const initialProducts = [
  {
    pid: 1,
    name: 'SAMSUNG Galaxy F14 5G',
    description: 'The Samsung Galaxy F14 smartphone uses a segment-only 5nm processor that enables easy multitasking, gaming, and a 6000 mAh battery.',
    price: 18490,
    quantity: 9,
    discount: 24,
    image: 'phone1.jpeg',
    cid: 1
  },
  {
    pid: 2,
    name: 'LG 242 L Frost Free Double Door Refrigerator',
    description: 'Smart Inverter Compressor designed to deliver energy-efficient performance with Door Cooling+ feature.',
    price: 37099,
    quantity: 50,
    discount: 29,
    image: 'fridge1.jpeg',
    cid: 2
  },
  {
    pid: 3,
    name: 'OnePlus Y1S Pro 138 cm Ultra HD (4K) Smart TV',
    description: 'Gamma Engine smart contrast and color max display quality for an unmatched immersive experience.',
    price: 49999,
    quantity: 5,
    discount: 18,
    image: 'tv1.jpeg',
    cid: 2
  },
  {
    pid: 8,
    name: 'Samsung Galaxy S23 5G',
    description: 'Flagship smartphone with Snapdragon 8 Gen 2, dynamic AMOLED 2X display, and nightography camera.',
    price: 79999,
    quantity: 10,
    discount: 17,
    image: 'Samsung_Galaxy.jpg',
    cid: 1
  },
  {
    pid: 9,
    name: 'ASUS TUF Gaming A15',
    description: '15.6 inch Full HD 144Hz IPS display, AMD Ryzen 7, NVIDIA RTX graphics card.',
    price: 71990,
    quantity: 11,
    discount: 20,
    image: 'asus_tuf.jpeg',
    cid: 3
  },
  {
    pid: 10,
    name: 'Men Printed Casual Jacket',
    description: 'Pure Cotton hooded casual jacket with zipper closure.',
    price: 1999,
    quantity: 15,
    discount: 57,
    image: 'men_jacket.jpeg',
    cid: 6
  },
  {
    pid: 12,
    name: 'boAt Airdopes 161 with 40 Hours Playback',
    description: '10mm drivers, ASAP Charge, 40 hours playback time, IPX5 water resistance.',
    price: 2400,
    quantity: 27,
    discount: 42,
    image: 'boat-airdopes.jpeg',
    cid: 7
  },
  {
    pid: 13,
    name: 'KURLON Natural Product 5 inch Queen Mattress',
    description: 'Firm support coir mattress with PU foam layer.',
    price: 8000,
    quantity: 11,
    discount: 16,
    image: 'mattress.jpeg',
    cid: 4
  }
];

const initialAdmins = [
  { id: 1, name: 'Admin User', email: 'admin@smartecommerce.com', password: 'admin', phone: '9876543210' }
];

export const StoreProvider = ({ children }) => {
  const getStored = (key, fallback) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      const parsed = JSON.parse(item);
      // Sanitize legacy name if present
      if (Array.isArray(parsed)) {
        return parsed.map(a => a && a.name === 'Anirudh Bhagat' ? { ...a, name: 'Admin User' } : a);
      }
      if (parsed && parsed.name === 'Anirudh Bhagat') {
        return { ...parsed, name: 'Admin User' };
      }
      return parsed;
    } catch (e) {
      return fallback;
    }
  };

  const setStored = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  };

  // State definitions
  const [categories, setCategories] = useState(() => getStored('ez_categories', initialCategories));
  const [products, setProducts] = useState(() => getStored('ez_products', initialProducts));
  const [users, setUsers] = useState(() => getStored('ez_users', []));
  const [admins, setAdmins] = useState(() => getStored('ez_admins', initialAdmins));
  const [activeUser, setActiveUser] = useState(() => getStored('ez_active_user', null));
  const [activeAdmin, setActiveAdmin] = useState(() => getStored('ez_active_admin', null));
  const [cart, setCart] = useState(() => getStored('ez_cart', []));
  const [wishlist, setWishlist] = useState(() => getStored('ez_wishlist', []));
  const [orders, setOrders] = useState(() => getStored('ez_orders', []));

  // Sync to localStorage
  useEffect(() => setStored('ez_categories', categories), [categories]);
  useEffect(() => setStored('ez_products', products), [products]);
  useEffect(() => setStored('ez_users', users), [users]);
  useEffect(() => setStored('ez_admins', admins), [admins]);
  useEffect(() => setStored('ez_active_user', activeUser), [activeUser]);
  useEffect(() => setStored('ez_active_admin', activeAdmin), [activeAdmin]);
  useEffect(() => setStored('ez_cart', cart), [cart]);
  useEffect(() => setStored('ez_wishlist', wishlist), [wishlist]);
  useEffect(() => setStored('ez_orders', orders), [orders]);

  // Auth Operations
  const registerUser = (userData) => {
    if (users.some(u => u.email === userData.email)) {
      return { success: false, message: 'Email already registered!' };
    }
    const newUser = { id: Date.now(), ...userData };
    const updated = [...users, newUser];
    setUsers(updated);
    setActiveUser(newUser);
    return { success: true, user: newUser };
  };

  const loginUser = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setActiveUser(user);
      setActiveAdmin(null);
      return { success: true, user };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  const loginAdmin = (email, password) => {
    const admin = admins.find(a => a.email === email && a.password === password);
    if (admin) {
      setActiveAdmin(admin);
      setActiveUser(null);
      return { success: true, admin };
    }
    return { success: false, message: 'Invalid admin credentials' };
  };

  const logout = () => {
    setActiveUser(null);
    setActiveAdmin(null);
  };

  const updateUserProfile = (updatedData) => {
    if (!activeUser) return;
    const updatedUser = { ...activeUser, ...updatedData };
    setActiveUser(updatedUser);
    setUsers(users.map(u => u.id === activeUser.id ? updatedUser : u));
    return { success: true };
  };

  // Cart Operations
  const addToCart = (product, qty = 1) => {
    const existingIndex = cart.findIndex(item => item.product.pid === product.pid);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += qty;
      setCart(updatedCart);
    } else {
      setCart([...cart, { product, quantity: qty }]);
    }
  };

  const updateCartQuantity = (pid, quantity) => {
    if (quantity <= 0) {
      removeFromCart(pid);
    } else {
      setCart(cart.map(item => item.product.pid === pid ? { ...item, quantity } : item));
    }
  };

  const removeFromCart = (pid) => {
    setCart(cart.filter(item => item.product.pid !== pid));
  };

  const clearCart = () => setCart([]);

  // Wishlist Operations
  const toggleWishlist = (product) => {
    const exists = wishlist.some(p => p.pid === product.pid);
    if (exists) {
      setWishlist(wishlist.filter(p => p.pid !== product.pid));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const isInWishlist = (pid) => wishlist.some(p => p.pid === pid);

  // Category CRUD
  const addCategory = (category) => {
    const newCat = { cid: Date.now(), ...category };
    setCategories([...categories, newCat]);
    return newCat;
  };

  const updateCategory = (cid, updated) => {
    setCategories(categories.map(c => c.cid === Number(cid) ? { ...c, ...updated } : c));
  };

  const deleteCategory = (cid) => {
    setCategories(categories.filter(c => c.cid !== Number(cid)));
  };

  // Product CRUD
  const addProduct = (product) => {
    const newProd = { pid: Date.now(), ...product };
    setProducts([...products, newProd]);
    return newProd;
  };

  const updateProduct = (pid, updated) => {
    setProducts(products.map(p => p.pid === Number(pid) ? { ...p, ...updated } : p));
  };

  const deleteProduct = (pid) => {
    setProducts(products.filter(p => p.pid !== Number(pid)));
  };

  // Orders
  const placeOrder = (orderData) => {
    const newOrder = {
      orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toISOString().split('T')[0],
      status: 'Order Placed',
      userId: activeUser ? activeUser.id : null,
      userName: activeUser ? activeUser.name : orderData.name,
      userPhone: activeUser ? activeUser.phone : orderData.phone,
      items: [...cart],
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      shippingAddress: orderData.shippingAddress
    };

    setOrders([newOrder, ...orders]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(orders.map(o => o.orderId === orderId ? { ...o, status } : o));
  };

  // User & Admin Management
  const deleteUser = (userId) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const addAdmin = (adminData) => {
    const newAdmin = { id: Date.now(), ...adminData };
    setAdmins([...admins, newAdmin]);
  };

  const deleteAdmin = (adminId) => {
    setAdmins(admins.filter(a => a.id !== adminId));
  };

  return (
    <StoreContext.Provider value={{
      categories, products, users, admins, activeUser, activeAdmin, cart, wishlist, orders,
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
