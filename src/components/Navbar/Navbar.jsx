import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { FaHome, FaDumbbell, FaUsers, FaMapMarkerAlt, FaUser, FaCog, FaCrown } from 'react-icons/fa';

function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">GrindMate</Link>
      </div>
      
      <div className="nav-links">
        <Link to="/" className={isActive('/') ? 'active' : ''}>
          <FaHome /> Domů
        </Link>
        <Link to="/workouts" className={isActive('/workouts') ? 'active' : ''}>
          <FaDumbbell /> Tréninky
        </Link>
        <Link to="/matches" className={isActive('/matches') ? 'active' : ''}>
          <FaUsers /> Matches
        </Link>
        <Link to="/map" className={isActive('/map') ? 'active' : ''}>
          <FaMapMarkerAlt /> Mapa
        </Link>
        <Link to="/subscriptions" className={isActive('/subscriptions') ? 'active' : ''}>
          <FaCrown /> Předplatné
        </Link>
        <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
          <FaUser /> Profil
        </Link>
        <Link to="/settings" className={isActive('/settings') ? 'active' : ''}>
          <FaCog /> Nastavení
        </Link>
      </div>
    </nav>
  );
}

export default Navbar; 