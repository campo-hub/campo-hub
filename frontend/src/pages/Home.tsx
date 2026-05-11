import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Student';

  return (
    <main>
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">#1 student hub</span>
          <h1>
            Buy. Sell. Connect. <span>Together.</span>
          </h1>
          <p>The ultimate student marketplace and campus social hub for deals, groups, chats and events.</p>
          <div className="hero-actions">
            <Link to="/marketplace" className="primary-btn">Explore Marketplace</Link>
            <Link to="/groups" className="secondary-btn">Join Community</Link>
          </div>
          <div className="hero-people">
            <div className="avatar-stack">
              <span>AK</span>
              <span>ZO</span>
              <span>NL</span>
              <span>SY</span>
            </div>
            <p>50K+ active students</p>
          </div>
        </div>

        <div
          className="hero-top-card-row"
          style={{
            position: 'static',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1rem',
            marginTop: '2rem',
            maxWidth: '360px',
          }}
        >
          <div className="widget-card">
            <div className="widget-head">
              <div>
                <span className="eyebrow">Good day</span>
                <h3 className="widget-title">Hi, {firstName}</h3>
              </div>
              <span className="widget-label">Level 4</span>
            </div>
            <p className="widget-copy">Keep your campus streak alive and earn more visibility with each post.</p>
            <div className="progress-bar"><div className="progress-fill" /></div>
            <p className="widget-copy">72% to the next loyalty tier</p>
          </div>

          <div className="widget-card premium-card">
            <div className="widget-head">
              <div>
                <span className="eyebrow">Unlock</span>
                <h3 className="widget-title">Campus Premium</h3>
              </div>
            </div>
            <p className="widget-copy">Get more exposure, premium group access and first dibs on events.</p>
            <Link to="/subscription" className="primary-btn" style={{ marginTop: '0.75rem' }}>
              Unlock Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
