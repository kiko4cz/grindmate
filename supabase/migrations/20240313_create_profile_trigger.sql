-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username text;
  v_full_name text;
BEGIN
  -- Extract username from email
  v_username := split_part(NEW.email, '@', 1);
  v_full_name := v_username;

  -- Log the attempt
  RAISE NOTICE 'Creating profile for user: %', NEW.id;

  BEGIN
    INSERT INTO public.profiles (
      id,
      username,
      full_name,
      bio,
      birth_date,
      gender,
      location,
      preferred_gender,
      preferred_age_min,
      preferred_age_max,
      preferred_location_radius,
      is_active,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      v_username,
      v_full_name,
      'Nový uživatel GrindMate',
      '1990-01-01',
      'male',
      'Praha',
      ARRAY['female', 'male']::text[],
      18,
      99,
      50,
      true,
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Profile created successfully for user: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error
    RAISE NOTICE 'Error creating profile: %', SQLERRM;
    RAISE;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated; 