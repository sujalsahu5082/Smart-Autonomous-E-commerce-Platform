import React from 'react';
import { Link } from 'react-router-dom';
import CategoryStrip from '../components/CategoryStrip';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

const Home = () => {
  const { products } = useStore();

  const latestProducts = [...products].slice(0, 8);
  const hotDeals = [...products].sort((a, b) => b.discount - a.discount).slice(0, 8);

  return (
    <div>
      {/* Category Strip */}
      <CategoryStrip />

      {/* Hero Carousel */}
      <div className="container mt-4">
        <div
          id="heroCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="4000"
        >
          <div className="carousel-indicators">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide-to={i}
                className={i === 0 ? 'active' : ''}
                style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: i === 0 ? '#6366f1' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                }}
              ></button>
            ))}
          </div>
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src="/Images/scroll_img2.png" className="d-block w-100" alt="Special Deals" style={{ maxHeight: '380px', objectFit: 'cover' }} />
            </div>
            <div className="carousel-item">
              <img src="/Images/scroll_img1.png" className="d-block w-100" alt="Electronics Sale" style={{ maxHeight: '380px', objectFit: 'cover' }} />
            </div>
            <div className="carousel-item">
              <img src="/Images/scroll_img3.png" className="d-block w-100" alt="Fashion Trends" style={{ maxHeight: '380px', objectFit: 'cover' }} />
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon"></span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon"></span>
          </button>
        </div>
      </div>

      {/* Latest Arrivals */}
      <div className="container py-5">
        <div className="section-header">
          <h2 className="section-title">
            <i className="fa-solid fa-sparkles" style={{ color: '#f59e0b', fontSize: '1.1rem' }}></i>
            Latest Arrivals
          </h2>
          <Link to="/products" className="btn btn-outline-primary btn-sm fw-semibold px-3">
            View All <i className="fa-solid fa-arrow-right ms-1"></i>
          </Link>
        </div>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
          {latestProducts.map((prod) => (
            <ProductCard key={prod.pid} product={prod} />
          ))}
        </div>
      </div>

      {/* Promo Banner Strip */}
      <div className="container mb-4">
        <div className="row g-3">
          {[
            { icon: 'fa-truck-fast', title: 'Free Delivery', sub: 'On orders above ₹499', color: '#4f46e5', bg: '#eef2ff' },
            { icon: 'fa-rotate-left', title: 'Easy Returns', sub: '7-day hassle-free returns', color: '#059669', bg: '#f0fdf4' },
            { icon: 'fa-shield-halved', title: 'Secure Payments', sub: '100% encrypted checkout', color: '#e11d48', bg: '#fff1f2' },
            { icon: 'fa-headset', title: '24/7 Support', sub: 'We are always here to help', color: '#d97706', bg: '#fffbeb' },
          ].map((b, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: b.bg, border: `1px solid ${b.color}22` }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '12px',
                  background: `${b.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <i className={`fa-solid ${b.icon}`} style={{ color: b.color, fontSize: '1.1rem' }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{b.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hot Deals */}
      <div className="container py-4 pb-5">
        <div className="section-header">
          <h2 className="section-title">
            <i className="fa-solid fa-fire" style={{ color: '#ef4444', fontSize: '1.1rem' }}></i>
            Hot Deals
          </h2>
          <Link to="/products" className="btn btn-outline-primary btn-sm fw-semibold px-3">
            Browse All <i className="fa-solid fa-arrow-right ms-1"></i>
          </Link>
        </div>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
          {hotDeals.map((prod) => (
            <ProductCard key={prod.pid} product={prod} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
