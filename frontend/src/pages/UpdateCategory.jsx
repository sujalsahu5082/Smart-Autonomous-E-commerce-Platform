import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const UpdateCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories, updateCategory } = useStore();

  const category = categories.find(c => c.cid === Number(id));

  const [name, setName] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setImage(category.image);
    }
  }, [category]);

  if (!category) {
    return (
      <div class="container py-5 text-center">
        <h4>Category Not Found</h4>
        <button class="btn btn-primary mt-3" onClick={() => navigate('/admin/display-category')}>Back to Categories</button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    updateCategory(category.cid, { name, image });
    navigate('/admin/display-category');
  };

  return (
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-sm border-0 rounded-3">
            <div class="card-header bg-primary text-white py-3">
              <h5 class="fw-bold mb-0"><i class="fa-solid fa-pen-to-square me-2"></i>Update Category Details</h5>
            </div>
            <div class="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Category Title</label>
                  <input
                    type="text"
                    class="form-control"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div class="mb-4">
                  <label class="form-label fw-semibold">Image File / Name</label>
                  <input
                    type="text"
                    class="form-control"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </div>
                <div class="d-flex justify-content-between">
                  <button type="button" class="btn btn-secondary" onClick={() => navigate('/admin/display-category')}>
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary fw-semibold">
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

export default UpdateCategory;
