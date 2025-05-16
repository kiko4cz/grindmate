import React from 'react';
import SubscriptionPlans from '../components/Subscriptions/SubscriptionPlans';
import Boosts from '../components/Subscriptions/Boosts';

function SubscriptionsPage() {
  return (
    <div className="subscriptions-page">
      <div className="page-header">
        <h1>Předplatné a Boosty</h1>
        <p className="subtitle">
          Vyberte si předplatný plán nebo boost, který vám pomůže dosáhnout vašich cílů
        </p>
      </div>

      <section className="subscriptions-section">
        <SubscriptionPlans />
      </section>

      <section className="boosts-section">
        <Boosts />
      </section>
    </div>
  );
}

export default SubscriptionsPage; 