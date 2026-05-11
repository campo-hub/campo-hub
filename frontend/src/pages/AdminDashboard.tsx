import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { getAdminStats } from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ totalUsers: number; totalListings: number; totalChats: number; totalFeedPosts: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="card-page" style={{ maxWidth: 800 }}>
      <h2>Admin Dashboard</h2>
      <p>Welcome, {user?.name}</p>
      <div style={{ margin: '1rem 0' }}>
        <Link to="/admin/add-event" className="primary-btn">
          Add Event
        </Link>
      </div>
      {loading ? (
        <div className="admin-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="admin-stat-card">
              <div className="skeleton skeleton-text short" />
              <div className="skeleton" style={{ height: '2rem', width: '60%', marginTop: '0.5rem', borderRadius: '0.4rem' }} />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="admin-grid">
          <div className="admin-stat-card">
            <h3>Total Users</h3>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
          <div className="admin-stat-card">
            <h3>Total Listings</h3>
            <div className="stat-value">{stats.totalListings}</div>
          </div>
          <div className="admin-stat-card">
            <h3>Active Chats</h3>
            <div className="stat-value">{stats.totalChats}</div>
          </div>
          <div className="admin-stat-card">
            <h3>Total Feed Posts</h3>
            <div className="stat-value">{stats.totalFeedPosts}</div>
          </div>
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Unable to load dashboard data.</p>
      )}
    </div>
  );
};
export default AdminDashboard;
