import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginWithEmail, loginWithGoogle } = useAuth();

  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
    setLoading(false);
  }, []);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginWithEmail(email.trim(), password);
      if (user) navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err: unknown) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err: unknown) {
      setError('Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-40%', right: '-20%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,59,111,0.08), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-30%', left: '-20%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,240,255,0.06), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 className="form-title">Welcome back</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>Sign in to your campus account.</p>
        <form autoComplete="off" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              name="login-email"
              type="email"
              autoComplete="off"
              className="form-input"
              placeholder="you@campus.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="login-password"
              type="password"
              autoComplete="new-password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
        <button type="button" className="form-btn google-btn" onClick={handleGoogleLogin} disabled={loading}>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>
        {error && <div className="form-error">{error}</div>}
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '1.25rem' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 500 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
