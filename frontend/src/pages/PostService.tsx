import { useState, type ChangeEvent } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createService } from '../services/api';
import { uploadImage } from '../services/storage';

const categories = ['Hair & Beauty', 'Tutoring', 'Repairs', 'Photography', 'Delivery', 'Music', 'Other'];

const PostService = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', phone: '', email: '' });
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const imageUrls: string[] = [];
      for (const file of images) {
        const uploaded = await uploadImage(file, `services/${user.id}`);
        imageUrls.push(uploaded);
      }
      await createService({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        providerPhone: form.phone || '+254 700 000 000',
        providerEmail: form.email || user.email || '',
        images: imageUrls,
      });
      navigate('/services');
    } catch {
      setError('Unable to submit service.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container" style={{ maxWidth: 580 }}>
      <h2 className="form-title">Offer a Service</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Service Title *</label>
          <input name="title" type="text" className="form-input" placeholder="e.g. Affordable Haircuts" value={form.title} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Description *</label>
          <textarea name="description" className="form-textarea" placeholder="Describe your service, availability, rates..." value={form.description} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Price (KES) *</label>
            <input name="price" type="number" className="form-input" placeholder="500" value={form.price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select name="category" className="form-input" value={form.category} onChange={handleChange} required>
              <option value="">Select...</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Phone Number</label>
            <input name="phone" type="text" className="form-input" placeholder="+254 712 345 678" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" className="form-input" placeholder="you@campus.edu" value={form.email} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label>Photos (optional)</label>
          <input type="file" accept="image/*" multiple className="form-file-input" onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            setImages(files);
            setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
          }} />
          {previewUrls.length > 0 && (
            <div className="preview-grid">
              {previewUrls.map((url) => <img key={url} src={url} alt="" className="preview-image" />)}
            </div>
          )}
        </div>
        <button type="submit" className="form-btn" disabled={loading}>
          {loading ? 'Posting…' : 'Post Service'}
        </button>
        {error && <div className="form-error">{error}</div>}
      </form>
    </div>
  );
};

export default PostService;