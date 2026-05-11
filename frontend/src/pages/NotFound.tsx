import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', textAlign: 'center', padding: '2rem', gap: '1rem'
  }}>
    <div style={{
      fontFamily: "'Space Grotesk', sans-serif", fontSize: '6rem', fontWeight: 700,
      background: 'linear-gradient(135deg, var(--coral), var(--violet))',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      lineHeight: 1
    }}>404</div>
    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 600 }}>Page not found</h2>
    <p style={{ color: 'var(--text-muted)', maxWidth: 400, lineHeight: 1.6 }}>
      This page doesn't exist or has been moved. Let's get you back on track.
    </p>
    <Link to="/" className="primary-btn" style={{ marginTop: '0.5rem' }}>Go Home</Link>
  </div>
);
export default NotFound;
