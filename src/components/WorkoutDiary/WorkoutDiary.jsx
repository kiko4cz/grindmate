import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '@contexts/AuthContext';
import { useWorkouts } from '@hooks/useWorkouts';

function WorkoutDiary() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newWorkout, setNewWorkout] = useState({
    title: '',
    description: '',
    duration: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchWorkouts();
  }, [user]);

  async function fetchWorkouts() {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (error) throw new Error('Nepodařilo se načíst tréninky');
      setWorkouts(data);
    } catch (err) {
      setError(err.message);
      console.error('Chyba při načítání tréninků:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('workouts')
        .insert([
          {
            user_id: user.id,
            ...newWorkout,
            duration: parseInt(newWorkout.duration)
          }
        ]);

      if (error) throw new Error('Nepodařilo se přidat trénink');

      setNewWorkout({
        title: '',
        description: '',
        duration: '',
        date: new Date().toISOString().split('T')[0]
      });

      fetchWorkouts();
    } catch (err) {
      setError(err.message);
      console.error('Chyba při přidávání tréninku:', err);
    }
  }

  async function handleDelete(id) {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (error) throw new Error('Nepodařilo se smazat trénink');
      setWorkouts(workouts.filter(workout => workout.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Chyba při mazání tréninku:', err);
    }
  }

  if (loading) return <div>Načítání...</div>;
  if (error) return <div className="error-message">Chyba: {error}</div>;

  return (
    <div className="container">
      <h1>Tréninkový deník</h1>

      {/* Add New Workout Form */}
      <div className="card">
        <h2>Přidat nový trénink</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Název tréninku</label>
            <input
              type="text"
              id="title"
              value={newWorkout.title}
              onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Popis</label>
            <textarea
              id="description"
              value={newWorkout.description}
              onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">Délka (minuty)</label>
            <input
              type="number"
              id="duration"
              value={newWorkout.duration}
              onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Datum</label>
            <input
              type="date"
              id="date"
              value={newWorkout.date}
              onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Přidat trénink
          </button>
        </form>
      </div>

      {/* Workouts List */}
      <div className="card">
        <h2>Historie tréninků</h2>
        <div className="workouts-list">
          {workouts.map(workout => (
            <div key={workout.id} className="workout-item">
              <h3>{workout.title}</h3>
              <p>{workout.description}</p>
              <p>Délka: {workout.duration} minut</p>
              <p>Datum: {new Date(workout.date).toLocaleDateString('cs-CZ')}</p>
              <button
                onClick={() => handleDelete(workout.id)}
                className="btn btn-secondary"
              >
                Odstranit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WorkoutDiary; 