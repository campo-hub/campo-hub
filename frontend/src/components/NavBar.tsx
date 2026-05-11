import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

const NavBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  }

  const isActive = (path: string) => (location.pathname === path ? 'active' : '');

  async function handleLogout() {
    await logout();
    window.location.href = '/';
  }

  return (
    <header className="app-shell">
      <div className="app-bar">
        <Link to="/" className="brand">
          <span className="brand-mark">C</span>
          <span className="brand-name">campohub</span>
        </Link>

        <nav className="nav-links">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/marketplace" className={isActive('/marketplace')}>Marketplace</Link>
          <Link to="/groups" className={isActive('/groups')}>Community</Link>
          <Link to="/services" className={isActive('/services')}>Services</Link>
          <Link to="/events" className={isActive('/events')}>Events</Link>
        </nav>

        <div className="nav-actions">
          <label className="search-group">
            <span>🔍</span>
            <input type="search" placeholder="Search campus" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleSearchKeyDown} />
          </label>
          <button type="button" className="icon-btn" aria-label="Notifications">🔔</button>
          <button type="button" className="icon-btn" aria-label="Cart">🛒</button>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="ghost-btn" style={{ marginRight: '0.5rem' }}>
                  Admin Dashboard
                </Link>
              )}
              <Link to="/profile" className="avatar-btn">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} className="avatar-image" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  user.name?.[0] || 'U'
                )}
              </Link>
              <button type="button" className="ghost-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="primary-btn">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
