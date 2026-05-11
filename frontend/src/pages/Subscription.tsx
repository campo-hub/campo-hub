const plans = [
  {
    id: 'free',
    title: 'Free',
    price: 'sh 0.00',
    description: 'Get started and explore campus listings with no commitment.',
    features: ['2 weekly listings', '2 weekly posts', 'Basic access'],
  },
  {
    id: 'weekly',
    title: 'Weekly Pass',
    price: 'sh 10.00',
    description: 'Perfect for short bursts of campus browsing and selling.',
    features: ['5 weekly listings', 'Priority alerts', 'Weekly deal drops'],
  },
  {
    id: 'monthly',
    title: 'Monthly',
    price: 'sh 30.00',
    description: 'Best value for active students who want premium visibility.',
    features: ['Featured placement', 'Chat support', '30 monthly posts', 'Fewer ads'],
  },
  {
    id: 'annual',
    title: 'Annual VIP',
    price: 'sh 350.00',
    description: 'Full campus access all year with exclusive VIP perks.',
    features: ['VIP badge', 'Unlimited posts', 'Lowest fees', 'No ads'],
    accent: true,
  },
];

const Subscription = () => (
  <main className="subscription-page">
    <section className="subscription-hero">
      <div>
        <span className="eyebrow">Subscriptions</span>
        <h1>Turn your campus experience into premium access.</h1>
        <p>Choose the plan that makes Campohub the freshest, fastest, and most rewarding student marketplace on campus.</p>
      </div>
    </section>

    <section className="plan-grid">
      {plans.map((plan) => (
        <article key={plan.id} className={plan.accent ? 'plan-card plan-card-highlight' : 'plan-card'}>
          <div className="plan-header">
            <span className="plan-tier">{plan.title}</span>
            <strong className="plan-price">{plan.price}</strong>
          </div>
          <p className="plan-copy">{plan.description}</p>
          <ul className="plan-feature-list">
            {plan.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <button type="button" className={plan.accent ? 'primary-btn plan-btn' : 'ghost-btn plan-btn'}>
            Pick {plan.title}
          </button>
        </article>
      ))}
    </section>
  </main>
);

export default Subscription;
