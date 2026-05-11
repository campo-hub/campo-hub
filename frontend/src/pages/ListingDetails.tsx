import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { createChat, getListing } from '../services/api';

type Listing = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  campus: string;
  condition: string;
  negotiable: boolean;
  sellerUid: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  sellerPhotoURL?: string | null;
  images: string[];
};

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadListing() {
      if (!id) return;
      try {
        const data = await getListing(id);
        setListing(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadListing();
  }, [id]);

  if (loading) return (
    <div className="listing-details" style={{ maxWidth: 800, margin: '2rem auto' }}>
      <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)', marginBottom: '1rem' }} />
      <div className="skeleton skeleton-text long" style={{ height: 28, marginBottom: '0.75rem' }} />
      <div className="skeleton skeleton-text" style={{ height: 16, marginBottom: '0.5rem' }} />
      <div className="skeleton skeleton-text short" style={{ height: 24, marginBottom: '1rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', margin: '1rem 0' }}>
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: '0.7rem' }} />)}
      </div>
      <div className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />
    </div>
  );
  if (!listing) return <div className="notfound">Listing not found</div>;

  const isSeller = user?.id === listing.sellerUid;

  async function handleContactSeller() {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!listing || isSeller) return;
    try {
      await createChat(listing.sellerUid, listing._id);
      navigate('/chat', { state: { listingId: listing._id } });
    } catch (err) {
      setError('Unable to start chat.');
    }
  }

  return (
    <div className="listing-details">
      {listing.images?.length > 0 && (
        <div className="detail-image-wrapper">
          {listing.images.map((img) => (
            <img key={img} src={img} alt={listing.title} className="detail-image" />
          ))}
        </div>
      )}

      <h2>{listing.title}</h2>
      <p className="desc">{listing.description}</p>
      <div className="price-lg">KES {listing.price.toLocaleString()}</div>

      <div className="meta-grid">
        <div>
          <span className="meta-label">Category</span>
          <div className="meta-value">{listing.category}</div>
        </div>
        <div>
          <span className="meta-label">Campus</span>
          <div className="meta-value">{listing.campus}</div>
        </div>
        <div>
          <span className="meta-label">Condition</span>
          <div className="meta-value">{listing.condition}</div>
        </div>
        <div>
          <span className="meta-label">Negotiable</span>
          <div className="meta-value">{listing.negotiable ? 'Yes' : 'No'}</div>
        </div>
      </div>

      <div className="seller-section">
        <h3>Seller Information</h3>
        <div className="seller-info">
          <div className="seller-avatar">
            {listing.sellerPhotoURL ? (
              <img src={listing.sellerPhotoURL} alt={listing.sellerName} className="avatar-image" />
            ) : (
              <span>{listing.sellerName?.[0] || '?'}</span>
            )}
          </div>
          <div>
            <div className="seller-name">{listing.sellerName} ({listing.campus})</div>
            <div className="seller-contact">{listing.sellerPhone}</div>
            <div className="seller-contact">{listing.sellerEmail}</div>
          </div>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="detail-actions">
        {!isSeller && (
          <button className="contact-btn" onClick={handleContactSeller}>
            {user ? 'Contact Seller' : 'Login to Contact Seller'}
          </button>
        )}
        <Link to="/marketplace" className="listing-link" style={{ display: 'inline-block', textAlign: 'center' }}>
          Back to Marketplace
        </Link>
      </div>
    </div>
  );
};

export default ListingDetails;
