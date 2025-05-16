import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { supabase } from '@lib/supabase';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    period: 'měsíčně',
    description: 'Základní funkce pro začátečníky',
    features: [
      'Sledování základních cílů',
      'Základní statistiky',
      'Omezený počet tréninků',
      'Základní motivace'
    ],
    buttonText: 'Začít zdarma',
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '149',
    period: 'měsíčně',
    description: 'Pro vášnivé sportovce',
    features: [
      'Neomezené cíle a tréninky',
      'Detailní statistiky a grafy',
      'Pokročilé motivace',
      'Prioritní podpora',
      'Export dat'
    ],
    buttonText: 'Vybrat Premium',
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '299',
    period: 'měsíčně',
    description: 'Pro profesionální sportovce',
    features: [
      'Vše z Premium plánu',
      'Osobní trenér',
      'Vlastní tréninkové plány',
      'Analýza výkonu',
      'API přístup',
      'VIP podpora 24/7'
    ],
    buttonText: 'Vybrat Pro',
    popular: false
  }
];

function SubscriptionPlans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async (planId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: Implement subscription logic
      console.log(`Subscribing to plan: ${planId}`);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to payment page or show success message
      if (planId === 'free') {
        // Free plan doesn't need payment
        console.log('Free plan activated');
      } else {
        // Redirect to payment page for paid plans
        console.log('Redirecting to payment page');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError('Nepodařilo se aktivovat předplatné. Zkuste to prosím znovu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscription-plans">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      <div className="plans-grid">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`plan-card ${plan.popular ? 'popular' : ''}`}
          >
            {plan.popular && (
              <div className="popular-badge">Nejoblíbenější</div>
            )}
            <div className="plan-header">
              <h3>{plan.name}</h3>
              <div className="plan-price">
                <span className="price">{plan.price} Kč</span>
                <span className="period">/{plan.period}</span>
              </div>
              <p className="plan-description">{plan.description}</p>
            </div>
            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>
                  <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              className={`subscribe-btn ${plan.popular ? 'popular' : ''}`}
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading}
            >
              {loading ? 'Zpracování...' : plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SubscriptionPlans; 