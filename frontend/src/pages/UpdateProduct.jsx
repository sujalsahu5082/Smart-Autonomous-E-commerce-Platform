import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories, updateProduct } = useStore();

  const product = products.find(p => p.pid === Number(id));

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [discount, setDiscount] = useState('');
  const [cid, setCid] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price);
      setQuantity(product.quantity);
      setDiscount(product.discount || 0);
      setCid(product.cid);
      setImage(product.image || '');
    }
  }, [product]);

  if (!product) {
    return (
      <div class="container py-5 text-center">
        <h4>Product Not Found</h4>
        <button class="btn btn-primary mt-3" onClick={() => navigate('/admin/display-products')}>Back to Inventory</button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProduct(product.pid, {
      name,
      description,
      price: Number(price),
      quantity: Number(quantity),
      discount: Number(discount),
      cid: Number(cid),
      image
    });
    navigate('/admin/display-products');
  };

  return (
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow-sm border-0 rounded-3">
            <div class="card-header bg-dark text-white py-3">
              <h5 class="fw-bold mb-0"><i class="fa-solid fa-pen-to-square me-2"></i>Update Product Details</h5>
            </div>
            <div class="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div class="row g-3">
                  <div class="col-md-8">
                    <label class="form-label fw-semibold">Product Name</label>
                    <input
                      type="text"
                      class="form-control"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Category</label>
                    <select
                      class="form-select"
                      required
                      value={cid}
                      onChange={(e) => setCid(e.target.value)}
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
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Price (₹)</label>
                    <input
                      type="number"
                      class="form-control"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Stock Quantity</label>
                    <input
                      type="number"
                      class="form-control"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Discount (%)</label>
                    <input
                      type="number"
                      class="form-control"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                    />
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold">Image Name / URL</label>
                    <input
                      type="text"
                      class="form-control"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                  </div>
                </div>

                <div class="d-flex justify-content-between mt-4">
                  <button type="button" class="btn btn-secondary" onClick={() => navigate('/admin/display-products')}>
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-dark fw-semibold">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;
