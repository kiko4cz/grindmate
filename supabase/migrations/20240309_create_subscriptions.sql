-- Create subscription plans table
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('user', 'trainer')),
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create boosts table
CREATE TABLE boosts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    duration_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create user subscriptions table
CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    plan_id INTEGER REFERENCES subscription_plans(id),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create user boosts table
CREATE TABLE user_boosts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    boost_id INTEGER REFERENCES boosts(id),
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('active', 'used', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_boosts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view subscription plans"
    ON subscription_plans FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view boosts"
    ON boosts FOR SELECT
    USING (true);

CREATE POLICY "Users can view their own subscriptions"
    ON user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own boosts"
    ON user_boosts FOR SELECT
    USING (auth.uid() = user_id);

-- Insert subscription plans
INSERT INTO subscription_plans (name, type, price, description, features) VALUES
    ('Základ', 'user', 99.00, 'Přístup k pokročilým statistikám, deníku, cílům', 
    '{"features": ["Pokročilé statistiky", "Deník", "Cíle"]}'),
    ('Pro', 'user', 199.00, 'Přístup ke všem výzvám, neomezené spojení a chat s ostatními',
    '{"features": ["Všechny výzvy", "Neomezené spojení", "Chat s ostatními", "Pokročilé statistiky", "Deník", "Cíle"]}'),
    ('Basic profil', 'trainer', 299.00, 'Vlastní nabídky, základní viditelnost, kontakt s klienty',
    '{"features": ["Vlastní nabídky", "Základní viditelnost", "Kontakt s klienty"]}'),
    ('Profi profil', 'trainer', 599.00, 'Zvýraznění ve vyhledávání, analytika profilu, přístup k více kontaktům',
    '{"features": ["Zvýraznění ve vyhledávání", "Analytika profilu", "Přístup k více kontaktům", "Vlastní nabídky", "Kontakt s klienty"]}');

-- Insert boosts
INSERT INTO boosts (name, price, description, duration_days) VALUES
    ('Tréninkový plán na míru', 300.00, 'Od trenéra podle osobního cíle uživatele', NULL),
    ('Rychlá konzultace', 250.00, 'Krátký online hovor, tipy na techniku nebo motivaci', NULL),
    ('Zvýraznění profilu', 150.00, 'Zviditelnění ve vyhledávání, větší šance na spojení', 7),
    ('Výzvy s odměnou', 50.00, 'Zapojení do sportovní výzvy, odměny a odznaky', NULL);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION handle_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_subscription_updated
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE PROCEDURE handle_subscription_updated_at(); 