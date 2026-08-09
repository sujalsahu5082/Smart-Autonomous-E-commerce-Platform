import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const CategoryStrip = () => {
  const { categories } = useStore();
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
    }
  };

  return (
    <div className="category-strip-wrapper">
      <div className="container position-relative" style={{ padding: '0 44px' }}>

        {/* Left Arrow */}
        <button
          onClick={() => scroll(-1)}
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            color: '#333',
            fontSize: '0.8rem',
          }}
          aria-label="Scroll left"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>

        {/* Scrollable Row */}
        <div className="category-strip-scroll" ref={scrollRef}>
          {/* "All" */}
          <Link to="/products" className="category-item" style={{ minWidth: 80 }}>
            <div
              style={{
                width: 50,
                height: 50,
                background: 'linear-gradient(135deg, #2874F0, #028FC8)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 7,
              }}
            >
              <i className="fa-solid fa-store text-white" style={{ fontSize: '1.25rem' }}></i>
            </div>
            <span>All</span>
          </Link>

          {categories.map((cat) => (
            <Link to={`/products?category=${cat.cid}`} key={cat.cid} className="category-item">
              <img
                src={cat.image ? (cat.image.startsWith('http') ? cat.image : `/Images/${cat.image}`) : '/Images/categories.png'}
                alt={cat.name}
                className="cat-img"
                onError={(e) => { e.target.src = '/Images/categories.png'; }}
              />
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll(1)}
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            color: '#333',
            fontSize: '0.8rem',
          }}
          aria-label="Scroll right"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default CategoryStrip;
