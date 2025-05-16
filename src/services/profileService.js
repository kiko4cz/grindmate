import { supabase } from '../config/supabaseClient';

export const profileService = {
  // Get user profile
  async getUserProfile(userId) {
    const { data, error } = await supabase
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
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create or update user profile
  async upsertProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update profile picture
  async updateProfilePicture(userId, file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `profile-pictures/${fileName}`;

    // Upload image to storage
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    // Update profile with new picture URL
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    return data;
  },

  // Delete profile picture
  async deleteProfilePicture(userId) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    if (profile.avatar_url) {
      const filePath = profile.avatar_url.split('/').pop();
      
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('profiles')
        .remove([`profile-pictures/${filePath}`]);

      if (deleteError) throw deleteError;
    }

    // Update profile to remove avatar URL
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    return data;
  },

  // Update profile visibility
  async updateProfileVisibility(userId, isActive) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Search profiles
  async searchProfiles(searchParams) {
    const {
      ageRange,
      location,
      goals,
      gender,
      limit = 20,
      offset = 0
    } = searchParams;

    let query = supabase
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
      .eq('is_active', true);

    if (ageRange) {
      query = query
        .gte('birth_date', new Date(new Date().setFullYear(new Date().getFullYear() - ageRange.max)))
        .lte('birth_date', new Date(new Date().setFullYear(new Date().getFullYear() - ageRange.min)));
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (gender) {
      query = query.eq('gender', gender);
    }

    if (goals && goals.length > 0) {
      query = query.contains('fitness_goals', goals);
    }

    const { data, error } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}; 