import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Ratings = () => {
  const { user } = useAuth();
  return (
    <main className="ratings-page">
      <div className="ratings-header">
        <span className="eyebrow">Trust</span>
        <h1>Ratings & Reviews</h1>
        <p>See what students are saying about their marketplace experiences.</p>
      </div>

      <div className="ratings-grid">
        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
          No reviews yet. Be the first to leave one after a transaction.
        </div>
      </div>

      {!user && (
        <div className="ratings-cta">
          <p>Sign in to leave a review.</p>
          <Link to="/login" className="primary-btn">Sign In</Link>
        </div>
      )}
    </main>
  );
};
export default Ratings;
