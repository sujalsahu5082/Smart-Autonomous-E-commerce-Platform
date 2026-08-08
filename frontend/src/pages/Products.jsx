import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

const Products = () => {
  const { products, categories } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCid = searchParams.get('category');
  const searchWord = searchParams.get('search');

  let filteredProducts = [...products];
  if (activeCid) filteredProducts = filteredProducts.filter((p) => p.cid === Number(activeCid));
  if (searchWord) {
    const q = searchWord.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  const activeCategory = categories.find((c) => c.cid === Number(activeCid));

  return (
    <div className="container py-4">
      <div className="row g-4">

        {/* ── Sidebar ── */}
        <div className="col-md-3">
          <div className="card p-0" style={{ borderRadius: '18px', overflow: 'hidden', position: 'sticky', top: '80px' }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a, #312e81)',
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '8px',
                background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="fa-solid fa-sliders text-white" style={{ fontSize: '0.85rem' }}></i>
              </div>
              <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>Filter</span>
            </div>

            {/* Category list */}
            <div className="p-2">
              <button
                className={`list-group-item w-100 text-start ${!activeCid ? 'active' : ''}`}
                onClick={() => { searchParams.delete('category'); setSearchParams(searchParams); }}
              >
                <i className="fa-solid fa-store me-2" style={{ width: 18, fontSize: '0.82rem' }}></i>
                All Products
                <span className="badge ms-2" style={{
                  background: !activeCid ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: !activeCid ? '#fff' : '#64748b',
                  borderRadius: '999px', fontSize: '0.72rem',
                }}>
                  {products.length}
                </span>
              </button>
              {categories.map((c) => {
                const count = products.filter((p) => p.cid === c.cid).length;
                const isActive = Number(activeCid) === c.cid;
                return (
                  <button
                    key={c.cid}
                    className={`list-group-item w-100 text-start d-flex justify-content-between align-items-center ${isActive ? 'active' : ''}`}
                    onClick={() => setSearchParams({ category: c.cid })}
                  >
                    <span>
                      <i className="fa-solid fa-tag me-2" style={{ width: 18, fontSize: '0.78rem', color: isActive ? 'rgba(255,255,255,0.7)' : '#818cf8' }}></i>
                      {c.name}
                    </span>
                    <span className="badge" style={{
                      background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                      color: isActive ? '#fff' : '#64748b',
                      borderRadius: '999px', fontSize: '0.72rem',
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Product Grid ── */}
        <div className="col-md-9">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                {searchWord ? (
                  <>Results for "<span style={{ color: '#4f46e5' }}>{searchWord}</span>"</>
                ) : activeCategory ? (
                  activeCategory.name
                ) : (
                  'All Products'
                )}
              </h4>
              <p className="mb-0 mt-1" style={{ fontSize: '0.83rem', color: '#64748b' }}>
                {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
            {(activeCid || searchWord) && (
              <button
                className="btn btn-sm fw-semibold"
                style={{ background: '#f1f5f9', color: '#64748b', borderRadius: '999px', border: '1px solid #e2e8f0' }}
                onClick={() => setSearchParams({})}
              >
                <i className="fa-solid fa-xmark me-1"></i> Clear
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state-card">
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <i className="fa-solid fa-box-open" style={{ fontSize: '2rem', color: '#94a3b8' }}></i>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: '#0f172a' }}>No Products Found</h5>
              <p style={{ fontSize: '0.88rem', color: '#64748b' }}>Try searching for something else or clear your filters.</p>
              <button className="btn btn-primary mt-2" onClick={() => setSearchParams({})}>
                <i className="fa-solid fa-rotate-left me-2"></i>Reset Filters
              </button>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
              {filteredProducts.map((p) => (
                <ProductCard key={p.pid} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
