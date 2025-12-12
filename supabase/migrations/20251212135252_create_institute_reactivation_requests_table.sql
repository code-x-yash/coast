/*
  # Create Institute Reactivation Requests Table

  ## Purpose
  - Allows expired institutes to request reactivation with updated accreditation details
  - Admins can review and approve/reject reactivation requests
  
  ## New Tables
  1. `institute_reactivation_requests`
    - `request_id` (uuid, primary key)
    - `instid` (uuid, foreign key to institutes)
    - `new_accreditation_no` (text)
    - `new_valid_from` (date)
    - `new_valid_to` (date)
    - `documents` (jsonb, optional supporting documents)
    - `status` (text: pending, approved, rejected)
    - `submitted_at` (timestamptz)
    - `reviewed_at` (timestamptz, optional)
    - `reviewer_notes` (text, optional)
    - `created_at` (timestamptz)
  
  ## Security
  - Enable RLS
  - Institutes can insert own requests and read own requests
  - Institutes can update own pending requests
  - Admins can read and update all requests
*/

CREATE TABLE IF NOT EXISTS institute_reactivation_requests (
  request_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instid uuid NOT NULL REFERENCES institutes(instid) ON DELETE CASCADE,
  new_accreditation_no text NOT NULL,
  new_valid_from date NOT NULL,
  new_valid_to date NOT NULL,
  documents jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewer_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE institute_reactivation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institutes can insert own reactivation requests"
  ON institute_reactivation_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = institute_reactivation_requests.instid
      AND institutes.userid = auth.uid()
    )
  );

CREATE POLICY "Institutes can read own reactivation requests"
  ON institute_reactivation_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = institute_reactivation_requests.instid
      AND institutes.userid = auth.uid()
    )
  );

CREATE POLICY "Institutes can update own pending requests"
  ON institute_reactivation_requests FOR UPDATE
  TO authenticated
  USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = institute_reactivation_requests.instid
      AND institutes.userid = auth.uid()
    )
  )
  WITH CHECK (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = institute_reactivation_requests.instid
      AND institutes.userid = auth.uid()
    )
  );

CREATE POLICY "Admins can read all reactivation requests"
  ON institute_reactivation_requests FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all reactivation requests"
  ON institute_reactivation_requests FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
