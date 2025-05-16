-- Create a new storage bucket for public assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true);

-- Set up storage policies
CREATE POLICY "Public assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-assets');

-- Allow authenticated users to upload public assets
CREATE POLICY "Authenticated users can upload public assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public-assets' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update public assets
CREATE POLICY "Authenticated users can update public assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public-assets' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete public assets
CREATE POLICY "Authenticated users can delete public assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public-assets' AND
  auth.role() = 'authenticated'
); 