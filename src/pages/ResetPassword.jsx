import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import logo from '../assets/images/t3.png';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword, updatePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error, rateLimited, waitTime } = await resetPassword(formData.email);
      
      if (rateLimited) {
        setCountdown(waitTime);
        throw new Error(error.message);
      }
      
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error('Password reset request error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Hesla se neshodují');
      }

      const { error } = await updatePassword(formData.password);
      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If we have a token in the URL, show the password reset form
  const hasToken = searchParams.get('token');

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="success-state text-center">
              <h2 className="mb-4">
                {hasToken ? 'Heslo bylo úspěšně změněno!' : 'Email byl odeslán!'}
              </h2>
              <p className="mb-4">
                {hasToken 
                  ? 'Vaše heslo bylo úspěšně změněno. Za chvíli budete přesměrováni na přihlašovací stránku.'
                  : 'Na váš email jsme poslali odkaz pro obnovení hesla. Prosím, zkontrolujte svou emailovou schránku.'}
              </p>
              {!hasToken && (
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/login')}
                >
                  Zpět na přihlášení
                </button>
              )}
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
          <h1>Obnovení hesla</h1>
          <p>
            {hasToken 
              ? 'Zadejte své nové heslo pro obnovení přístupu k účtu.'
              : 'Zadejte svůj email a my vám zašleme odkaz pro obnovení hesla.'}
          </p>
        </div>

        <div className="auth-card">
          <h1>{hasToken ? 'Nastavení nového hesla' : 'Zapomenuté heslo'}</h1>
          
          {error && (
            <div className="error-message">
              {error}
              {countdown > 0 && (
                <div className="countdown-message">
                  Zbývající čas: {countdown} sekund
                </div>
              )}
            </div>
          )}

          <form onSubmit={hasToken ? handleResetPassword : handleRequestReset}>
            {!hasToken && (
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
                  disabled={countdown > 0}
                />
              </div>
            )}

            {hasToken && (
              <>
                <div className="form-group">
                  <label htmlFor="password">Nové heslo</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="Zadejte nové heslo"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Potvrzení hesla</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="Zadejte heslo znovu"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || countdown > 0}
            >
              {loading 
                ? (hasToken ? 'Ukládání...' : 'Odesílání...') 
                : (hasToken ? 'Nastavit nové heslo' : 'Odeslat odkaz')}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              <button 
                className="btn" 
                onClick={() => navigate('/login')}
                disabled={countdown > 0}
              >
                Zpět na přihlášení
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword; 