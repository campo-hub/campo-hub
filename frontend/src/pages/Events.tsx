import { useEffect, useState } from 'react';
import { getEvents, type EventItem } from '../services/api';

const Events = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      setError('');
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load events right now.');
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  return (
    <main className="events-shell">
      <section className="events-hero">
        <div>
          <span className="eyebrow">Campus Events</span>
          <h1>Never miss the next campus experience</h1>
          <p>Discover curated student gatherings, markets and events designed to keep your campus life vibrant and connected.</p>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', maxWidth: '44rem' }}>
            To add an event, contact the admin at <strong>info.campohub@gmail.com</strong>.
          </p>
        </div>
      </section>

      <section className="events-grid">
        {loading ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            Loading events...
          </div>
        ) : error ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            No upcoming events. Check back later.
          </div>
        ) : (
          events.map((event) => (
            <article key={event._id} className="event-card" style={{ background: 'var(--ink-3)', minHeight: 'auto' }}>
              <div className="event-card-inner" style={{ background: 'transparent', color: 'var(--text)' }}>
                <small>{event.date}</small>
                <h4>{event.title}</h4>
                <div className="event-card-meta" style={{ marginBottom: '0.75rem' }}>
                  <span>{event.location}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>{event.description}</p>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
};

export default Events;
