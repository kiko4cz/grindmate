-- First drop the foreign key constraint if it exists
ALTER TABLE workouts 
  DROP CONSTRAINT IF EXISTS workouts_user_id_fkey;

-- Drop the existing user_id column
ALTER TABLE workouts 
  DROP COLUMN IF EXISTS user_id;

-- Add the user_id column with correct UUID type
ALTER TABLE workouts 
  ADD COLUMN user_id UUID REFERENCES auth.users(id); 