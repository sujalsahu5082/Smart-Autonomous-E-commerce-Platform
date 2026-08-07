import React from 'react';
import { Link } from 'react-router-dom';
import CategoryStrip from '../components/CategoryStrip';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

const Home = () => {
  const { products } = useStore();

  const latestProducts = [...products].slice(0, 4);
  const hotDeals = [...products].sort((a, b) => b.discount - a.discount).slice(0, 8);

  return (
    <div>
      {/* Top Category Strip */}
      <CategoryStrip />

      {/* Hero Carousel */}
      <div class="container mt-4">
        <div id="heroCarousel" class="carousel slide carousel-dark shadow-sm rounded overflow-hidden" data-bs-ride="carousel">
          <div class="carousel-inner">
            <div class="carousel-item active">
              <img src="/Images/scroll_img2.png" class="d-block w-100" alt="Special Deals" style={{ maxHeight: '380px', objectFit: 'cover' }} />
            </div>
            <div class="carousel-item">
              <img src="/Images/scroll_img1.png" class="d-block w-100" alt="Electronics Sale" style={{ maxHeight: '380px', objectFit: 'cover' }} />
            </div>
            <div class="carousel-item">
              <img src="/Images/scroll_img3.png" class="d-block w-100" alt="Fashion Trends" style={{ maxHeight: '380px', objectFit: 'cover' }} />
            </div>
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon"></span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon"></span>
          </button>
        </div>
      </div>

      {/* Latest Arrivals Section */}
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="fw-bold m-0"><i class="fa-solid fa-sparkles text-warning me-2"></i>Latest Arrivals</h3>
          <Link to="/products" class="btn btn-outline-primary btn-sm">View All Products</Link>
        </div>
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
          {latestProducts.map(prod => (
            <ProductCard key={prod.pid} product={prod} />
          ))}
        </div>
      </div>

      {/* Hot Deals Section */}
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="fw-bold m-0"><i class="fa-solid fa-fire text-danger me-2"></i>Hot Discounts & Deals</h3>
          <Link to="/products" class="btn btn-outline-primary btn-sm">Browse Catalog</Link>
        </div>
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
          {hotDeals.map(prod => (
            <ProductCard key={prod.pid} product={prod} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
