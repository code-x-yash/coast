/*
  # Fix Institute Course Applications Insert Policy

  1. Changes
    - Drop the existing restrictive INSERT policy
    - Create a new INSERT policy that allows authenticated users to insert applications
    - The policy will verify that the institute exists and belongs to the authenticated user
    - This fixes the issue during registration when course selections are being saved

  2. Security
    - Still maintains security by checking that the user is authenticated
    - Verifies that the institute being referenced exists
    - Ensures the institute belongs to the user making the insert
*/

DO $$
BEGIN
  -- Drop existing insert policy
  DROP POLICY IF EXISTS "Institutes can create applications" ON institute_course_applications;

  -- Create new insert policy that works during registration
  CREATE POLICY "Institutes can create applications"
    ON institute_course_applications
    FOR INSERT
    TO authenticated
    WITH CHECK (
      -- Allow if institute exists and belongs to the authenticated user
      EXISTS (
        SELECT 1 FROM institutes
        WHERE institutes.instid = institute_course_applications.instid
        AND institutes.userid = auth.uid()
      )
    );
END $$;
