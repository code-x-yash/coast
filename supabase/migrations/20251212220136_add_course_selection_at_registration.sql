/*
  # Add Course Selection Tracking and Re-registration Support

  ## Purpose
  This migration enables tracking of courses selected during institute registration and supports
  the full institute approval workflow including re-registration for rejected institutes.

  ## Changes Made

  ### 1. Institute Course Applications
  - Added `selected_at_registration` boolean to differentiate initial course selections from later applications
  - Courses selected during registration can be individually approved/rejected by admin
  - Admin can set commission for each course, with auto-fill from global commission

  ### 2. Institute Re-registration Support
  - Added `rejection_count` to track number of rejections
  - Added `last_rejection_date` to track when institute was last rejected
  - Added `rejection_reason` to store admin's rejection notes
  - Rejected institutes can update their record and resubmit (status changes back to 'pending')

  ### 3. Global Commission Auto-fill
  - Admin sets `default_commission_percent` in `institute_commissions` table
  - This value auto-fills as `commission_percent` for all course applications
  - Admin can override per-course if needed

  ## Workflow

  ### Registration Flow:
  1. Institute registers and selects courses they want to teach
  2. System creates `institute_course_applications` records with `selected_at_registration = true`
  3. Admin reviews institute and all selected courses
  4. Admin sets global commission in `institute_commissions`
  5. Admin approves/rejects individual courses in `institute_course_applications`
  6. Admin approves/rejects the institute in `institutes.verified_status`

  ### Re-registration Flow (for rejected institutes):
  1. Institute updates their information
  2. Institute can modify course selections
  3. Status changes back to 'pending'
  4. Admin reviews again

  ### Additional Course Application (for verified institutes):
  1. Verified institute applies for more courses
  2. System creates new `institute_course_applications` with `selected_at_registration = false`
  3. Admin reviews and approves/rejects new course applications

  ## Security
  - All tables maintain RLS policies
  - Institutes can only modify their own pending applications
  - Only admins can approve/reject
*/

-- Add new columns to institute_course_applications
DO $$
BEGIN
  -- Track if course was selected during initial registration vs. later application
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'institute_course_applications' AND column_name = 'selected_at_registration'
  ) THEN
    ALTER TABLE institute_course_applications 
    ADD COLUMN selected_at_registration BOOLEAN DEFAULT false;
  END IF;

  -- Add notes field for additional context
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'institute_course_applications' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE institute_course_applications 
    ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

-- Add re-registration support to institutes table
DO $$
BEGIN
  -- Track number of times institute was rejected
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'institutes' AND column_name = 'rejection_count'
  ) THEN
    ALTER TABLE institutes 
    ADD COLUMN rejection_count INTEGER DEFAULT 0;
  END IF;

  -- Track last rejection date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'institutes' AND column_name = 'last_rejection_date'
  ) THEN
    ALTER TABLE institutes 
    ADD COLUMN last_rejection_date TIMESTAMPTZ;
  END IF;

  -- Store rejection reason from admin
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'institutes' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE institutes 
    ADD COLUMN rejection_reason TEXT;
  END IF;

  -- Track who rejected the institute
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'institutes' AND column_name = 'rejected_by'
  ) THEN
    ALTER TABLE institutes 
    ADD COLUMN rejected_by UUID REFERENCES users(userid);
  END IF;
END $$;

-- Update RLS policies to use is_admin() helper function
-- Drop old policies that don't use is_admin()
DROP POLICY IF EXISTS "Admins can manage master courses" ON master_courses;
DROP POLICY IF EXISTS "Admins can view all applications" ON institute_course_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON institute_course_applications;
DROP POLICY IF EXISTS "Admins can view all course documents" ON course_documents;
DROP POLICY IF EXISTS "Admins can manage commissions" ON institute_commissions;
DROP POLICY IF EXISTS "Admins can view all institute documents" ON institute_documents;

-- Recreate policies using is_admin() helper
CREATE POLICY "Admins can manage master courses"
  ON master_courses FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can view all applications"
  ON institute_course_applications FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update applications"
  ON institute_course_applications FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can view all course documents"
  ON course_documents FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can manage commissions"
  ON institute_commissions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can view all institute documents"
  ON institute_documents FOR SELECT
  TO authenticated
  USING (is_admin());

-- Allow institutes to update their own pending applications
CREATE POLICY "Institutes can update their pending applications"
  ON institute_course_applications FOR UPDATE
  TO authenticated
  USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = institute_course_applications.instid
      AND institutes.userid = auth.uid()
    )
  )
  WITH CHECK (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = institute_course_applications.instid
      AND institutes.userid = auth.uid()
    )
  );

-- Add index for faster queries on registration selections
CREATE INDEX IF NOT EXISTS idx_applications_selected_at_reg 
ON institute_course_applications(instid, selected_at_registration);

-- Add index for commission lookups
CREATE INDEX IF NOT EXISTS idx_applications_master_course 
ON institute_course_applications(master_course_id);

-- Add comment to document the workflow
COMMENT ON COLUMN institute_course_applications.selected_at_registration IS 
'TRUE if course was selected during initial institute registration, FALSE if applied for later';

COMMENT ON COLUMN institute_course_applications.commission_percent IS 
'Commission percentage for this specific course. Auto-filled from institute_commissions.default_commission_percent';

COMMENT ON COLUMN institutes.rejection_count IS 
'Number of times this institute registration has been rejected. Allows tracking re-registration attempts';

COMMENT ON COLUMN institutes.rejection_reason IS 
'Admin notes explaining why the institute was rejected. Visible to institute for corrections';
