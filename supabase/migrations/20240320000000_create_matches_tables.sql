-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user1_id, user2_id)
);

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(sender_id, receiver_id)
);

-- Create RLS policies
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "Users can create their own matches" ON matches;
DROP POLICY IF EXISTS "Users can delete their own matches" ON matches;
DROP POLICY IF EXISTS "Users can view their own friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can create friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can update their received friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can delete their own friend requests" ON friend_requests;

-- Matches policies
CREATE POLICY "Users can view their own matches"
    ON matches FOR SELECT
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create their own matches"
    ON matches FOR INSERT
    WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can delete their own matches"
    ON matches FOR DELETE
    USING (auth.uid() = user1_id);

-- Friend requests policies
CREATE POLICY "Users can view their own friend requests"
    ON friend_requests FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create friend requests"
    ON friend_requests FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received friend requests"
    ON friend_requests FOR UPDATE
    USING (auth.uid() = receiver_id);

CREATE POLICY "Users can delete their own friend requests"
    ON friend_requests FOR DELETE
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS on_match_created ON matches;
DROP FUNCTION IF EXISTS handle_match();

-- Create function to handle match creation
CREATE OR REPLACE FUNCTION handle_match()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if there's a mutual match
    IF EXISTS (
        SELECT 1 FROM matches
        WHERE user1_id = NEW.user2_id
        AND user2_id = NEW.user1_id
    ) THEN
        -- Create friend request for both users
        INSERT INTO friend_requests (sender_id, receiver_id)
        VALUES (NEW.user1_id, NEW.user2_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for match creation
CREATE TRIGGER on_match_created
    AFTER INSERT ON matches
    FOR EACH ROW
    EXECUTE FUNCTION handle_match(); 