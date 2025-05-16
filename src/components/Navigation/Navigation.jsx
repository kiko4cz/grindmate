import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import logo from '../../assets/images/t3.png';
import { 
  FaHome, 
  FaUser, 
  FaChartLine, 
  FaCrown, 
  FaHeart, 
  FaSignOutAlt, 
  FaDumbbell, 
  FaMapMarkerAlt, 
  FaCog,
  FaCalendarAlt,
  FaDumbbell as FaProgram,
  FaBars
} from 'react-icons/fa';
import Notifications from '../Notifications/Notifications';
import './Navigation.css';

function Navigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Domov' },
    { path: '/matches', icon: <FaHeart />, label: 'Matches' },
    { path: '/program', icon: <FaProgram />, label: 'Program' },
    { path: '/map', icon: <FaMapMarkerAlt />, label: 'Mapa' },
    { path: '/subscriptions', icon: <FaCrown />, label: 'Předplatné' },
    { path: '/profile', icon: <FaUser />, label: 'Profil' },
    { path: '/settings', icon: <FaCog />, label: 'Nastavení' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/dashboard" className="logo">
          <img src={logo} alt="GrindMate Logo" />
          <span>GrindMate</span>
        </Link>

        <button className="mobile-menu-button" onClick={toggleMenu} aria-label="Toggle menu">
          <FaBars />
        </button>

        <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="auth-section">
          {user ? (
            <>
              <Notifications />
              <button 
                onClick={signOut} 
                className="icon-button"
                aria-label="Odhlásit se"
              >
                <FaSignOutAlt />
              </button>
            </>
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