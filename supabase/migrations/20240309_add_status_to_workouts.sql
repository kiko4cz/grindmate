-- Add status column to workouts table
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planned'; 