import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import logo from '../assets/images/t3.png';

function Login() {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Attempting login with:', { email: formData.email });
      const { data, error } = await signIn(formData.email, formData.password);
      console.log('Login response:', { data, error });

      if (error) {
        console.error('Login error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        if (error.message === 'Invalid login credentials') {
          throw new Error('Nesprávný email nebo heslo. Pokud jste se právě zaregistrovali, nezapomeňte potvrdit svůj email.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Email nebyl potvrzen. Prosím, zkontrolujte svůj email a klikněte na potvrzovací odkaz.');
        } else {
          throw error;
        }
      }

      if (data?.user) {
        console.log('Login successful, user:', data.user);
        navigate('/dashboard');
      } else {
        console.log('No user data in response');
        throw new Error('Nepodařilo se přihlásit. Zkuste to prosím znovu.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-welcome">
          <img src={logo} alt="GrindMate Logo" className="auth-logo" />
          <h1>Vítejte v GrindMate</h1>
          <p>
            Sledujte své fitness cíle, sdílejte své úspěchy a spojte se s podobně smýšlejícími lidmi.
            Začněte svou cestu k lepšímu já ještě dnes!
          </p>
        </div>

        <div className="auth-card">
          <h1>Přihlášení</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Zadejte svůj email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Heslo</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Zadejte své heslo"
              />
              <div className="form-actions">
                <Link to="/reset-password" className="forgot-password">
                  Zapomenuté heslo?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Přihlašování...' : 'Přihlásit se'}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              Nemáte účet?{' '}
              <Link to="/register" className="btn">
                Registrovat se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 