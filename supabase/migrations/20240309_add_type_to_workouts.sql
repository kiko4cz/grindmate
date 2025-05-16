-- Add type column to workouts table
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'strength'; 