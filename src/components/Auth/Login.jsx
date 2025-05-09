import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/images/t3.png';

function Login() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        // Přeložení chybových hlášek do češtiny
        const errorMessages = {
          'Invalid login credentials': 'Nesprávný email nebo heslo',
          'Email not confirmed': 'Email není potvrzen',
          'User already registered': 'Uživatel již existuje',
          'Password should be at least 6 characters': 'Heslo musí mít alespoň 6 znaků',
          'Invalid email': 'Neplatný email'
        };
        throw new Error(errorMessages[error.message] || 'Něco se pokazilo, zkuste to znovu');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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
          <h1>{isLogin ? 'Přihlášení' : 'Registrace'}</h1>
          
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vas@email.cz"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Heslo</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Načítání...' : isLogin ? 'Přihlásit se' : 'Registrovat se'}
            </button>
          </form>

          <div className="auth-switch">
            <button
              className="btn"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Nemáte účet? Zaregistrujte se' : 'Již máte účet? Přihlaste se'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 