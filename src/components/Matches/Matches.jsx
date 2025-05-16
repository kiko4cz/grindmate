import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaHeart, FaTimes, FaDumbbell, FaRunning, FaMedal, FaUserEdit } from 'react-icons/fa';
import { matchingService } from '../../services/matchingService';
import { supabase } from '../../lib/supabase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Matches = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get profiles that haven't been liked or matched with
      const { data: existingMatches, error: matchesError } = await supabase
        .from('matches')
        .select('user2_id')
        .eq('user1_id', user.id);

      if (matchesError) {
        console.error('Error fetching existing matches:', matchesError);
        throw matchesError;
      }

      const excludedUserIds = [
        user.id,
        ...(existingMatches?.map(match => match.user2_id) || [])
      ];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${excludedUserIds.join(',')})`)
        .limit(10);

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        setProfiles([]);
        return;
      }

      setProfiles(data);
    } catch (error) {
      console.error('Error in fetchProfiles:', error);
      setError('Failed to load profiles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!profiles[currentIndex]) return;

    try {
      // Check if user's profile is complete
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Check if profile is complete
      const isProfileComplete = userProfile && 
        userProfile.username && 
        userProfile.avatar_url && 
        userProfile.bio && 
        userProfile.height && 
        userProfile.weight && 
        userProfile.fitness_level;

      if (!isProfileComplete) {
        toast.error('Profil není kompletní. Prosím, dokončete svůj profil před lajkováním.', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      // Create a match
      const { error } = await supabase
        .from('matches')
        .insert({
          user1_id: user.id,
          user2_id: profiles[currentIndex].id
        });

      if (error) throw error;

      // Check if it's a mutual match
      const { data: mutualMatch, error: checkError } = await supabase
        .from('matches')
        .select('*')
        .eq('user1_id', profiles[currentIndex].id)
        .eq('user2_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      if (mutualMatch) {
        setMatchedProfile(profiles[currentIndex]);
        setShowMatch(true);
        setMatches(prev => [...prev, profiles[currentIndex]]);
        toast.success(`It's a match! You and ${profiles[currentIndex].username} liked each other! 🎉`, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.info(`You liked ${profiles[currentIndex].username}!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      
      // Move to next profile
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error('Failed to process like. Please try again.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleDislike = () => {
    if (profiles[currentIndex]) {
      toast.info(`You passed on ${profiles[currentIndex].username}`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    setCurrentIndex(prev => prev + 1);
  };

  const closeMatchAnimation = () => {
    setShowMatch(false);
    setMatchedProfile(null);
  };

  const handleCompleteProfile = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="matches-page">
        <div className="matches-container">
          <div className="loading-state">
            <div className="loading-spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="matches-page">
        <div className="matches-container">
          <div className="error-state">
            <FaUserEdit className="error-icon" />
            <h2>Profil není kompletní</h2>
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={handleCompleteProfile}
            >
              Dokončit profil
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="matches-page">
        <div className="matches-container">
          <div className="empty-state">
            <h2>No more profiles to show</h2>
            <p>Check back later for new matches!</p>
          </div>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="matches-page">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="matches-container">
        <div className="matches-header">
          <h1>Find Your Match</h1>
          <p>Swipe right to like, left to pass</p>
        </div>

        <div className="card-stack">
          <div className="profile-card">
            <div className="profile-image-container">
              <img 
                src={currentProfile.avatar_url || '/default-avatar.png'} 
                alt={currentProfile.username}
                className="profile-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
              />
            </div>
            <div className="profile-content">
              <h2 className="profile-name">{currentProfile.username}</h2>
              <p className="profile-goals">{currentProfile.bio || 'No bio yet'}</p>
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-value">{currentProfile.height || '-'}</span>
                  <span className="stat-label">Height</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{currentProfile.weight || '-'}</span>
                  <span className="stat-label">Weight</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{currentProfile.fitness_level || '-'}</span>
                  <span className="stat-label">Level</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="action-button dislike"
            onClick={handleDislike}
          >
            <FaTimes />
          </button>
          <button 
            className="action-button like"
            onClick={handleLike}
          >
            <FaHeart />
          </button>
        </div>

        {matches.length > 0 && (
          <div className="matches-list">
            <h2>Your Matches</h2>
            <div className="matches-grid">
              {matches.map(match => (
                <div key={match.id} className="match-card">
                  <div className="match-card-image-container">
                    <img 
                      src={match.avatar_url || '/default-avatar.png'} 
                      alt={match.username}
                      className="match-card-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                  </div>
                  <div className="match-card-content">
                    <h3>{match.username}</h3>
                    <p className="match-card-goals">{match.bio || 'No bio yet'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showMatch && matchedProfile && (
          <div className="match-animation" onClick={closeMatchAnimation}>
            <div className="match-content">
              <h2>It's a Match!</h2>
              <p>You and {matchedProfile.username} liked each other</p>
              <button className="btn btn-primary" onClick={closeMatchAnimation}>
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches; 