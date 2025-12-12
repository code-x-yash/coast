/*
  # Add Public Institute Visibility for Seafarers

  1. Changes
    - Add RLS policy to allow authenticated users (especially seafarers) to view verified institutes
    - This enables seafarers to see institute details when browsing courses

  2. Security
    - Only verified institutes are visible to public
    - Unverified, pending, or rejected institutes remain private
    - Institute owners and admins retain full access

  3. Rationale
    - Seafarers need to see institute names, locations, and details when browsing courses
    - This information is necessary for making informed booking decisions
*/

-- Add policy to allow viewing verified institutes
CREATE POLICY "Anyone can view verified institutes"
  ON institutes
  FOR SELECT
  TO authenticated
  USING (verified_status = 'verified');

-- Add comment explaining the policy
COMMENT ON POLICY "Anyone can view verified institutes" ON institutes IS 
  'Allows all authenticated users (including seafarers) to view verified institute information when browsing courses';
