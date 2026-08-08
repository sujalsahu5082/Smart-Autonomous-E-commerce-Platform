import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const CategoryStrip = () => {
  const { categories } = useStore();

  return (
    <div className="category-strip-wrapper">
      <div className="container py-3">
        <div className="d-flex align-items-center gap-3 flex-wrap justify-content-center">
          {/* "All" pill */}
          <Link
            to="/products"
            className="category-item"
            style={{ minWidth: '70px' }}
          >
            <div style={{
              width: '52px', height: '52px',
              background: 'linear-gradient(135deg, #6366f1, #4338ca)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '8px',
            }}>
              <i className="fa-solid fa-store text-white" style={{ fontSize: '1.3rem' }}></i>
            </div>
            <span>All</span>
          </Link>

          {categories.map((cat) => (
            <Link to={`/products?category=${cat.cid}`} key={cat.cid} className="category-item">
              <img
                src={cat.image ? `/Images/${cat.image}` : '/Images/categories.png'}
                alt={cat.name}
                className="cat-img"
                onError={(e) => { e.target.src = '/Images/categories.png'; }}
              />
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryStrip;
