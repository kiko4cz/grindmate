import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FaUserPlus } from 'react-icons/fa';
import logo from '../assets/images/t3.png';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        throw new Error('Hesla se neshodují');
      }

      console.log('Starting registration process...');

      // Register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: email.split('@')[0],
            full_name: email.split('@')[0],
            bio: 'Nový uživatel GrindMate',
            birth_date: '1990-01-01',
            gender: 'male',
            location: 'Praha',
            preferred_gender: ['female', 'male'],
            preferred_age_min: 18,
            preferred_age_max: 99,
            preferred_location_radius: 50,
            is_active: true
          }
        }
      });

      console.log('Auth response:', { authData, authError });

      if (authError) {
        console.error('Registration error details:', {
          message: authError.message,
          status: authError.status,
          name: authError.name
        });
        
        // Handle rate limiting error
        if (authError.message.includes('security purposes') || authError.status === 429) {
          const waitTime = parseInt(authError.message.match(/\d+/)[0]) || 50;
          setCountdown(waitTime);
          throw new Error(`Příliš mnoho pokusů o registraci. Prosím, počkejte ${waitTime} sekund a zkuste to znovu.`);
        }
        
        // Handle other common errors
        if (authError.message.includes('already registered')) {
          throw new Error('Tento email je již registrován. Zkuste se přihlásit nebo použijte jiný email.');
        }
        
        throw authError;
      }

      // Check if email confirmation is required
      if (authData?.user) {
        console.log('User created successfully:', authData.user);
        
        // Check if email confirmation is required
        if (authData.user.identities?.length === 0) {
          console.log('Email confirmation required');
          setSuccess(true);
        } else {
          console.log('No email confirmation required, user is ready');
          setSuccess(true);
        }
      } else {
        console.error('No user data in response');
        throw new Error('Nepodařilo se vytvořit účet. Zkuste to prosím znovu.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="success-state text-center">
              <FaUserPlus className="success-icon mx-auto mb-4" />
              <h2 className="mb-4">Registrace úspěšná!</h2>
              <p className="mb-3">Na váš email jsme poslali potvrzovací odkaz. Prosím, zkontrolujte svou emailovou schránku a klikněte na odkaz pro potvrzení vašeho účtu.</p>
              <p className="mb-4">Po potvrzení emailu se budete moci přihlásit do aplikace.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/login')}
              >
                Přejít na přihlášení
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-welcome">
          <img src={logo} alt="GrindMate Logo" className="auth-logo" />
          <h1>Vítejte v GrindMate</h1>
          <p>Připojte se k naší komunitě fitness nadšenců a najděte si tréninkového parťáka na míru.</p>
        </div>

        <div className="auth-card">
          <h1>Vytvořit účet</h1>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vas@email.cz"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Heslo</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Minimálně 6 znaků"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Potvrzení hesla</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Zadejte heslo znovu"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || countdown > 0}
            >
              {loading ? 'Registrace...' : countdown > 0 ? `Počkejte ${countdown}s` : 'Registrovat'}
            </button>
          </form>

          <div className="auth-switch">
            <p>Již máte účet? <button className="btn" onClick={() => navigate('/login')}>Přihlásit se</button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 