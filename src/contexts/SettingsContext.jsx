import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      pushEnabled: false,
      emailEnabled: false,
      workoutReminders: false
    },
    privacy: {
      activitySharing: true,
      profileVisibility: 'public'
    },
    location: {
      locationSharing: true,
      showOnMap: true
    },
    language: {
      current: 'cs'
    },
    appearance: {
      darkMode: false,
      theme: 'default'
    }
  });
  const [loading, setLoading] = useState(true);

  // Load settings when user changes
  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  // Apply settings when they change
  useEffect(() => {
    applySettings();
  }, [settings]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default settings
          const defaultSettings = {
            notifications: {
              pushEnabled: false,
              emailEnabled: false,
              workoutReminders: false
            },
            privacy: {
              activitySharing: true,
              profileVisibility: 'public'
            },
            location: {
              locationSharing: true,
              showOnMap: true
            },
            language: {
              current: 'cs'
            },
            appearance: {
              darkMode: false,
              theme: 'default'
            }
          };

          const { error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: user.id,
              settings: defaultSettings
            });

          if (insertError) throw insertError;

          setSettings(defaultSettings);
          return;
        }
        throw error;
      }

      if (data?.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      const { data: existingSettings, error: checkError } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let result;
      if (existingSettings) {
        result = await supabase
          .from('user_settings')
          .update({ settings: newSettings })
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            settings: newSettings
          });
      }

      if (result.error) throw result.error;
      
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  };

  const applySettings = () => {
    // Apply language
    document.documentElement.lang = settings.language.current;

    // Apply theme
    document.documentElement.setAttribute('data-theme', settings.appearance.theme);
    
    // Apply dark mode
    if (settings.appearance.darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }

    // Apply other settings as needed
    // For example, you might want to update meta tags, apply CSS variables, etc.
  };

  const value = {
    settings,
    setSettings,
    saveSettings,
    loading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 