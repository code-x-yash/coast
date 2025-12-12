/*
  # Fix Master Courses Visibility for Institute Signup

  ## Changes
  - Update RLS policy to allow unauthenticated users (anon role) to view active master courses
  - This enables institutes to see and select courses during the registration process before they have an account

  ## Security
  - Only SELECT access is granted
  - Only active courses are visible
  - No modification permissions for unauthenticated users
*/

DROP POLICY IF EXISTS "Anyone can view active master courses" ON master_courses;

CREATE POLICY "Anyone can view active master courses"
  ON master_courses FOR SELECT
  TO authenticated, anon
  USING (is_active = true);
