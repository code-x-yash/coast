/*
  # Fix Infinite Recursion in Users Table RLS Policies

  ## Problem
  - The "Admins can read all users" policy was querying the users table to check if the current user is an admin
  - This created infinite recursion: checking if you can read users requires reading users to check your role
  
  ## Solution
  - Create a security definer function that bypasses RLS to check user role
  - Update the admin policy to use this function instead of directly querying the users table
  
  ## Changes
  1. Create a helper function to safely check if a user is an admin
  2. Replace the recursive policy with one using the helper function
  
  ## Security
  - Function uses SECURITY DEFINER to bypass RLS for the role check only
  - Still maintains proper access control through the policy
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can read all users" ON users;

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

-- Recreate the admin policy using the helper function
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (is_admin());
