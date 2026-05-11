import { useState, type ChangeEvent } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { createListing } from '../services/api';
import { uploadImage } from '../services/storage';

const PostListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    campus: '',
    condition: 'Used - Good',
    negotiable: true,
    phone: '',
    email: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const value = e.target.name === 'negotiable' ? e.target.value === 'true' : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const imageUrls = [] as string[];
      if (images.length > 0) {
        for (const file of images) {
          const uploaded = await uploadImage(file, `listings/${user.id}`);
          imageUrls.push(uploaded);
        }
      }
      await createListing({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        campus: form.campus,
        condition: form.condition,
        negotiable: Boolean(form.negotiable),
        sellerPhone: form.phone || '+254 700 000 000',
        sellerEmail: form.email || user.email || 'seller@campus.edu',
        images: imageUrls.length ? imageUrls : [`https://picsum.photos/seed/${Date.now()}/400/300`],
      });
      navigate('/marketplace');
    } catch (err) {
      setError('Unable to submit listing.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container" style={{ maxWidth: 580 }}>
      <h2 className="form-title">Sell an Item</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Title *</label>
            <input
              name="title"
              type="text"
              className="form-input"
              placeholder="e.g. iPhone 12"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Price (KES) *</label>
            <input
              name="price"
              type="number"
              className="form-input"
              placeholder="35000"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            className="form-textarea"
            placeholder="Describe your item in detail..."
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <input
              name="category"
              type="text"
              className="form-input"
              placeholder="e.g. Electronics"
              value={form.category}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Campus *</label>
            <input
              name="campus"
              type="text"
              className="form-input"
              placeholder="e.g. JKUAT"
              value={form.campus}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Condition</label>
            <select name="condition" className="form-input" value={form.condition} onChange={handleChange}>
              <option>Like New</option>
              <option>Used - Good</option>
              <option>Used - Fair</option>
            </select>
          </div>
          <div className="form-group">
            <label>Negotiable</label>
            <select name="negotiable" className="form-input" value={String(form.negotiable)} onChange={handleChange}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Phone Number</label>
            <input
              name="phone"
              type="text"
              className="form-input"
              placeholder="+254 712 345 678"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="you@campus.edu"
              value={form.email}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Product photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="form-file-input"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const files = Array.from(e.target.files || []);
              setImages(files);
              setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
            }}
          />
          {previewUrls.length > 0 && (
            <div className="preview-grid">
              {previewUrls.map((url) => (
                <img key={url} src={url} alt="Preview" className="preview-image" />
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="form-btn" disabled={loading}>
          {loading ? 'Posting…' : 'Post Listing'}
        </button>
        {error && <div className="form-error">{error}</div>}
      </form>
    </div>
  );
};

export default PostListing;
