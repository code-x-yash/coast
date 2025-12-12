/*
  # Add Course Publishing Restrictions and Commission Auto-fill

  ## Purpose
  Ensure institutes can only publish courses they're approved for and automate commission management

  ## Changes
  1. Add constraint to ensure courses can only be created for approved course applications
  2. Add trigger to auto-fill commission when admin sets global commission
  3. Add helper function to check if institute can publish a specific course
  4. Update RLS policies for courses table

  ## Workflow
  - Institute selects courses during registration → creates applications with selected_at_registration=true
  - Admin sets global commission → auto-fills commission_percent for all pending applications
  - Admin approves individual courses → institute can now publish those courses
  - Institute creates course/batch only for approved applications
  - Verified institutes can apply for more courses later → creates applications with selected_at_registration=false
*/

-- Add function to check if institute can publish a course
CREATE OR REPLACE FUNCTION can_publish_course(
  p_instid UUID,
  p_master_course_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if institute has an approved application for this course
  RETURN EXISTS (
    SELECT 1 
    FROM institute_course_applications ica
    JOIN institutes i ON i.instid = ica.instid
    WHERE ica.instid = p_instid
    AND ica.master_course_id = p_master_course_id
    AND ica.status = 'approved'
    AND i.verified_status = 'verified'
  );
END;
$$;

-- Add trigger function to auto-fill commission when global commission is set
CREATE OR REPLACE FUNCTION auto_fill_commission_from_global()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When global commission is set or updated, auto-fill pending applications
  UPDATE institute_course_applications
  SET commission_percent = NEW.default_commission_percent
  WHERE instid = NEW.instid
  AND status = 'pending'
  AND (commission_percent IS NULL OR commission_percent = 0);

  RETURN NEW;
END;
$$;

-- Create trigger for auto-filling commission
DROP TRIGGER IF EXISTS auto_fill_commission_trigger ON institute_commissions;
CREATE TRIGGER auto_fill_commission_trigger
  AFTER INSERT OR UPDATE OF default_commission_percent ON institute_commissions
  FOR EACH ROW
  EXECUTE FUNCTION auto_fill_commission_from_global();

-- Add trigger to validate course publishing
CREATE OR REPLACE FUNCTION validate_course_publishing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_master_course_id UUID;
  v_is_approved BOOLEAN;
BEGIN
  -- Get master_course_id from the new course
  v_master_course_id := NEW.master_course_id;

  -- Skip validation if no master_course_id (old courses)
  IF v_master_course_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Skip validation for admins
  IF is_admin() THEN
    RETURN NEW;
  END IF;

  -- Check if institute can publish this course
  v_is_approved := can_publish_course(NEW.instid, v_master_course_id);

  IF NOT v_is_approved THEN
    RAISE EXCEPTION 'Cannot publish course: Institute does not have approved application for this course';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for course publishing validation
DROP TRIGGER IF EXISTS validate_course_publishing_trigger ON courses;
CREATE TRIGGER validate_course_publishing_trigger
  BEFORE INSERT OR UPDATE OF master_course_id ON courses
  FOR EACH ROW
  EXECUTE FUNCTION validate_course_publishing();

-- Update courses RLS policies to use is_admin()
DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;
DROP POLICY IF EXISTS "Institutes can view own courses" ON courses;
DROP POLICY IF EXISTS "Institutes can create courses" ON courses;
DROP POLICY IF EXISTS "Institutes can update own courses" ON courses;
DROP POLICY IF EXISTS "Anyone can view active courses" ON courses;

-- Recreate policies
CREATE POLICY "Admins can manage all courses"
  ON courses FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Anyone can view active courses"
  ON courses FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Institutes can view own courses"
  ON courses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = courses.instid
      AND institutes.userid = auth.uid()
    )
  );

CREATE POLICY "Institutes can create approved courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = courses.instid
      AND institutes.userid = auth.uid()
      AND institutes.verified_status = 'verified'
    )
    AND (
      -- Allow if no master_course_id (backward compatibility)
      courses.master_course_id IS NULL
      OR
      -- Allow if institute has approved application
      can_publish_course(courses.instid, courses.master_course_id)
    )
  );

CREATE POLICY "Institutes can update own courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = courses.instid
      AND institutes.userid = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = courses.instid
      AND institutes.userid = auth.uid()
    )
  );

-- Add helper function to get approved courses for an institute
CREATE OR REPLACE FUNCTION get_approved_courses_for_institute(p_instid UUID)
RETURNS TABLE (
  master_course_id UUID,
  course_name TEXT,
  course_code TEXT,
  category TEXT,
  commission_percent DECIMAL,
  approved_at TIMESTAMPTZ,
  application_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check access
  IF NOT (
    EXISTS (
      SELECT 1 FROM institutes 
      WHERE instid = p_instid 
      AND userid = auth.uid()
    ) OR is_admin()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    mc.master_course_id,
    mc.course_name,
    mc.course_code,
    mc.category,
    ica.commission_percent,
    ica.reviewed_at,
    ica.application_id
  FROM institute_course_applications ica
  JOIN master_courses mc ON mc.master_course_id = ica.master_course_id
  WHERE ica.instid = p_instid
  AND ica.status = 'approved'
  ORDER BY mc.course_name;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_instid_status ON courses(instid, status);
CREATE INDEX IF NOT EXISTS idx_applications_instid_status ON institute_course_applications(instid, status);

COMMENT ON FUNCTION can_publish_course(UUID, UUID) IS 
'Checks if an institute has an approved application to publish a specific course';

COMMENT ON FUNCTION auto_fill_commission_from_global() IS 
'Automatically fills commission_percent for pending applications when admin sets global commission';

COMMENT ON FUNCTION validate_course_publishing() IS 
'Validates that institute can only create courses for which they have approved applications';

COMMENT ON FUNCTION get_approved_courses_for_institute(UUID) IS 
'Returns all approved courses that an institute can publish';
