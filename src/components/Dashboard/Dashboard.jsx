import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '@contexts/AuthContext';
import { useWorkouts } from '@hooks/useWorkouts';
import GoalForm from '../Goals/GoalForm';
import WorkoutForm from '../Workouts/WorkoutForm';
import MotivationQuote from '../Motivation/MotivationQuote';

function Dashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

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
        
        setGoals(goalsData || []);

        // Fetch recent workouts
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true })
          .limit(3);

        if (workoutsError) {
          console.error('Workouts error:', workoutsError);
          // Don't throw error for workouts, just show empty state
          setWorkouts([]);
        } else {
          setWorkouts(workoutsData || []);
        }

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

  const handleGoalCreated = (newGoal) => {
    setGoals(prev => [newGoal, ...prev]);
    setShowGoalForm(false);
  };

  const handleWorkoutCreated = (newWorkout) => {
    setWorkouts(prev => [newWorkout, ...prev]);
    setShowWorkoutForm(false);
  };

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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Vítejte v GrindMate</h1>
        <p className="dashboard-subtitle">Sledujte svůj pokrok a dosáhněte svých cílů</p>
      </div>
      
      <div className="dashboard-grid">
        {/* Goals Section */}
        <div className={`card goals-card ${showGoalForm ? 'expanded' : ''}`}>
          <div className="card-header">
            <h2>Moje cíle</h2>
            <button 
              className="btn-primary"
              onClick={() => setShowGoalForm(true)}
            >
              Nový cíl
            </button>
          </div>

          <div className="card-content">
            {showGoalForm ? (
              <div className="goal-form-wrapper">
                <GoalForm 
                  onGoalCreated={handleGoalCreated}
                  onCancel={() => setShowGoalForm(false)}
                />
              </div>
            ) : (
              <>
                {goals.length === 0 ? (
                  <div className="empty-state">
                    <p>Zatím nemáte žádné cíle. Vytvořte si nový cíl pro sledování vašeho pokroku.</p>
                    <button 
                      className="btn-secondary"
                      onClick={() => setShowGoalForm(true)}
                    >
                      Vytvořit první cíl
                    </button>
                  </div>
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
                        {goal.target_date && (
                          <p className="text-sm text-gray-500">
                            Cíl do: {new Date(goal.target_date).toLocaleDateString('cs-CZ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Recent Workouts Section */}
        <div className={`card workouts-card ${showWorkoutForm ? 'expanded' : ''}`}>
          <div className="card-header">
            <h2>Nadcházející tréninky</h2>
            <button 
              className="btn-primary"
              onClick={() => setShowWorkoutForm(true)}
            >
              Nový trénink
            </button>
          </div>
          <div className="card-content">
            {showWorkoutForm ? (
              <div className="workout-form-wrapper">
                <WorkoutForm 
                  onWorkoutCreated={handleWorkoutCreated}
                  onCancel={() => setShowWorkoutForm(false)}
                />
              </div>
            ) : (
              <>
                {workouts.length === 0 ? (
                  <div className="empty-state">
                    <p>Zatím nemáte žádné tréninky. Přidejte si nový trénink pro sledování vašeho pokroku.</p>
                    <button 
                      className="btn-secondary"
                      onClick={() => setShowWorkoutForm(true)}
                    >
                      Naplánovat trénink
                    </button>
                  </div>
                ) : (
                  <div className="workouts-list">
                    {workouts.map(workout => (
                      <div key={workout.id} className="workout-item">
                        <h3>{workout.title}</h3>
                        <p>{workout.description}</p>
                        <div className="workout-details">
                          <span className="workout-type">{workout.type}</span>
                          <span className="workout-duration">{workout.duration} min</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(workout.date).toLocaleDateString('cs-CZ')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="card stats-card">
          <h2>Rychlé statistiky</h2>
          <div className="card-content">
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
        </div>

        {/* Motivation Section */}
        <MotivationQuote />
      </div>
    </div>
  );
}

export default Dashboard; 