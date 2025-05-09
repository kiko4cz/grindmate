import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [emailChange, setEmailChange] = useState({
    newEmail: '',
    password: '',
    showForm: false
  });
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    height: '',
    weight: '',
    fitness_level: 'beginner'
  });

  useEffect(() => {
    if (user) {
      console.log('Uživatel v profilu:', user);
      fetchProfile();
    } else {
      console.log('Uživatel není přihlášen');
      setLoading(false);
      setError('Uživatel není přihlášen');
    }
  }, [user]);

  async function handleEmailChange(e) {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);

      // First, verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: emailChange.password
      });

      if (signInError) {
        throw new Error('Nesprávné heslo');
      }

      // Send email change confirmation
      const { error: updateError } = await supabase.auth.updateUser({
        email: emailChange.newEmail
      });

      if (updateError) {
        throw new Error(`Nepodařilo se změnit email: ${updateError.message}`);
      }

      // Show success message
      setError('Na nový email byl odeslán potvrzovací odkaz. Prosím, zkontrolujte svůj email.');
      setEmailChange({ newEmail: '', password: '', showForm: false });
    } catch (err) {
      console.error('Chyba při změně emailu:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSelect(event) {
    if (event.target.files && event.target.files.length > 0) {
      try {
        setUploading(true);
        setError(null);

        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          throw new Error(`Nepodařilo se nahrát obrázek: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(fileName);

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ photo_url: publicUrl })
          .eq('user_id', user.id);

        if (updateError) {
          throw new Error(`Nepodařilo se aktualizovat profil: ${updateError.message}`);
        }

        await fetchProfile();
      } catch (err) {
        console.error('Chyba při nahrávání:', err);
        setError(err.message);
      } finally {
        setUploading(false);
      }
    }
  }

  async function fetchProfile() {
    try {
      setLoading(true);
      setError(null);

      console.log('Načítání profilu pro uživatele:', user.id);

      // First, try to fetch the existing profile
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('Výsledek načtení profilu:', { data, error: fetchError });

      if (fetchError) {
        console.error('Chyba při načítání profilu:', fetchError);
        
        // If profile doesn't exist, create a new one
        if (fetchError.code === 'PGRST116') {
          console.log('Profil nenalezen, vytvářím nový profil');
          
          const newProfile = {
            user_id: user.id,
            username: user.email?.split('@')[0] || '',
            full_name: '',
            bio: '',
            photo_url: null,
            height: null,
            weight: null,
            fitness_level: 'beginner',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log('Vytvářím nový profil:', newProfile);

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();

          if (createError) {
            console.error('Chyba při vytváření profilu:', createError);
            throw new Error(`Nepodařilo se vytvořit profil: ${createError.message}`);
          }

          console.log('Profil úspěšně vytvořen:', createdProfile);
          setProfile(createdProfile);
          setFormData({
            username: createdProfile.username || '',
            full_name: createdProfile.full_name || '',
            bio: createdProfile.bio || '',
            height: createdProfile.height || '',
            weight: createdProfile.weight || '',
            fitness_level: createdProfile.fitness_level || 'beginner'
          });
          setEditing(true); // Automatically enter edit mode for new profiles
        } else {
          throw new Error(`Nepodařilo se načíst profil: ${fetchError.message}`);
        }
      } else {
        console.log('Profil nalezen:', data);
        setProfile(data);
        setFormData({
          username: data.username || '',
          full_name: data.full_name || '',
          bio: data.bio || '',
          height: data.height || '',
          weight: data.weight || '',
          fitness_level: data.fitness_level || 'beginner'
        });
      }
    } catch (err) {
      console.error('Chyba profilu:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError(null);
      console.log('Aktualizuji profil s daty:', formData);

      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          fitness_level: formData.fitness_level,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Chyba při aktualizaci profilu:', error);
        throw new Error(`Nepodařilo se uložit změny: ${error.message}`);
      }

      console.log('Profil úspěšně aktualizován');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      console.error('Chyba při aktualizaci:', err);
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Načítání...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <div className="error-message">
            {error}
          </div>
          <button 
            onClick={() => fetchProfile()} 
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Profil uživatele</h1>

      <div className="card">
        {!editing ? (
          <>
            <div className="profile-header">
              <div className="profile-photo">
                {profile?.photo_url ? (
                  <img 
                    src={profile.photo_url} 
                    alt="Profilový obrázek" 
                    className="profile-image"
                  />
                ) : (
                  <div className="profile-image-placeholder">
                    <span>Žádný obrázek</span>
                  </div>
                )}
              </div>
              <div className="profile-info">
                <h2>{profile?.username || 'Uživatel'}</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Jméno:</strong> {profile?.full_name || 'Neuvedeno'}</p>
                <p><strong>Bio:</strong> {profile?.bio || 'Žádný popis'}</p>
                <p><strong>Výška:</strong> {profile?.height ? `${profile.height} cm` : 'Neuvedeno'}</p>
                <p><strong>Váha:</strong> {profile?.weight ? `${profile.weight} kg` : 'Neuvedeno'}</p>
                <p><strong>Úroveň:</strong> {
                  profile?.fitness_level === 'beginner' ? 'Začátečník' :
                  profile?.fitness_level === 'intermediate' ? 'Středně pokročilý' :
                  profile?.fitness_level === 'advanced' ? 'Pokročilý' : 'Neuvedeno'
                }</p>
                <button 
                  onClick={() => setEmailChange({ ...emailChange, showForm: true })}
                  className="btn btn-secondary"
                  style={{ marginTop: '1rem' }}
                >
                  Změnit email
                </button>
              </div>
              <button 
                onClick={() => setEditing(true)}
                className="btn btn-secondary"
              >
                Upravit profil
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="profile-edit-form">
            <div className="profile-photo-upload">
              <div className="current-photo">
                {profile?.photo_url ? (
                  <img 
                    src={profile.photo_url} 
                    alt="Profilový obrázek" 
                    className="profile-image"
                  />
                ) : (
                  <div className="profile-image-placeholder">
                    <span>Žádný obrázek</span>
                  </div>
                )}
              </div>
              <div className="upload-controls">
                <label htmlFor="photo-upload" className="btn btn-secondary">
                  {uploading ? 'Nahrávání...' : 'Nahrát fotku'}
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="username">Uživatelské jméno</label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  placeholder="Zadejte uživatelské jméno"
                />
              </div>

              <div className="form-group">
                <label htmlFor="full_name">Celé jméno</label>
                <input
                  type="text"
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Zadejte celé jméno"
                />
              </div>

              <div className="form-group">
                <label htmlFor="height">Výška (cm)</label>
                <input
                  type="number"
                  id="height"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="Např. 180"
                />
              </div>

              <div className="form-group">
                <label htmlFor="weight">Váha (kg)</label>
                <input
                  type="number"
                  id="weight"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="Např. 75"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fitness_level">Úroveň</label>
                <select
                  id="fitness_level"
                  value={formData.fitness_level}
                  onChange={(e) => setFormData({ ...formData, fitness_level: e.target.value })}
                >
                  <option value="beginner">Začátečník</option>
                  <option value="intermediate">Středně pokročilý</option>
                  <option value="advanced">Pokročilý</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Napište něco o sobě..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Uložit změny
              </button>
              <button 
                type="button" 
                onClick={() => setEditing(false)}
                className="btn btn-secondary"
              >
                Zrušit
              </button>
            </div>
          </form>
        )}

        {emailChange.showForm && (
          <div className="card" style={{ marginTop: '2rem' }}>
            <h3>Změna emailu</h3>
            <form onSubmit={handleEmailChange}>
              <div className="form-group">
                <label htmlFor="newEmail">Nový email</label>
                <input
                  type="email"
                  id="newEmail"
                  value={emailChange.newEmail}
                  onChange={(e) => setEmailChange({ ...emailChange, newEmail: e.target.value })}
                  required
                  placeholder="Zadejte nový email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Heslo pro potvrzení</label>
                <input
                  type="password"
                  id="password"
                  value={emailChange.password}
                  onChange={(e) => setEmailChange({ ...emailChange, password: e.target.value })}
                  required
                  placeholder="Zadejte své heslo"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Změnit email
                </button>
                <button 
                  type="button" 
                  onClick={() => setEmailChange({ newEmail: '', password: '', showForm: false })}
                  className="btn btn-secondary"
                >
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile; 