import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

const AdminModals = ({ showAddCategory, setShowAddCategory, showAddProduct, setShowAddProduct }) => {
  const { categories, addCategory, addProduct } = useStore();

  // Category form state
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');

  // Product form state
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodQty, setProdQty] = useState('');
  const [prodDisc, setProdDisc] = useState('');
  const [prodCid, setProdCid] = useState('');
  const [prodImage, setProdImage] = useState('');

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    addCategory({
      name: catName.trim(),
      image: catImage.trim() || 'categories.png'
    });
    setCatName('');
    setCatImage('');
    setShowAddCategory(false);
  };

  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice || !prodCid) return;
    addProduct({
      name: prodName.trim(),
      description: prodDesc.trim(),
      price: Number(prodPrice),
      quantity: Number(prodQty) || 1,
      discount: Number(prodDisc) || 0,
      cid: Number(prodCid),
      image: prodImage.trim() || 'product.png'
    });
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdQty('');
    setProdDisc('');
    setProdCid('');
    setProdImage('');
    setShowAddProduct(false);
  };

  return (
    <>
      {/* Add Category Modal */}
      {showAddCategory && (
        <div class="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content shadow-lg border-0">
              <div class="modal-header bg-primary text-white">
                <h5 class="modal-title fw-bold"><i class="fa-solid fa-folder-plus me-2"></i>Add New Category</h5>
                <button type="button" class="btn-close btn-close-white" onClick={() => setShowAddCategory(false)}></button>
              </div>
              <form onSubmit={handleAddCategorySubmit}>
                <div class="modal-body p-4">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Category Title</label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="e.g. Mobiles, Appliances"
                      required
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Image Name / URL</label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="e.g. mobiles.jpeg"
                      value={catImage}
                      onChange={(e) => setCatImage(e.target.value)}
                    />
                  </div>
                </div>
                <div class="modal-footer bg-light">
                  <button type="button" class="btn btn-secondary" onClick={() => setShowAddCategory(false)}>Cancel</button>
                  <button type="submit" class="btn btn-primary fw-semibold"><i class="fa-solid fa-check me-1"></i>Save Category</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div class="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content shadow-lg border-0">
              <div class="modal-header bg-primary text-white">
                <h5 class="modal-title fw-bold"><i class="fa-solid fa-box-open me-2"></i>Add New Product</h5>
                <button type="button" class="btn-close btn-close-white" onClick={() => setShowAddProduct(false)}></button>
              </div>
              <form onSubmit={handleAddProductSubmit}>
                <div class="modal-body p-4">
                  <div class="row g-3">
                    <div class="col-md-8">
                      <label class="form-label fw-semibold">Product Name</label>
                      <input
                        type="text"
                        class="form-control"
                        placeholder="Enter product title"
                        required
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                      />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label fw-semibold">Category</label>
                      <select
                        class="form-select"
                        required
                        value={prodCid}
                        onChange={(e) => setProdCid(e.target.value)}
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c.cid} value={c.cid}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div class="col-12">
                      <label class="form-label fw-semibold">Description</label>
                      <textarea
                        class="form-control"
                        rows="3"
                        placeholder="Product specifications & description"
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                      ></textarea>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label fw-semibold">Price (₹)</label>
                      <input
                        type="number"
                        class="form-control"
                        placeholder="19999"
                        required
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                      />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label fw-semibold">Quantity Stock</label>
                      <input
                        type="number"
                        class="form-control"
                        placeholder="10"
                        required
                        value={prodQty}
                        onChange={(e) => setProdQty(e.target.value)}
                      />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label fw-semibold">Discount (%)</label>
                      <input
                        type="number"
                        class="form-control"
                        placeholder="15"
                        value={prodDisc}
                        onChange={(e) => setProdDisc(e.target.value)}
                      />
                    </div>
                    <div class="col-12">
                      <label class="form-label fw-semibold">Image Name / URL</label>
                      <input
                        type="text"
                        class="form-control"
                        placeholder="e.g. phone1.jpeg"
                        value={prodImage}
                        onChange={(e) => setProdImage(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div class="modal-footer bg-light">
                  <button type="button" class="btn btn-secondary" onClick={() => setShowAddProduct(false)}>Cancel</button>
                  <button type="submit" class="btn btn-primary fw-semibold"><i class="fa-solid fa-plus me-1"></i>Add Product</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminModals;
