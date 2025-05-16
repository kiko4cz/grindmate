-- Drop existing tables if they exist
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS user_goals;
DROP TABLE IF EXISTS fitness_goals;
DROP TABLE IF EXISTS profiles;

-- Create profiles table with matching preferences
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    birth_date DATE,
    gender TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Matching preferences
    preferred_gender TEXT[],
    preferred_age_min INTEGER DEFAULT 18,
    preferred_age_max INTEGER DEFAULT 99,
    preferred_location_radius INTEGER DEFAULT 50, -- in kilometers
    is_active BOOLEAN DEFAULT true
);

-- Create fitness goals table
CREATE TABLE IF NOT EXISTS fitness_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_goals table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_goals (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES fitness_goals(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (user_id, goal_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user1_id, user2_id)
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    liker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    liked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(liker_id, liked_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('match', 'like', 'message', 'achievement')),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_id UUID, -- Can reference matches, likes, or messages
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert some default fitness goals
INSERT INTO fitness_goals (name, description) VALUES
    ('Weight Loss', 'Lose weight and improve body composition'),
    ('Muscle Gain', 'Build muscle mass and strength'),
    ('Endurance', 'Improve cardiovascular fitness and stamina'),
    ('Flexibility', 'Increase flexibility and mobility'),
    ('General Fitness', 'Maintain overall health and fitness'),
    ('Sports Performance', 'Improve performance in specific sports'),
    ('Rehabilitation', 'Recover from injury and improve physical function'),
    ('Stress Relief', 'Use exercise to manage stress and improve mental health');

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Fitness goals policies
CREATE POLICY "Fitness goals are viewable by everyone"
    ON fitness_goals FOR SELECT
    USING (true);

-- User goals policies
CREATE POLICY "User goals are viewable by everyone"
    ON user_goals FOR SELECT
    USING (true);

CREATE POLICY "Users can manage own goals"
    ON user_goals FOR ALL
    USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view own matches"
    ON matches FOR SELECT
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create matches"
    ON matches FOR INSERT
    WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update own matches"
    ON matches FOR UPDATE
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Likes policies
CREATE POLICY "Users can view own likes"
    ON likes FOR SELECT
    USING (auth.uid() = liker_id OR auth.uid() = liked_id);

CREATE POLICY "Users can create likes"
    ON likes FOR INSERT
    WITH CHECK (auth.uid() = liker_id);

-- Messages policies
CREATE POLICY "Users can view own messages"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages"
    ON messages FOR UPDATE
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Create functions for matching logic
CREATE OR REPLACE FUNCTION handle_new_like()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if there's a mutual like
    IF EXISTS (
        SELECT 1 FROM likes
        WHERE liker_id = NEW.liked_id
        AND liked_id = NEW.liker_id
    ) THEN
        -- Create a match
        INSERT INTO matches (user1_id, user2_id, status)
        VALUES (
            LEAST(NEW.liker_id, NEW.liked_id),
            GREATEST(NEW.liker_id, NEW.liked_id),
            'accepted'
        );
        
        -- Create notifications for both users
        INSERT INTO notifications (user_id, type, content, related_id)
        VALUES 
            (NEW.liker_id, 'match', 'You have a new match!', NEW.id),
            (NEW.liked_id, 'match', 'You have a new match!', NEW.id);
    ELSE
        -- Create notification for the liked user
        INSERT INTO notifications (user_id, type, content, related_id)
        VALUES (NEW.liked_id, 'like', 'Someone liked your profile!', NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new likes
CREATE TRIGGER on_new_like
    AFTER INSERT ON likes
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_like(); 