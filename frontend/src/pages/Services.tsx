import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createChat, getServices } from '../services/api';

type Service = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  providerUid: string;
  providerName: string;
  providerPhotoURL?: string | null;
  providerPhone: string;
  providerEmail: string;
  images: string[];
};

const categories = ['All', 'Hair & Beauty', 'Tutoring', 'Repairs', 'Photography', 'Delivery', 'Music', 'Other'];

const Services = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = services.filter((s) => {
    const matchCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  async function handleContact(service: Service) {
    if (!user) { navigate('/login'); return; }
    if (user.id === service.providerUid) return;
    try {
      await createChat(service.providerUid);
      navigate('/chat');
    } catch { /* ignore */ }
  }

  return (
    <main className="services-page" style={{ padding: '0 1.5rem' }}>
      <div className="market-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <p className="eyebrow">Campus Services</p>
          <h1>Find student services on campus</h1>
          <p>Haircuts, tutoring, repairs, photography — offered by students near you.</p>
        </div>
        <div className="market-actions">
          <Link to={user ? '/post-service' : '/login'} className="primary-btn">+ Offer a Service</Link>
        </div>
      </div>

      <div className="market-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services" />
        </div>
        <div className="category-chips">
          {categories.map((cat) => (
            <button key={cat} type="button" className={`chip ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <section className="service-grid">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="service-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="skeleton skeleton-text short" />
              <div className="skeleton skeleton-text long" />
              <div className="skeleton skeleton-text" style={{ width: '30%' }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            No services found. Be the first to offer one!
          </div>
        ) : (
          filtered.map((service) => (
            <div key={service._id} className="service-card">
              {service.images?.[0] && (
                <div style={{ height: 160, borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <img src={service.images[0]} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <span className="service-category">{service.category}</span>
              <h3>{service.title}</h3>
              <p>{service.description.slice(0, 90)}...</p>
              <div className="service-footer">
                <div className="service-provider">
                  <div className="service-provider-avatar">
                  {service.providerPhotoURL ? (
                    <img src={service.providerPhotoURL} alt={service.providerName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    service.providerName?.[0] || '?'
                  )}
                </div>
                  <span>{service.providerName}</span>
                </div>
                <strong className="service-price">KES {service.price.toLocaleString()}</strong>
              </div>
              {user && user.id !== service.providerUid && (
                <button type="button" className="contact-btn" style={{ width: '100%', maxWidth: 'none' }} onClick={() => handleContact(service)}>
                  Contact
                </button>
              )}
            </div>
          ))
        )}
      </section>

      {!user && (
        <div className="groups-cta" style={{ marginTop: '2rem' }}>
          <p>Sign in to offer or request services.</p>
          <Link to="/login" className="primary-btn">Sign In</Link>
        </div>
      )}
    </main>
  );
};

export default Services;