import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { supabase } from '@lib/supabase';

const boosts = [
  {
    id: 'extra_workout',
    name: 'Extra Trénink',
    price: '49',
    period: 'jednorázově',
    description: 'Získejte možnost přidat jeden extra trénink nad rámec vašeho předplatného.',
    features: [
      'Jeden extra trénink',
      'Okamžitá aktivace',
      'Platnost 30 dní',
      'Použitelné kdykoliv'
    ],
    buttonText: 'Koupit',
    popular: false
  },
  {
    id: 'goal_boost',
    name: 'Goal Boost',
    price: '99',
    period: '7 dní',
    description: 'Zrychlete dosažení vašeho cíle o 25% po dobu jednoho týdne.',
    features: [
      '25% rychlejší pokrok',
      '7 dní aktivní',
      'Aplikuje se na všechny cíle',
      'Okamžitý efekt'
    ],
    buttonText: 'Koupit',
    popular: true
  },
  {
    id: 'progress_boost',
    name: 'Progress Boost',
    price: '149',
    period: '30 dní',
    description: 'Získejte detailní analýzu vašeho pokroku a personalizované doporučení pro další tréninky.',
    features: [
      'Detailní analýza pokroku',
      'Personalizovaná doporučení',
      '30 dní aktivní',
      'Expertní rady'
    ],
    buttonText: 'Koupit',
    popular: false
  }
];

function Boosts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePurchase = async (boostId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: Implement purchase logic
      console.log(`Purchasing boost: ${boostId}`);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Implement success handling
      console.log('Boost purchased successfully');
    } catch (err) {
      console.error('Purchase error:', err);
      setError('Nepodařilo se zakoupit boost. Zkuste to prosím znovu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscription-plans boosts-section">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      <div className="plans-grid">
        {boosts.map((boost) => (
          <div 
            key={boost.id} 
            className={`plan-card ${boost.popular ? 'popular' : ''}`}
          >
            {boost.popular && (
              <div className="popular-badge">Nejoblíbenější</div>
            )}
            <div className="plan-header">
              <h3>{boost.name}</h3>
              <div className="plan-price">
                <span className="price">{boost.price} Kč</span>
                <span className="period">/{boost.period}</span>
              </div>
              <p className="plan-description">{boost.description}</p>
            </div>
            <ul className="plan-features">
              {boost.features.map((feature, index) => (
                <li key={index}>
                  <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              className={`subscribe-btn ${boost.popular ? 'popular' : ''}`}
              onClick={() => handlePurchase(boost.id)}
              disabled={loading}
            >
              {loading ? 'Zpracování...' : boost.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Boosts; 