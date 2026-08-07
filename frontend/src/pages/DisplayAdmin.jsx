import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const DisplayAdmin = () => {
  const { admins, addAdmin, deleteAdmin, activeAdmin } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleAddAdminSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    addAdmin({ name, email, phone, password });
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setShowAddForm(false);
  };

  return (
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="fw-bold m-0"><i class="fa-solid fa-user-shield me-2 text-dark"></i>Admin Team ({admins.length})</h4>
        <div>
          <Link to="/admin" class="btn btn-outline-secondary btn-sm me-2"><i class="fa-solid fa-arrow-left me-1"></i>Dashboard</Link>
          <button class="btn btn-dark btn-sm fw-semibold" onClick={() => setShowAddForm(!showAddForm)}>
            <i class="fa-solid fa-user-plus me-1"></i>{showAddForm ? 'Close Form' : 'Add New Admin'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div class="card shadow-sm border-0 rounded-3 p-4 mb-4 bg-light">
          <h5 class="fw-bold mb-3">Register New Admin</h5>
          <form onSubmit={handleAddAdminSubmit}>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Admin Name</label>
                <input type="text" class="form-control" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Email Address</label>
                <input type="email" class="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Phone Number</label>
                <input type="tel" class="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Password</label>
                <input type="password" class="form-control" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div class="col-12 text-end">
                <button type="submit" class="btn btn-dark fw-semibold"><i class="fa-solid fa-check me-1"></i>Save Admin</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div class="card shadow-sm border-0 rounded-3 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 text-center">
            <thead class="table-dark">
              <tr>
                <th>ID</th>
                <th>Admin Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>#{a.id}</td>
                  <td class="fw-bold">{a.name}</td>
                  <td>{a.email}</td>
                  <td>{a.phone || 'N/A'}</td>
                  <td>
                    {a.email !== activeAdmin?.email ? (
                      <button class="btn btn-outline-danger btn-sm" onClick={() => deleteAdmin(a.id)}>
                        <i class="fa-solid fa-trash"></i> Remove
                      </button>
                    ) : (
                      <span class="badge bg-secondary">Current Active Admin</span>
                    )}
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

export default DisplayAdmin;
