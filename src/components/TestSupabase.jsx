import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function TestSupabase() {
  const [users, setUsers] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*');

        if (usersError) throw usersError;
        setUsers(usersData);

        // Fetch workouts
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('workouts')
          .select('*');

        if (workoutsError) throw workoutsError;
        setWorkouts(workoutsData);

      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <h2>Users</h2>
      <div className="card">
        {users.map(user => (
          <div key={user.id} className="user-item">
            <p>ID: {user.id}</p>
            <p>Email: {user.email}</p>
            <p>Name: {user.full_name}</p>
          </div>
        ))}
      </div>

      <h2>Workouts</h2>
      <div className="card">
        {workouts.map(workout => (
          <div key={workout.id} className="workout-item">
            <p>ID: {workout.id}</p>
            <p>Title: {workout.title}</p>
            <p>Description: {workout.description}</p>
            <p>Duration: {workout.duration} minutes</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestSupabase; 