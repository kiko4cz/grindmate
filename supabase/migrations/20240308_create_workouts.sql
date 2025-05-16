-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can insert their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete their own workouts" ON workouts;

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_workouts_updated ON workouts;
DROP FUNCTION IF EXISTS handle_workouts_updated_at();

-- Drop the table if it exists
DROP TABLE IF EXISTS workouts;

-- Create workouts table
CREATE TABLE workouts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'planned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own workouts"
    ON workouts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts"
    ON workouts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts"
    ON workouts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts"
    ON workouts FOR DELETE
    USING (auth.uid() = user_id);

-- Create a trigger to handle updated_at
CREATE OR REPLACE FUNCTION handle_workouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_workouts_updated
    BEFORE UPDATE ON workouts
    FOR EACH ROW
    EXECUTE PROCEDURE handle_workouts_updated_at();

-- Insert sample workouts (these will be visible to all users)
INSERT INTO workouts (user_id, title, description, duration, date, type, status)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'Ranní běh', 'Lehký běh v parku', 30, NOW() + INTERVAL '1 day', 'cardio', 'planned'),
    ('00000000-0000-0000-0000-000000000000', 'Silový trénink', 'Bench press, dřepy, mrtvý tah', 60, NOW() + INTERVAL '2 days', 'strength', 'planned'),
    ('00000000-0000-0000-0000-000000000000', 'HIIT trénink', 'Intervalový trénink s vlastní váhou', 45, NOW() + INTERVAL '3 days', 'hiit', 'planned'); 