import { supabase } from '../lib/supabase';

export const matchingService = {
  // Get potential matches based on user preferences
  async getPotentialMatches(userId) {
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Check if profile is complete
    const requiredFields = ['username', 'full_name', 'bio', 'birth_date', 'gender', 'location', 'preferred_gender'];
    const isProfileComplete = requiredFields.every(field => {
      if (field === 'preferred_gender') {
        return userProfile[field] && userProfile[field].length > 0;
      }
      return userProfile[field] && userProfile[field].trim() !== '';
    });

    if (!isProfileComplete) {
      throw new Error('Profil není kompletní. Prosím, vyplňte všechny povinné údaje v profilu.');
    }

    // Get users that match preferences and haven't been liked/disliked
    const { data: potentialMatches, error: matchesError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_goals (
          goal_id,
          fitness_goals (
            name,
            description
          )
        )
      `)
      .neq('id', userId)
      .not('id', 'in', (
        supabase
          .from('likes')
          .select('liked_id')
          .eq('liker_id', userId)
      ))
      .not('id', 'in', (
        supabase
          .from('matches')
          .select('user2_id')
          .eq('user1_id', userId)
      ))
      .not('id', 'in', (
        supabase
          .from('matches')
          .select('user1_id')
          .eq('user2_id', userId)
      ))
      .eq('is_active', true)
      .limit(20);

    if (matchesError) throw matchesError;

    return potentialMatches;
  },

  // Like a user
  async likeUser(likerId, likedId) {
    // Check if liker's profile is complete
    const { data: likerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', likerId)
      .single();

    if (profileError) throw profileError;

    // Check if profile is complete
    const requiredFields = ['username', 'full_name', 'bio', 'birth_date', 'gender', 'location', 'preferred_gender'];
    const isProfileComplete = requiredFields.every(field => {
      if (field === 'preferred_gender') {
        return likerProfile[field] && likerProfile[field].length > 0;
      }
      return likerProfile[field] && likerProfile[field].trim() !== '';
    });

    if (!isProfileComplete) {
      throw new Error('Profil není kompletní. Prosím, vyplňte všechny povinné údaje v profilu.');
    }

    const { data, error } = await supabase
      .from('likes')
      .insert([
        {
          liker_id: likerId,
          liked_id: likedId
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's matches
  async getUserMatches(userId) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user1:profiles!matches_user1_id_fkey(*),
        user2:profiles!matches_user2_id_fkey(*)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) throw error;
    return data;
  },

  // Get user's likes
  async getUserLikes(userId) {
    const { data, error } = await supabase
      .from('likes')
      .select(`
        *,
        liked:profiles!likes_liked_id_fkey(*)
      `)
      .eq('liker_id', userId);

    if (error) throw error;
    return data;
  },

  // Get users who liked the current user
  async getLikedByUsers(userId) {
    const { data, error } = await supabase
      .from('likes')
      .select(`
        *,
        liker:profiles!likes_liker_id_fkey(*)
      `)
      .eq('liked_id', userId);

    if (error) throw error;
    return data;
  },

  // Update user's matching preferences
  async updateMatchingPreferences(userId, preferences) {
    const { data, error } = await supabase
      .from('profiles')
      .update(preferences)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's fitness goals
  async getUserGoals(userId) {
    const { data, error } = await supabase
      .from('user_goals')
      .select(`
        *,
        fitness_goals (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  // Add fitness goal to user
  async addUserGoal(userId, goalId) {
    const { data, error } = await supabase
      .from('user_goals')
      .insert([
        {
          user_id: userId,
          goal_id: goalId
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove fitness goal from user
  async removeUserGoal(userId, goalId) {
    const { error } = await supabase
      .from('user_goals')
      .delete()
      .eq('user_id', userId)
      .eq('goal_id', goalId);

    if (error) throw error;
  },

  // Get all available fitness goals
  async getAllFitnessGoals() {
    const { data, error } = await supabase
      .from('fitness_goals')
      .select('*');

    if (error) throw error;
    return data;
  }
}; 