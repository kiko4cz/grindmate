-- Create a function to safely delete users and all their related data
CREATE OR REPLACE FUNCTION public.delete_user(user_id UUID)
RETURNS void AS $$
BEGIN
  -- Delete related records first (with error handling for non-existent tables)
  BEGIN
    DELETE FROM public.goals WHERE user_id = user_id;
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, continue
  END;

  BEGIN
    DELETE FROM public.workouts WHERE user_id = user_id;
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, continue
  END;

  BEGIN
    DELETE FROM public.matches WHERE user_id = user_id OR matched_user_id = user_id;
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, continue
  END;

  BEGIN
    DELETE FROM public.messages WHERE sender_id = user_id OR receiver_id = user_id;
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, continue
  END;

  BEGIN
    DELETE FROM public.notifications WHERE user_id = user_id;
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, continue
  END;

  BEGIN
    DELETE FROM public.profiles WHERE id = user_id;
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, continue
  END;
  
  -- Finally delete the user
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user TO authenticated; 