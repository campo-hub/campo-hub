import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signupWithEmail, loginWithGoogle } = useAuth();

  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setLoading(false);
  }, []);

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await signupWithEmail(name.trim(), email.trim(), password);
      if (user) navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err: unknown) {
      setError('Sign up failed. Please try again.');
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
      <div style={{ position: 'absolute', top: '-30%', right: '-15%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.08), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-25%', left: '-25%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,71,0.05), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 className="form-title">Create account</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>Join the campus community.</p>
        <form autoComplete="off" onSubmit={handleSignup}>
          <div className="form-group">
            <label>Name</label>
            <input
              name="signup-name"
              type="text"
              autoComplete="off"
              className="form-input"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              name="signup-email"
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
              name="signup-password"
              type="password"
              autoComplete="new-password"
              className="form-input"
              placeholder="Create a password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-btn" disabled={loading}>
            {loading ? 'Signing up…' : 'Sign Up'}
          </button>
        </form>
        <button type="button" className="form-btn google-btn" onClick={handleGoogleLogin} disabled={loading}>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>
        {error && <div className="form-error">{error}</div>}
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '1.25rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
