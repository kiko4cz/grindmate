import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>GrindMate</h3>
          <p>Najdi svého tréninkového parťáka a dosáhni svých fitness cílů společně.</p>
        </div>
        
        <div className="footer-section">
          <h4>Rychlé odkazy</h4>
          <ul>
            <li><Link to="/about">O nás</Link></li>
            <li><Link to="/contact">Kontakt</Link></li>
            <li><Link to="/privacy">Ochrana soukromí</Link></li>
            <li><Link to="/terms">Podmínky použití</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Sleduj nás</h4>
          <div className="social-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <FaGithub />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} GrindMate. Všechna práva vyhrazena.</p>
      </div>
    </footer>
  );
}

export default Footer; 