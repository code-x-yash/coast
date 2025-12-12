/*
  # Create is_admin Helper Function

  ## Purpose
  - Provides a safe way to check if the current user is an admin without causing recursion
  - Used by RLS policies throughout the database

  ## Changes
  1. Create security definer function to check admin role
  
  ## Security
  - Function uses SECURITY DEFINER to bypass RLS for the role check only
  - Still maintains proper access control through policies
*/

-- Create a security definer function to check if user is admin without recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE userid = auth.uid()
    AND role = 'admin'
  );
END;
$$;
