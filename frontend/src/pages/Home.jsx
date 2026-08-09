import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoryStrip from '../components/CategoryStrip';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

/* ── Countdown hook ── */
function useCountdown(targetHours = 10) {
  const [time, setTime] = useState({ h: targetHours, m: 0, s: 0 });
  useEffect(() => {
    const total = targetHours * 3600;
    let remaining = total;
    const id = setInterval(() => {
      remaining = Math.max(0, remaining - 1);
      setTime({
        h: Math.floor(remaining / 3600),
        m: Math.floor((remaining % 3600) / 60),
        s: remaining % 60,
      });
      if (remaining === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const pad = (n) => String(n).padStart(2, '0');

const Home = () => {
  const { products } = useStore();
  const countdown = useCountdown(8);

  const latestProducts = [...products].slice(0, 8);
  const hotDeals = [...products].sort((a, b) => b.discount - a.discount).slice(0, 8);
  const topRated = [...products].filter((p) => p.pid % 4 !== 0).slice(0, 4);

  const promoItems = [
    { icon: 'fa-truck-fast',     title: 'Free Delivery',    sub: 'On orders above ₹499',         color: '#1E3A2B', bg: '#EFECE3' },
    { icon: 'fa-rotate-left',    title: 'Easy Returns',     sub: '7-day hassle-free returns',    color: '#286644', bg: '#E3EFE9' },
    { icon: 'fa-shield-halved',  title: 'Secure Payments',  sub: '100% encrypted checkout',      color: '#B94A48', bg: '#F9EBEA' },
    { icon: 'fa-headset',        title: '24/7 Support',     sub: 'Always here to help you',      color: '#D99B26', bg: '#FAF3E3' },
  ];

  const tickerMessages = [
    '🔥 Mega Sale: Up to 80% OFF on Electronics',
    '🚚 Free Delivery on Orders Above ₹499',
    '✨ New Arrivals Added Daily',
    '🛡️ 100% Secure Payment Gateway',
    '↩️ Easy 7-Day Return Policy',
    '🎁 Buy 2 Get 1 Free on selected items',
    '⭐ 5-Star Rated Service by 10L+ Customers',
  ];

  return (
    <div>
      {/* ── Deal Ticker ── */}
      <div className="deal-ticker">
        <div className="ticker-track">
          {[...tickerMessages, ...tickerMessages].map((msg, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-dot"></span>
              {msg}
            </span>
          ))}
        </div>
      </div>

      {/* ── Category Strip ── */}
      <CategoryStrip />

      {/* ── Hero Carousel ── */}
      <div className="hero-carousel-wrapper">
        <div
          id="heroCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="4500"
        >
          <div className="carousel-indicators">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide-to={i}
                className={i === 0 ? 'active' : ''}
                aria-label={`Slide ${i + 1}`}
              ></button>
            ))}
          </div>
          <div className="carousel-inner">
            {[
              {
                img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
                eyebrow: '🎧 Flagship Audio & Tech',
                title: 'Experience Sound &\nNext-Gen Gadgets',
                sub: 'Discover top-rated noise cancelling headphones, laptops, and 5G smartphones at up to 70% off.',
                cta: 'Shop Electronics',
                ctaLink: '/products?category=1',
              },
              {
                img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80',
                eyebrow: '✨ Eco-Luxury Fashion',
                title: 'Redefine Your Style\nThis Season',
                sub: 'Handcrafted apparel, designer footwear, and timeless accessories tailored for every occasion.',
                cta: 'Explore Fashion',
                ctaLink: '/products?category=6',
              },
              {
                img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&auto=format&fit=crop&q=80',
                eyebrow: '🏡 Smart Living & Appliances',
                title: 'Upgrade Your Home\nWith Smart Appliances',
                sub: 'Premium frost-free refrigerators, 4K Ultra HD Smart TVs, and modern home furnishings.',
                cta: 'Browse Living',
                ctaLink: '/products?category=2',
              },
            ].map((slide, idx) => (
              <div key={idx} className={`carousel-item ${idx === 0 ? 'active' : ''} hero-slide`}>
                <img src={slide.img} alt={slide.title} className="d-block w-100" />
                <div className="hero-slide-overlay">
                  <div className="hero-slide-content animate-fade-up">
                    <div className="hero-slide-eyebrow">
                      <span
                        style={{
                          width: 28,
                          height: 2,
                          background: '#D99B26',
                          display: 'inline-block',
                          borderRadius: 2,
                        }}
                      ></span>
                      {slide.eyebrow}
                    </div>
                    <div className="hero-slide-title">
                      {slide.title.split('\n').map((line, i) => (
                        <span key={i}>{line}<br /></span>
                      ))}
                    </div>
                    <p className="hero-slide-sub">{slide.sub}</p>
                    <Link to={slide.ctaLink} className="hero-cta-primary">
                      {slide.cta}
                      <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon"></span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon"></span>
          </button>
        </div>
      </div>

      {/* ── Today's Deals Countdown Banner ── */}
      <div className="container mt-4">
        <div className="deals-banner animate-fade-up animate-delay-1">
          <div>
            <div className="deals-banner-title">
              <i className="fa-solid fa-fire" style={{ color: '#D99B26' }}></i>
              Today's Deals — Ends In
            </div>
            <div className="deals-banner-subtitle">Grab these offers before they're gone!</div>
          </div>
          <div className="deals-countdown">
            {[
              { num: pad(countdown.h), label: 'Hours' },
              { num: pad(countdown.m), label: 'Mins' },
              { num: pad(countdown.s), label: 'Secs' },
            ].map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="countdown-sep">:</span>}
                <div className="countdown-block">
                  <span className="countdown-num">{item.num}</span>
                  <span className="countdown-label">{item.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <Link to="/products" className="hero-cta-primary d-none d-md-inline-flex">
            View All Deals <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </div>

      {/* ── Promo Strip ── */}
      <div className="container mt-4">
        <div className="row g-3">
          {promoItems.map((b, i) => (
            <div key={i} className="col-6 col-md-3 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="promo-strip-card">
                <div className="promo-icon-box" style={{ background: b.bg }}>
                  <i className={`fa-solid ${b.icon}`} style={{ color: b.color }}></i>
                </div>
                <div>
                  <div className="promo-strip-title">{b.title}</div>
                  <div className="promo-strip-sub">{b.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Latest Arrivals ── */}
      <div className="container py-5">
        <div className="section-header">
          <h2 className="section-title">
            <i className="fa-solid fa-sparkles" style={{ color: '#FF9F00', fontSize: '1rem' }}></i>
            Latest Arrivals
          </h2>
          <Link to="/products" className="section-view-all">
            View All <i className="fa-solid fa-arrow-right fa-xs"></i>
          </Link>
        </div>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3">
          {latestProducts.map((prod) => (
            <ProductCard key={prod.pid} product={prod} />
          ))}
        </div>
      </div>

      {/* ── Category Spotlight Banner ── */}
      <div className="container mb-5">
        <div
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          {[
            {
              icon: 'fa-mobile-screen',
              label: 'Electronics',
              sub: 'Gadgets & Tech',
              gradient: 'linear-gradient(135deg, #131921 0%, #1a3a5c 100%)',
              accent: '#028FC8',
            },
            {
              icon: 'fa-shirt',
              label: 'Fashion',
              sub: 'Trending Styles',
              gradient: 'linear-gradient(135deg, #2D1B69 0%, #8B2FC9 100%)',
              accent: '#FF9F00',
            },
          ].map((s, i) => (
            <Link
              key={i}
              to="/products"
              style={{
                background: s.gradient,
                borderRadius: 12,
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                textDecoration: 'none',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.22)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'; }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: `${s.accent}25`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: `1.5px solid ${s.accent}45`,
                }}
              >
                <i className={`fa-solid ${s.icon}`} style={{ color: s.accent, fontSize: '1.5rem' }}></i>
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.2 }}>{s.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', marginTop: 2 }}>{s.sub}</div>
                <div style={{ color: s.accent, fontSize: '0.78rem', fontWeight: 700, marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  Shop Now <i className="fa-solid fa-arrow-right fa-xs"></i>
                </div>
              </div>
              {/* decorative circle */}
              <div
                style={{
                  position: 'absolute',
                  right: -20,
                  top: -20,
                  width: 110,
                  height: 110,
                  borderRadius: '50%',
                  background: `${s.accent}12`,
                  pointerEvents: 'none',
                }}
              ></div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Hot Deals ── */}
      <div style={{ background: '#fff', borderTop: '4px solid #2874F0', paddingBottom: '48px' }}>
        <div className="container py-5">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fa-solid fa-fire" style={{ color: '#D93025', fontSize: '1rem' }}></i>
              Hot Deals
            </h2>
            <Link to="/products" className="section-view-all">
              Browse All <i className="fa-solid fa-arrow-right fa-xs"></i>
            </Link>
          </div>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3">
            {hotDeals.map((prod) => (
              <ProductCard key={prod.pid} product={prod} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Trust Strip ── */}
      <div className="container my-5">
        <div className="trust-strip">
          {[
            { icon: 'fa-shield-halved', label: '2 Crore+ Happy Customers', color: '#2874F0' },
            { icon: 'fa-truck-fast',    label: 'Express Delivery Available', color: '#067D62' },
            { icon: 'fa-lock',          label: 'SSL Encrypted Checkout',     color: '#D93025' },
            { icon: 'fa-star',          label: '4.8/5 Rated on App Stores',  color: '#FF9F00' },
            { icon: 'fa-headset',       label: '24/7 Customer Support',       color: '#8B2FC9' },
          ].map((t, i) => (
            <div key={i} className="trust-item">
              <i className={`fa-solid ${t.icon}`} style={{ color: t.color }}></i>
              {t.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
