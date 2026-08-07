import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const DisplayCategory = ({ onOpenAddCategory }) => {
  const { categories, deleteCategory } = useStore();

  return (
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="fw-bold m-0"><i class="fa-solid fa-list me-2 text-primary"></i>All Categories ({categories.length})</h4>
        <div>
          <Link to="/admin" class="btn btn-outline-secondary btn-sm me-2"><i class="fa-solid fa-arrow-left me-1"></i>Dashboard</Link>
          <button class="btn btn-primary btn-sm fw-semibold" onClick={onOpenAddCategory}><i class="fa-solid fa-plus me-1"></i>Add Category</button>
        </div>
      </div>

      <div class="card shadow-sm border-0 rounded-3 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 text-center">
            <thead class="table-primary text-white">
              <tr>
                <th>ID</th>
                <th>Category Icon</th>
                <th>Category Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.cid}>
                  <td class="fw-semibold">#{cat.cid}</td>
                  <td>
                    <img
                      src={cat.image ? `/Images/${cat.image}` : '/Images/categories.png'}
                      alt={cat.name}
                      style={{ width: '45px', height: '45px', objectFit: 'contain' }}
                      onError={(e) => { e.target.src = '/Images/categories.png'; }}
                    />
                  </td>
                  <td class="fw-bold">{cat.name}</td>
                  <td>
                    <Link to={`/admin/update-category/${cat.cid}`} class="btn btn-outline-primary btn-sm me-2">
                      <i class="fa-solid fa-pen"></i> Edit
                    </Link>
                    <button class="btn btn-outline-danger btn-sm" onClick={() => deleteCategory(cat.cid)}>
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

export default DisplayCategory;
