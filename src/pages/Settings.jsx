import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FaBell, FaLock, FaMapMarkerAlt, FaLanguage, FaPalette } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Settings() {
  const { t } = useTranslation();
  const { settings, setSettings, saveSettings, loading } = useSettings();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    const success = await saveSettings(settings);
    if (success) {
      toast.success(t('settings.saved'));
      setHasChanges(false);
    } else {
      toast.error(t('settings.saveError'));
    }
  };

  const renderSaveButton = () => (
    <button
      className="settings-save-button"
      onClick={handleSave}
      disabled={!hasChanges || loading}
    >
      {loading ? t('common.loading') : t('common.save')}
    </button>
  );

  const tabs = [
    { id: 'notifications', label: 'Notifikace', icon: <FaBell /> },
    { id: 'privacy', label: 'Soukromí', icon: <FaLock /> },
    { id: 'location', label: 'Lokace', icon: <FaMapMarkerAlt /> },
    { id: 'language', label: 'Jazyk', icon: <FaLanguage /> },
    { id: 'appearance', label: 'Vzhled', icon: <FaPalette /> }
  ];

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Načítání nastavení...</div>;
    }

    switch (activeTab) {
      case 'notifications':
        return (
          <div className="settings-section">
            <h2>{t('settings.notifications.title')}</h2>
            <div className="settings-option">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.pushEnabled}
                  onChange={(e) => handleSettingChange('notifications', 'pushEnabled', e.target.checked)}
                />
                {t('settings.notifications.pushEnabled')}
              </label>
            </div>
            <div className="settings-option">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailEnabled}
                  onChange={(e) => handleSettingChange('notifications', 'emailEnabled', e.target.checked)}
                />
                {t('settings.notifications.emailEnabled')}
              </label>
            </div>
            <div className="settings-option">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.workoutReminders}
                  onChange={(e) => handleSettingChange('notifications', 'workoutReminders', e.target.checked)}
                />
                {t('settings.notifications.workoutReminders')}
              </label>
            </div>
            {renderSaveButton()}
          </div>
        );

      case 'privacy':
        return (
          <div className="settings-section">
            <h2>{t('settings.privacy.title')}</h2>
            <div className="settings-option">
              <label>
                <input
                  type="checkbox"
                  checked={settings.privacy.activitySharing}
                  onChange={(e) => handleSettingChange('privacy', 'activitySharing', e.target.checked)}
                />
                {t('settings.privacy.activitySharing')}
              </label>
            </div>
            <div className="settings-option">
              <label>
                <select
                  value={settings.privacy.profileVisibility}
                  onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                >
                  <option value="public">{t('settings.privacy.visibility.public')}</option>
                  <option value="friends">{t('settings.privacy.visibility.friends')}</option>
                  <option value="private">{t('settings.privacy.visibility.private')}</option>
                </select>
                {t('settings.privacy.profileVisibility')}
              </label>
            </div>
            {renderSaveButton()}
          </div>
        );

      case 'location':
        return (
          <div className="settings-section">
            <h2>{t('settings.location.title')}</h2>
            <div className="settings-option">
              <label>
                <input
                  type="checkbox"
                  checked={settings.location.locationSharing}
                  onChange={(e) => handleSettingChange('location', 'locationSharing', e.target.checked)}
                />
                {t('settings.location.locationSharing')}
              </label>
            </div>
            <div className="settings-option">
              <label>
                <input
                  type="checkbox"
                  checked={settings.location.showOnMap}
                  onChange={(e) => handleSettingChange('location', 'showOnMap', e.target.checked)}
                />
                {t('settings.location.showOnMap')}
              </label>
            </div>
            {renderSaveButton()}
          </div>
        );

      case 'language':
        return (
          <div className="settings-section">
            <h2>{t('settings.language.title')}</h2>
            <div className="settings-option">
              <label>
                <select
                  value={settings.language.current}
                  onChange={(e) => handleSettingChange('language', 'current', e.target.value)}
                >
                  <option value="cs">Čeština</option>
                  <option value="en">English</option>
                </select>
                {t('settings.language.current')}
              </label>
            </div>
            {renderSaveButton()}
          </div>
        );

      case 'appearance':
        return (
          <div className="settings-section">
            <h2>{t('settings.appearance.title')}</h2>
            <div className="settings-option">
              <label>
                <input
                  type="checkbox"
                  checked={settings.appearance.darkMode}
                  onChange={(e) => handleSettingChange('appearance', 'darkMode', e.target.checked)}
                />
                {t('settings.appearance.darkMode')}
              </label>
            </div>
            <div className="settings-option">
              <label>
                <select
                  value={settings.appearance.theme}
                  onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                >
                  <option value="default">{t('settings.appearance.theme.default')}</option>
                  <option value="modern">{t('settings.appearance.theme.modern')}</option>
                  <option value="minimal">{t('settings.appearance.theme.minimal')}</option>
                </select>
                {t('settings.appearance.theme.title')}
              </label>
            </div>
            {renderSaveButton()}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <ToastContainer
        position="top-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="settings-container">
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="settings-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
} 