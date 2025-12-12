/*
  # Update Institute Policies for Re-registration Support

  ## Purpose
  Enable rejected institutes to resubmit their applications while maintaining security

  ## Changes
  1. Update admin policies to use is_admin() helper
  2. Refine institute update policy to:
     - Allow rejected institutes to update their info and resubmit
     - Automatically reset verified_status to 'pending' on resubmission
     - Prevent institutes from directly changing their verified_status
  3. Add trigger to handle re-registration workflow

  ## Security
  - Institutes cannot set their own verified_status to 'verified'
  - Only admins can approve/reject institutes
  - Rejected institutes can update info which auto-resets status to 'pending'
*/

-- Drop old admin policies
DROP POLICY IF EXISTS "Admins can view all institutes" ON institutes;
DROP POLICY IF EXISTS "Admins can update institutes" ON institutes;

-- Create new admin policies using is_admin()
CREATE POLICY "Admins can view all institutes"
  ON institutes FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update institutes"
  ON institutes FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Drop the old institute update policy
DROP POLICY IF EXISTS "Institutes can update own profile" ON institutes;

-- Create refined policy for institute updates
-- Institutes can update their own data, but verified_status changes are controlled
CREATE POLICY "Institutes can update own profile"
  ON institutes FOR UPDATE
  TO authenticated
  USING (
    userid = auth.uid() AND
    verified_status IN ('pending', 'rejected')
  )
  WITH CHECK (
    userid = auth.uid() AND
    (
      -- Allow update if status stays the same
      verified_status = (SELECT verified_status FROM institutes WHERE instid = institutes.instid)
      OR
      -- Allow changing from rejected to pending (resubmission)
      (
        verified_status = 'pending' AND
        (SELECT verified_status FROM institutes WHERE instid = institutes.instid) = 'rejected'
      )
    )
  );

-- Create function to handle re-registration
CREATE OR REPLACE FUNCTION handle_institute_reregistration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If institute is rejected and is being updated (but not by admin)
  IF OLD.verified_status = 'rejected' AND NEW.verified_status = 'rejected' THEN
    -- Check if this is not an admin making the change
    IF NOT is_admin() THEN
      -- Reset status to pending for resubmission
      NEW.verified_status := 'pending';
      NEW.rejection_reason := NULL;
      NEW.rejected_by := NULL;
    END IF;
  END IF;

  -- If admin is rejecting an institute
  IF NEW.verified_status = 'rejected' AND OLD.verified_status != 'rejected' THEN
    IF is_admin() THEN
      NEW.rejection_count := COALESCE(OLD.rejection_count, 0) + 1;
      NEW.last_rejection_date := now();
      NEW.rejected_by := auth.uid();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for re-registration handling
DROP TRIGGER IF EXISTS institute_reregistration_trigger ON institutes;
CREATE TRIGGER institute_reregistration_trigger
  BEFORE UPDATE ON institutes
  FOR EACH ROW
  EXECUTE FUNCTION handle_institute_reregistration();

-- Add helper function for institutes to check their approval status
CREATE OR REPLACE FUNCTION get_institute_approval_summary(p_instid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user owns this institute or is admin
  IF NOT (
    EXISTS (
      SELECT 1 FROM institutes 
      WHERE instid = p_instid 
      AND userid = auth.uid()
    ) OR is_admin()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'institute_status', i.verified_status,
    'rejection_reason', i.rejection_reason,
    'rejection_count', COALESCE(i.rejection_count, 0),
    'total_courses_applied', COUNT(ica.application_id),
    'courses_approved', COUNT(ica.application_id) FILTER (WHERE ica.status = 'approved'),
    'courses_pending', COUNT(ica.application_id) FILTER (WHERE ica.status = 'pending'),
    'courses_rejected', COUNT(ica.application_id) FILTER (WHERE ica.status = 'rejected'),
    'commission_percent', ic.default_commission_percent
  ) INTO result
  FROM institutes i
  LEFT JOIN institute_course_applications ica ON ica.instid = i.instid
  LEFT JOIN institute_commissions ic ON ic.instid = i.instid
  WHERE i.instid = p_instid
  GROUP BY i.instid, i.verified_status, i.rejection_reason, i.rejection_count, ic.default_commission_percent;

  RETURN result;
END;
$$;

-- Create index for rejection tracking
CREATE INDEX IF NOT EXISTS idx_institutes_verified_status ON institutes(verified_status);
CREATE INDEX IF NOT EXISTS idx_institutes_rejection_date ON institutes(last_rejection_date);

COMMENT ON FUNCTION handle_institute_reregistration() IS 
'Automatically handles institute re-registration workflow. When a rejected institute updates their info, status resets to pending for admin review';

COMMENT ON FUNCTION get_institute_approval_summary(UUID) IS 
'Returns comprehensive approval status for an institute including course approvals and commission settings';
