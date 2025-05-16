import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from '@components/Navigation/Navigation';
import Footer from '@components/Footer/Footer';
import Dashboard from '@components/Dashboard/Dashboard';
import UserProfile from '@components/Profile/UserProfile';
import WorkoutDiary from '@components/WorkoutDiary/WorkoutDiary';
import Login from '@pages/Login';
import Register from '@pages/Register';
import ResetPassword from '@pages/ResetPassword';
import SubscriptionsPage from '@pages/SubscriptionsPage';
import Matches from '@components/Matches/Matches';
import AuthCallback from '@pages/AuthCallback';
import PrivateRoute from '@components/Auth/PrivateRoute';
import Map from './components/Map/Map';
import Settings from './pages/Settings';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/reset-password' ||
    location.pathname === '/auth/callback';

  return (
    <div className="app">
      {!isAuthPage && <Navigation />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/diary"
            element={
              <PrivateRoute>
                <WorkoutDiary />
              </PrivateRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <PrivateRoute>
                <SubscriptionsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <PrivateRoute>
                <Matches />
              </PrivateRoute>
            }
          />
          <Route
            path="/map"
            element={
              <PrivateRoute>
                <Map />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
