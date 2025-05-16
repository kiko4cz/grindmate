import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '@contexts/AuthContext';
import { useWorkouts } from '@hooks/useWorkouts';

function WorkoutForm({ onWorkoutCreated, onCancel }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    date: new Date().toISOString().split('T')[0],
    type: 'strength',
    status: 'planned'
  });

  const workoutTypes = [
    { value: 'strength', label: 'Silový trénink' },
    { value: 'cardio', label: 'Kardio' },
    { value: 'hiit', label: 'HIIT' },
    { value: 'yoga', label: 'Jóga' },
    { value: 'other', label: 'Jiný' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('Uživatel není přihlášen');
      }

      // Convert duration to integer
      const workoutData = {
        ...formData,
        duration: parseInt(formData.duration),
        user_id: user.id
      };

      const { data, error: insertError } = await supabase
        .from('workouts')
        .insert([workoutData])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      onWorkoutCreated(data);
    } catch (err) {
      console.error('Error creating workout:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workout-form-container">
      <form onSubmit={handleSubmit} className="workout-form">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="title">Název tréninku</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Např. Ranní běh"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Popis</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Popište váš trénink..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Typ tréninku</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            {workoutTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="duration">Délka tréninku (minuty)</label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="5"
            max="240"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Datum tréninku</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Zrušit
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Ukládání...' : 'Vytvořit trénink'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default WorkoutForm; 