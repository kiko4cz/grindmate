import React, { useState, useEffect } from 'react';

function MotivationQuote() {
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(true);

  const quotes = [
    "Každý den je nová příležitost být lepší verzí sebe sama.",
    "Vaše tělo vydrží téměř cokoliv. Je to vaše mysl, kterou musíte přesvědčit.",
    "Nejlepší čas začít byl včera. Druhý nejlepší čas je teď.",
    "Není důležité, jak pomalu jdete, dokud nezastavíte.",
    "Vaše tělo může téměř cokoliv. Je to vaše mysl, kterou musíte přesvědčit.",
    "Každý trénink je krokem k lepšímu já.",
    "Disciplína je volba mezi tím, co chcete teď, a tím, co chcete nejvíce.",
    "Nejlepší investice, kterou můžete udělat, je do sebe sama.",
    "Vaše limity jsou jen ve vaší hlavě.",
    "Každý pokrok je vítězství, i když je malý.",
    "Silná mysl vytváří silné tělo.",
    "Není to o tom, jak těžké to je, ale o tom, jak moc to chcete.",
    "Vaše tělo je odrazem vašeho životního stylu.",
    "Každý trénink je příležitostí k růstu.",
    "Nejlepší verze sebe sama je ta, kterou ještě neznáte."
  ];

  useEffect(() => {
    const getRandomQuote = () => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      return quotes[randomIndex];
    };

    // Set initial quote
    setQuote(getRandomQuote());
    setLoading(false);

    // Change quote every 30 seconds
    const interval = setInterval(() => {
      setQuote(getRandomQuote());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="motivation-card">
        <h2>Motivace</h2>
        <p className="motivation-text">Načítání...</p>
      </div>
    );
  }

  return (
    <div className="motivation-card">
      <h2>Motivace</h2>
      <p className="motivation-text">{quote}</p>
      <div className="motivation-footer">
        <span className="motivation-icon">💪</span>
        <span className="motivation-source">GrindMate AI</span>
      </div>
    </div>
  );
}

export default MotivationQuote; 