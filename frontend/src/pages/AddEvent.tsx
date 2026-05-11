import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../services/api';

const AddEvent = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!title.trim() || !date.trim() || !location.trim() || !description.trim()) {
      setError('Please fill in every field before adding the event.');
      return;
    }

    setLoading(true);
    try {
      await createEvent({
        title: title.trim(),
        date: date.trim(),
        location: location.trim(),
        description: description.trim(),
      });
      navigate('/events');
    } catch (err) {
      console.error(err);
      setError('Unable to publish event. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-page" style={{ maxWidth: 700 }}>
      <h2>Add Campus Event</h2>
      <p>Use this form to publish a new event that will appear on the Events page.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Event title</label>
          <input
            className="form-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter event title"
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            className="form-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            className="form-input"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter event location"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the event"
            rows={5}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="form-btn" disabled={loading}>
          {loading ? 'Publishing…' : 'Publish Event'}
        </button>
      </form>
    </div>
  );
};

export default AddEvent;
