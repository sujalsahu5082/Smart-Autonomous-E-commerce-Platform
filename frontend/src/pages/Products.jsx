import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

const Products = () => {
  const { products, categories } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCid = searchParams.get('category');
  const searchWord = searchParams.get('search');

  let filteredProducts = [...products];

  if (activeCid) {
    filteredProducts = filteredProducts.filter(p => p.cid === Number(activeCid));
  }

  if (searchWord) {
    const q = searchWord.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  const activeCategory = categories.find(c => c.cid === Number(activeCid));

  return (
    <div class="container py-4">
      <div class="row">
        {/* Sidebar Filters */}
        <div class="col-md-3 mb-4">
          <div class="card shadow-sm border-0 rounded-3">
            <div class="card-header bg-primary text-white fw-bold">
              <i class="fa-solid fa-filter me-2"></i>Filter Categories
            </div>
            <div class="list-group list-group-flush">
              <button
                class={`list-group-item list-group-item-action fw-semibold ${!activeCid ? 'active' : ''}`}
                onClick={() => {
                  searchParams.delete('category');
                  setSearchParams(searchParams);
                }}
              >
                All Products ({products.length})
              </button>
              {categories.map((c) => {
                const count = products.filter(p => p.cid === c.cid).length;
                return (
                  <button
                    key={c.cid}
                    class={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${Number(activeCid) === c.cid ? 'active' : ''}`}
                    onClick={() => {
                      setSearchParams({ category: c.cid });
                    }}
                  >
                    <span>{c.name}</span>
                    <span class="badge bg-secondary rounded-pill">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div class="col-md-9">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="fw-bold m-0">
              {searchWord ? (
                <>Search Results for "<span class="text-primary">{searchWord}</span>"</>
              ) : activeCategory ? (
                activeCategory.name
              ) : (
                'All Available Products'
              )}
            </h4>
            <span class="text-muted small">Showing {filteredProducts.length} items</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div class="text-center py-5 bg-white rounded-3 shadow-sm">
              <img src="/Images/no-results.png" alt="No Products" style={{ width: '120px' }} class="mb-3" />
              <h5>No Products Found</h5>
              <p class="text-muted small">Try searching for something else or clear filters.</p>
              <button
                class="btn btn-outline-primary btn-sm"
                onClick={() => setSearchParams({})}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
              {filteredProducts.map(p => (
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
