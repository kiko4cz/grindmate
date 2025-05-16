import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', { event: _event, session });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      console.log('AuthContext: Attempting sign in');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('AuthContext: Sign in response:', { data, error });
      
      if (error) {
        console.error('AuthContext: Sign in error:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('AuthContext: Sign in catch block:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      setSession(session);
      setUser(session?.user ?? null);
      return { session, error: null };
    } catch (error) {
      return { session: null, error };
    }
  };

  const resetPassword = async (email) => {
    try {
      // Get the current environment
      const isProduction = import.meta.env.PROD;
      const baseUrl = isProduction 
        ? 'https://grindmate.onrender.com'  // Production URL
        : window.location.origin;           // Development URL (localhost)
      
      const redirectTo = `${baseUrl}/reset-password`;
      
      console.log('Reset password attempt:', {
        email,
        redirectTo,
        environment: isProduction ? 'production' : 'development',
        baseUrl
      });
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      
      if (error) {
        console.error('Reset password error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
          details: error.details,
          redirectTo
        });

        // Handle rate limit error specifically
        if (error.status === 429) {
          const waitTime = 60; // Default wait time in seconds
          const errorMessage = `Příliš mnoho pokusů o reset hesla. Prosím, počkejte ${waitTime} sekund a zkuste to znovu.`;
          return { 
            error: new Error(errorMessage),
            rateLimited: true,
            waitTime
          };
        }
        
        throw error;
      }
      
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 