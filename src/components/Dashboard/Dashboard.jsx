import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

function Dashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Debug: Check if user is authenticated
        console.log('Current user:', user);
        
        if (!user) {
          throw new Error('Uživatel není přihlášen');
        }

        // Fetch user's goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (goalsError) {
          console.error('Goals error:', goalsError);
          throw new Error('Nepodařilo se načíst cíle');
        }
        
        console.log('Goals data:', goalsData);
        setGoals(goalsData || []);

        // Fetch recent workouts
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(3);

        if (workoutsError) {
          console.error('Workouts error:', workoutsError);
          throw new Error('Nepodařilo se načíst tréninky');
        }
        
        console.log('Workouts data:', workoutsData);
        setWorkouts(workoutsData || []);

      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
      setError('Uživatel není přihlášen');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Načítání...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <div className="error-message">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Vítejte v GrindMate</h1>
      
      <div className="dashboard-grid">
        {/* Goals Section */}
        <div className="card">
          <h2>Moje cíle</h2>
          {goals.length === 0 ? (
            <p>Zatím nemáte žádné cíle. Vytvořte si nový cíl pro sledování vašeho pokroku.</p>
          ) : (
            <div className="goals-list">
              {goals.map((goal) => (
                <div key={goal.id} className="goal-item">
                  <h3>{goal.title}</h3>
                  <p>{goal.description}</p>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(goal.current_value / goal.target_value) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm">
                    {goal.current_value} / {goal.target_value} {goal.unit}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Workouts Section */}
        <div className="card">
          <h2>Nadcházející tréninky</h2>
          {workouts.length === 0 ? (
            <p>Zatím nemáte žádné tréninky. Přidejte si nový trénink pro sledování vašeho pokroku.</p>
          ) : (
            <div className="workouts-list">
              {workouts.map(workout => (
                <div key={workout.id} className="workout-item">
                  <h3>{workout.title}</h3>
                  <p>{workout.description}</p>
                  <p>Délka: {workout.duration} minut</p>
                  <p>Datum: {new Date(workout.date).toLocaleDateString('cs-CZ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats Section */}
        <div className="card">
          <h2>Rychlé statistiky</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>Celkem tréninků</h3>
              <p>{workouts.length}</p>
            </div>
            <div className="stat-item">
              <h3>Aktivní cíle</h3>
              <p>{goals.length}</p>
            </div>
          </div>
        </div>

        {/* Motivation Section */}
        <div className="motivation-card">
          <h2>Motivace</h2>
          <p className="motivation-text">
            "Každý den je nová příležitost být lepší verzí sebe sama."
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 