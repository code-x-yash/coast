/*
  # Enforce Strict Course Publishing Restrictions

  1. Changes
    - Drop and recreate INSERT policy for courses to ensure only approved courses can be created
    - Drop and recreate UPDATE policy for courses to prevent unauthorized course modifications
    - Add restriction to prevent institutes from publishing unapproved courses
    - Change default status of new courses to 'inactive' instead of 'active'
    - Ensure institutes can only set status to 'active' if they have approval

  2. Security Rules
    - Institutes must be verified before creating any courses
    - If course is linked to a master_course_id, it must have an approved application
    - Institutes cannot change master_course_id on existing courses
    - Institutes cannot set status to 'active' unless they have approval
    - Only admins can bypass these restrictions

  3. Important Notes
    - This prevents institutes from publishing courses without admin approval
    - All course publishing must go through the application approval process
    - Institutes can only create courses for which they have received approval
*/

-- Change default status to inactive for new courses
ALTER TABLE courses 
  ALTER COLUMN status SET DEFAULT 'inactive';

-- Drop existing policies
DROP POLICY IF EXISTS "Institutes can create approved courses" ON courses;
DROP POLICY IF EXISTS "Institutes can update own courses" ON courses;

-- Create new strict INSERT policy
CREATE POLICY "Institutes can create approved courses"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Institute must be verified
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = courses.instid
      AND institutes.userid = auth.uid()
      AND institutes.verified_status = 'verified'
    )
    AND
    -- If master_course_id is provided, must have approved application
    (
      master_course_id IS NULL 
      OR 
      can_publish_course(courses.instid, courses.master_course_id)
    )
    AND
    -- Status can only be 'active' if there's an approved application
    (
      status != 'active'
      OR
      (master_course_id IS NOT NULL AND can_publish_course(courses.instid, courses.master_course_id))
    )
  );

-- Create new strict UPDATE policy
CREATE POLICY "Institutes can update own courses"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (
    -- Must own the institute
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = courses.instid
      AND institutes.userid = auth.uid()
    )
  )
  WITH CHECK (
    -- Must own the institute
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = courses.instid
      AND institutes.userid = auth.uid()
    )
    AND
    -- Cannot change master_course_id to a different value
    (
      master_course_id = (SELECT master_course_id FROM courses WHERE courseid = courses.courseid)
      OR
      master_course_id IS NULL
    )
    AND
    -- Cannot set status to 'active' unless approved
    (
      status != 'active'
      OR
      (master_course_id IS NOT NULL AND can_publish_course(courses.instid, courses.master_course_id))
    )
  );

-- Add comment explaining the restrictions
COMMENT ON POLICY "Institutes can create approved courses" ON courses IS 
  'Institutes can only create courses if they are verified and have admin approval for the specific master course. Courses cannot be set to active without approval.';

COMMENT ON POLICY "Institutes can update own courses" ON courses IS 
  'Institutes can update their own courses but cannot change the master_course_id or set status to active without admin approval.';
