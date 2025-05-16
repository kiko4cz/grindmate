import { supabase } from './supabase';

export const storageService = {
  /**
   * Upload a file to the public assets bucket
   * @param {File} file - The file to upload
   * @param {string} path - The path where the file should be stored (e.g., 'logos/logo.png')
   * @returns {Promise<{publicUrl: string, error: Error|null}>}
   */
  async uploadPublicAsset(file, path) {
    try {
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public-assets')
        .getPublicUrl(path);

      return { publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading public asset:', error);
      return { publicUrl: null, error };
    }
  },

  /**
   * Delete a file from the public assets bucket
   * @param {string} path - The path of the file to delete
   * @returns {Promise<{error: Error|null}>}
   */
  async deletePublicAsset(path) {
    try {
      const { error } = await supabase.storage
        .from('public-assets')
        .remove([path]);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting public asset:', error);
      return { error };
    }
  }
}; 