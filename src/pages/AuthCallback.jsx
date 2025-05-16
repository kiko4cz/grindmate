import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session) {
          navigate('/dashboard');
        } else {

          navigate('/login');
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Přesměrování...</h1>
          <p>Zpracováváme vaše přihlášení, prosím počkejte.</p>
        </div>
      </div>
    </div>
  );
}

export default AuthCallback; 