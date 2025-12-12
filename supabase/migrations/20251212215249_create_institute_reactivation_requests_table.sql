/*
  # Create Institute Reactivation Requests Table

  ## Purpose
  - Allows expired institutes to request reactivation with updated accreditation details
  - Admins can review and approve/reject reactivation requests
  
  ## New Tables
  1. `institute_reactivation_requests`
    - `requestid` (uuid, primary key)
    - `instid` (uuid, foreign key to institutes)
    - `accreditation_no` (text)
    - `valid_from` (date)
    - `valid_to` (date)
    - `contact_email` (text, optional)
    - `contact_phone` (text, optional)
    - `address` (text, optional)
    - `city` (text, optional)
    - `state` (text, optional)
    - `reason` (text, optional)
    - `documents` (jsonb, optional supporting documents)
    - `status` (text: pending, approved, rejected)
    - `submitted_at` (timestamptz)
    - `reviewed_at` (timestamptz, optional)
    - `reviewer_notes` (text, optional)
  
  ## Security
  - Enable RLS
  - Institutes can insert own requests and read own requests
  - Institutes can update own pending requests
  - Admins can read and update all requests
*/

CREATE TABLE IF NOT EXISTS institute_reactivation_requests (
  requestid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instid uuid NOT NULL REFERENCES institutes(instid) ON DELETE CASCADE,
  accreditation_no text NOT NULL,
  valid_from date NOT NULL,
  valid_to date NOT NULL,
  contact_email text,
  contact_phone text,
  address text,
  city text,
  state text,
  reason text,
  documents jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewer_notes text
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
