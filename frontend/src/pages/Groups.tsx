import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Groups = () => {
  const { user } = useAuth();
  return (
    <main className="groups-page">
      <div className="groups-header">
        <span className="eyebrow">Community</span>
        <h1>Campus Groups</h1>
        <p>Discover and join student groups for your campus. Connect with people who share your interests.</p>
      </div>

      <div className="groups-grid">
        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
          No groups available yet. Create the first one!
        </div>
      </div>

      {!user && (
        <div className="groups-cta">
          <p>Sign in to join groups and connect with members.</p>
          <Link to="/login" className="primary-btn">Sign In</Link>
        </div>
      )}
    </main>
  );
};
export default Groups;
