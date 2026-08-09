import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const DisplayProducts = ({ onOpenAddProduct }) => {
  const { products, categories, deleteProduct } = useStore();

  const getCatName = (cid) => {
    const c = categories.find(cat => cat.cid === cid);
    return c ? c.name : 'N/A';
  };

  return (
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="fw-bold m-0"><i class="fa-solid fa-boxes-stacked me-2 text-success"></i>Product Inventory ({products.length})</h4>
        <div>
          <Link to="/admin" class="btn btn-outline-secondary btn-sm me-2"><i class="fa-solid fa-arrow-left me-1"></i>Dashboard</Link>
          <button class="btn btn-success btn-sm fw-semibold" onClick={onOpenAddProduct}><i class="fa-solid fa-plus me-1"></i>Add Product</button>
        </div>
      </div>

      <div class="card shadow-sm border-0 rounded-3 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 text-center">
            <thead class="table-dark">
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price (₹)</th>
                <th>Discount</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.pid}>
                  <td>
                    <img
                      src={p.image ? (p.image.startsWith('http') ? p.image : `/Images/${p.image}`) : '/Images/product.png'}
                      alt={p.name}
                      style={{ width: '45px', height: '45px', objectFit: 'contain' }}
                      onError={(e) => { e.target.src = '/Images/product.png'; }}
                    />
                  </td>
                  <td class="fw-bold text-start" style={{ maxWidth: '200px' }}>
                    <div class="text-truncate" title={p.name}>{p.name}</div>
                  </td>
                  <td><span class="badge bg-secondary">{getCatName(p.cid)}</span></td>
                  <td class="fw-semibold">₹{p.price.toLocaleString()}</td>
                  <td class="text-success fw-bold">{p.discount}%</td>
                  <td>
                    <span class={`badge ${p.quantity > 5 ? 'bg-success' : 'bg-danger'}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td>
                    <Link to={`/admin/update-product/${p.pid}`} class="btn btn-outline-primary btn-sm me-2">
                      <i class="fa-solid fa-pen"></i> Edit
                    </Link>
                    <button class="btn btn-outline-danger btn-sm" onClick={() => deleteProduct(p.pid)}>
                      <i class="fa-solid fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DisplayProducts;
