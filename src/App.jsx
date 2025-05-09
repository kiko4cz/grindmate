import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from '@components/Navigation/Navigation';
import Dashboard from '@components/Dashboard/Dashboard';
import UserProfile from '@components/Profile/UserProfile';
import WorkoutDiary from '@components/WorkoutDiary/WorkoutDiary';
import Login from '@components/Auth/Login';
import { useAuth } from '@hooks/useAuth';
import './App.css';

// Protected Route component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="app">
        {user && <Navigation />}
        <main className="main-content">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            
            <Route path="/diary" element={
              <ProtectedRoute>
                <WorkoutDiary />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
