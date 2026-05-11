import { FormEvent, useEffect, useState, type ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { uploadImage } from '../services/storage';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPreview(user.photoURL || null);
    }
  }, [user]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage('');

    try {
      let photoURL = user.photoURL || undefined;
      if (photoFile) {
        photoURL = await uploadImage(photoFile, `profiles/${user.id}`);
      }
      await updateProfile(name, photoURL);
      setMessage('Profile updated successfully.');
      setPhotoFile(null);
    } catch (error) {
      console.error(error);
      setMessage('Unable to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setPhotoFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  if (!user) {
    return (
      <div className="card-page">
        <h2>My Profile</h2>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="card-page" style={{ maxWidth: 600 }}>
      <h2>My Profile</h2>
      <div className="profile-header">
        <div className="profile-avatar">
          {preview ? (
            <img src={preview} alt="Profile preview" className="profile-photo" />
          ) : (
            <span>{user.name?.[0] || '?'}</span>
          )}
        </div>
        <div style={{ marginLeft: '1rem' }}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>ID:</strong> {user.id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Display Name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="form-input"
            placeholder="Your name"
          />
        </div>

        <div className="form-group">
          <label>Profile Picture</label>
          <input type="file" accept="image/*" className="form-file-input" onChange={handleFileChange} />
        </div>

        <button type="submit" className="form-btn" disabled={loading}>
          {loading ? 'Saving…' : 'Save Profile'}
        </button>
      </form>

      {message && <div className="form-message">{message}</div>}
      <p style={{ marginTop: '1rem', color: 'var(--text-dim)' }}>Profile pictures and post images are now supported.</p>
    </div>
  );
};

export default Profile;
