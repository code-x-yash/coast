/*
  # Add INSERT Policy for Users Table

  ## Problem
  - Users table has SELECT and UPDATE policies but no INSERT policy
  - During signup, authService.signUp tries to insert into users table but fails due to RLS
  - This prevents user profiles from being created, causing login redirects to fail
  
  ## Solution
  - Add INSERT policy to allow authenticated users to create their own user record
  - This enables successful signup and proper role-based redirects
  
  ## Changes
  1. Add INSERT policy for users table
  
  ## Security
  - Policy ensures users can only insert a record with their own auth.uid()
  - Prevents users from creating records for other users
*/

-- Add INSERT policy for users table
CREATE POLICY "Users can insert own profile during signup"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = userid);
