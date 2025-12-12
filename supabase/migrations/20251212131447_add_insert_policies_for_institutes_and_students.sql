/*
  # Add INSERT Policies for Institutes and Students Tables

  ## Problem
  - institutes table is missing INSERT policy
  - students table is missing INSERT policy
  - During registration, signup process fails when trying to create profile records
  - This prevents successful registration and login redirects
  
  ## Solution
  - Add INSERT policy for institutes table to allow new institute registration
  - Add INSERT policy for students table to allow new student registration
  
  ## Changes
  1. Add INSERT policy for institutes table
  2. Add INSERT policy for students table
  
  ## Security
  - Policies ensure users can only insert records associated with their own userid
  - Prevents users from creating records for other users
*/

-- Add INSERT policy for institutes table
CREATE POLICY "Institutes can insert own profile during registration"
  ON institutes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = userid);

-- Add INSERT policy for students table  
CREATE POLICY "Students can insert own profile during registration"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = userid);
