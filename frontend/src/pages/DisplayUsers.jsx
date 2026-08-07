import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const DisplayUsers = () => {
  const { users, deleteUser } = useStore();

  return (
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="fw-bold m-0"><i class="fa-solid fa-users me-2 text-info"></i>Registered Customers ({users.length})</h4>
        <Link to="/admin" class="btn btn-outline-secondary btn-sm"><i class="fa-solid fa-arrow-left me-1"></i>Dashboard</Link>
      </div>

      {users.length === 0 ? (
        <div class="card shadow-sm border-0 p-5 text-center">
          <h5>No registered customers found.</h5>
        </div>
      ) : (
        <div class="card shadow-sm border-0 rounded-3 overflow-hidden">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 text-center">
              <thead class="table-info">
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td class="fw-bold">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || 'N/A'}</td>
                    <td class="text-truncate" style={{ maxWidth: '200px' }}>{u.address || 'N/A'}</td>
                    <td>
                      <button class="btn btn-outline-danger btn-sm" onClick={() => deleteUser(u.id)}>
                        <i class="fa-solid fa-trash"></i> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayUsers;
