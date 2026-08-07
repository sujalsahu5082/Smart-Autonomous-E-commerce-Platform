import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const CategoryStrip = () => {
  const { categories } = useStore();

  return (
    <div class="container-fluid px-4 py-3 bg-white border-bottom shadow-sm">
      <div class="row row-cols-2 row-cols-sm-3 row-cols-md-7 g-3 text-center justify-content-center">
        {categories.map((cat) => (
          <div class="col" key={cat.cid}>
            <Link to={`/products?category=${cat.cid}`} class="category-item">
              <img
                src={cat.image ? `/Images/${cat.image}` : '/Images/categories.png'}
                alt={cat.name}
                class="cat-img"
                onError={(e) => { e.target.src = '/Images/categories.png'; }}
              />
              <span class="fw-semibold small">{cat.name}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryStrip;
