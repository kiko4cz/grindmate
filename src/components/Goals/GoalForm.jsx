import React, { useState } from 'react';
import { supabase } from '@lib/supabase';
import { useAuth } from '@contexts/AuthContext';

function GoalForm({ onGoalCreated, onCancel }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'strength',
    target_value: '',
    unit: 'kg',
    target_date: ''
  });

  const categories = [
    { value: 'strength', label: 'Síla' },
    { value: 'cardio', label: 'Kardio' },
    { value: 'weight', label: 'Váha' },
    { value: 'endurance', label: 'Výdrž' },
    { value: 'flexibility', label: 'Flexibilita' }
  ];

  const units = {
    strength: 'kg',
    cardio: 'km',
    weight: 'kg',
    endurance: 'min',
    flexibility: 'cm'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Update unit based on category
      ...(name === 'category' ? { unit: units[value] } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([
          {
            user_id: user.id,
            ...formData,
            target_value: parseFloat(formData.target_value),
            target_date: formData.target_date ? new Date(formData.target_date).toISOString() : null
          }
        ])
        .select()
        .single();

      if (error) throw error;

      onGoalCreated(data);
      setFormData({
        title: '',
        description: '',
        category: 'strength',
        target_value: '',
        unit: 'kg',
        target_date: ''
      });
    } catch (err) {
      console.error('Error creating goal:', err);
      setError('Nepodařilo se vytvořit cíl. Zkuste to prosím znovu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="goal-form-container">
      <h2>Nový cíl</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="goal-form">
        <div className="form-group">
          <label htmlFor="title">Název cíle</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Např. Bench Press"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Popis</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Popište svůj cíl..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Kategorie</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="target_value">Cílová hodnota</label>
          <input
            type="number"
            id="target_value"
            name="target_value"
            value={formData.target_value}
            onChange={handleChange}
            required
            min="0"
            step="0.1"
          />
          <span className="unit">{formData.unit}</span>
        </div>

        <div className="form-group">
          <label htmlFor="target_date">Datum dosažení cíle</label>
          <input
            type="date"
            id="target_date"
            name="target_date"
            value={formData.target_date}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Zrušit
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Vytvářím...' : 'Vytvořit cíl'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default GoalForm; 