import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/images/t3.png';

function Navigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Přehled' },
    { path: '/workouts', label: 'Tréninky' },
    { path: '/profile', label: 'Profil' }
  ];

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <img src={logo} alt="GrindMate Logo" />
          <span>GrindMate</span>
        </Link>

        <nav className="nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="auth-section">
          {user ? (
            <button onClick={signOut} className="btn btn-secondary">
              Odhlásit se
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Přihlásit se
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navigation; 