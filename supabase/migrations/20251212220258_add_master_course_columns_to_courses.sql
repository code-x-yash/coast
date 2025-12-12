/*
  # Add Master Course Tracking Columns to Courses Table

  ## Purpose
  Link courses to master course catalog and track commission and application

  ## Changes
  Add columns to courses table:
  - master_course_id: Links to master_courses table
  - commission_percent: Commission for this specific course instance
  - application_id: Links to the approved application
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'master_course_id'
  ) THEN
    ALTER TABLE courses ADD COLUMN master_course_id UUID REFERENCES master_courses(master_course_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'commission_percent'
  ) THEN
    ALTER TABLE courses ADD COLUMN commission_percent DECIMAL(5,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'application_id'
  ) THEN
    ALTER TABLE courses ADD COLUMN application_id UUID REFERENCES institute_course_applications(application_id);
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_courses_master_course ON courses(master_course_id);
CREATE INDEX IF NOT EXISTS idx_courses_application ON courses(application_id);
