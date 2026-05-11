import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { getListings } from '../services/api';

type Listing = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  campus: string;
  condition: string;
  negotiable: boolean;
  images: string[];
};

const categories = ['All', 'Electronics', 'Fashion', 'Books', 'Services'];

const Marketplace = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListings() {
      try {
        const data = await getListings();
        setListings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadListings();
  }, []);

  const filteredListings = listings.filter((listing) => {
    const matchesCategory = selectedCategory === 'All' || listing.category === selectedCategory;
    const matchesSearch = listing.title.toLowerCase().includes(search.toLowerCase()) || listing.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="marketplace-shell">
      <div className="market-header">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1>Explore top student listings</h1>
          <p>Browse trusted campus deals, services and urgent offers in one premium hub.</p>
        </div>
        <div className="market-actions">
          <Link to={user ? '/post-listing' : '/login'} className="primary-btn">+ Sell an Item</Link>
        </div>
      </div>

      <div className="market-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search marketplace"
          />
        </div>
        <div className="category-chips">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`chip ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <section className="market-listing-grid">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="marketplace-card">
              <div className="skeleton skeleton-card" />
              <div className="marketplace-card-body" style={{ gap: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                <div className="skeleton skeleton-text short" />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text long" />
              </div>
            </div>
          ))
        ) : filteredListings.length === 0 ? (
          <div className="empty-state">No results found. Try a different category or search.</div>
        ) : (
          filteredListings.map((listing) => (
            <Link key={listing._id} to={`/listing/${listing._id}`} className="marketplace-card">
              <div className="marketplace-card-image">
                {listing.images?.[0] ? <img src={listing.images[0]} alt={listing.title} /> : <div className="placeholder-img" />}
              </div>
              <div className="marketplace-card-body">
                <span className="tag">{listing.category}</span>
                <h3>{listing.title}</h3>
                <p>{listing.description.slice(0, 75)}...</p>
                <div className="card-foot">
                  <strong>KES {listing.price.toLocaleString()}</strong>
                  <span>{listing.campus}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </main>
  );
};

export default Marketplace;
