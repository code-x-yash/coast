/*
  # Add Public Course Visibility for Anonymous Users

  1. Changes
    - Add RLS policies to allow anonymous (unauthenticated) users to view active courses
    - Allow anonymous users to view verified institutes (for course catalog joins)
    - Allow anonymous users to view batches (for course availability information)

  2. Security
    - Only active courses are visible to the public
    - Only verified institutes are visible to the public
    - All batch information is visible (for course availability)
    - Write operations remain restricted to authenticated users

  3. Rationale
    - Homepage and course catalog need to be accessible to visitors without login
    - Marketing pages need to display courses to encourage user registration
    - Institute information is necessary context for course selection
*/

-- Allow anonymous users to view active courses
CREATE POLICY "Public can view active courses"
  ON courses
  FOR SELECT
  TO anon
  USING (status = 'active');

-- Allow anonymous users to view verified institutes
CREATE POLICY "Public can view verified institutes"
  ON institutes
  FOR SELECT
  TO anon
  USING (verified_status = 'verified');

-- Update the existing batches policy to include anonymous users (already exists but ensuring it allows anon)
DROP POLICY IF EXISTS "Anyone can view batches" ON batches;

CREATE POLICY "Anyone can view batches"
  ON batches
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Add comments explaining the policies
COMMENT ON POLICY "Public can view active courses" ON courses IS 
  'Allows unauthenticated users to view active courses on the homepage and course catalog';

COMMENT ON POLICY "Public can view verified institutes" ON institutes IS 
  'Allows unauthenticated users to view verified institute information when browsing courses';

COMMENT ON POLICY "Anyone can view batches" ON batches IS 
  'Allows all users (authenticated and anonymous) to view batch information for course availability';
