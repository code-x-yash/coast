/*
  # Add Master Courses and Commission System

  ## New Tables Created
  
  1. **master_courses** - Catalog of all available maritime training courses
  2. **institute_course_applications** - Institute applications for specific courses
  3. **course_documents** - Documents uploaded for course applications
  4. **institute_commissions** - Commission settings per institute
  5. **institute_documents** - General institute documents

  ## Modified Tables
  
  - **courses**: Added master_course_id, commission_percent, application_id
  
  ## Security
  - RLS enabled on all new tables
  - Policies for admin, institute, and student access
*/

CREATE TABLE IF NOT EXISTS master_courses (
  master_course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name TEXT NOT NULL,
  course_code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  required_documents JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS institute_course_applications (
  application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instid UUID REFERENCES institutes(instid) ON DELETE CASCADE,
  master_course_id UUID REFERENCES master_courses(master_course_id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  commission_percent DECIMAL(5,2),
  applied_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(userid),
  rejection_reason TEXT
);

CREATE TABLE IF NOT EXISTS course_documents (
  document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES institute_course_applications(application_id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS institute_commissions (
  commission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instid UUID REFERENCES institutes(instid) ON DELETE CASCADE,
  default_commission_percent DECIMAL(5,2) NOT NULL CHECK (default_commission_percent >= 0 AND default_commission_percent <= 100),
  set_by UUID REFERENCES users(userid),
  set_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(instid)
);

CREATE TABLE IF NOT EXISTS institute_documents (
  document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instid UUID REFERENCES institutes(instid) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

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

ALTER TABLE master_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE institute_course_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE institute_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE institute_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active master courses"
  ON master_courses FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage master courses"
  ON master_courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.userid = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Institutes can view their own applications"
  ON institute_course_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = institute_course_applications.instid
      AND institutes.userid = auth.uid()
    )
  );

CREATE POLICY "Institutes can create applications"
  ON institute_course_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = institute_course_applications.instid
      AND institutes.userid = auth.uid()
    )
  );

CREATE POLICY "Admins can view all applications"
  ON institute_course_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.userid = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update applications"
  ON institute_course_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.userid = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Institutes can view their course documents"
  ON course_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM institute_course_applications ica
      JOIN institutes i ON i.instid = ica.instid
      WHERE ica.application_id = course_documents.application_id
      AND i.userid = auth.uid()
    )
  );

CREATE POLICY "Institutes can upload course documents"
  ON course_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM institute_course_applications ica
      JOIN institutes i ON i.instid = ica.instid
      WHERE ica.application_id = course_documents.application_id
      AND i.userid = auth.uid()
    )
  );

CREATE POLICY "Admins can view all course documents"
  ON course_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.userid = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Institutes can view their commission"
  ON institute_commissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = institute_commissions.instid
      AND institutes.userid = auth.uid()
    )
  );

CREATE POLICY "Admins can manage commissions"
  ON institute_commissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.userid = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Institutes can view their documents"
  ON institute_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = institute_documents.instid
      AND institutes.userid = auth.uid()
    )
  );

CREATE POLICY "Institutes can upload their documents"
  ON institute_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = institute_documents.instid
      AND institutes.userid = auth.uid()
    )
  );

CREATE POLICY "Admins can view all institute documents"
  ON institute_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.userid = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_master_courses_category ON master_courses(category);
CREATE INDEX IF NOT EXISTS idx_master_courses_active ON master_courses(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_instid ON institute_course_applications(instid);
CREATE INDEX IF NOT EXISTS idx_applications_status ON institute_course_applications(status);
CREATE INDEX IF NOT EXISTS idx_course_docs_application ON course_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_institute_docs_instid ON institute_documents(instid);
CREATE INDEX IF NOT EXISTS idx_commissions_instid ON institute_commissions(instid);

INSERT INTO master_courses (course_name, course_code, category, description, required_documents) VALUES
('Basic Safety Training (BST)', 'STCW-VI/1', 'STCW', 'Mandatory basic safety training for all seafarers', '["Accreditation Certificate", "Trainer Certification", "Facility Photos"]'),
('Advanced Fire Fighting', 'STCW-VI/3', 'STCW', 'Advanced training in firefighting techniques', '["Accreditation Certificate", "Fire Fighting Equipment List", "Facility Photos"]'),
('Medical First Aid', 'STCW-VI/4-1', 'STCW', 'First aid and medical care training', '["Accreditation Certificate", "Medical Equipment List", "Trainer Medical Certification"]'),
('ARPA (Automatic Radar Plotting Aid)', 'STCW-II/1-ARPA', 'Navigation', 'Radar navigation and plotting', '["Accreditation Certificate", "ARPA Simulator Certification", "Equipment Photos"]'),
('ECDIS (Electronic Chart Display)', 'STCW-II/1-ECDIS', 'Navigation', 'Electronic chart navigation systems', '["Accreditation Certificate", "ECDIS System Certification", "Software License"]'),
('GMDSS (Global Maritime Distress)', 'STCW-IV/2', 'Radio', 'Maritime radio communication', '["Accreditation Certificate", "Radio Equipment List", "Trainer Certification"]'),
('Bridge Resource Management', 'STCW-II/1-BRM', 'Management', 'Bridge team management and operations', '["Accreditation Certificate", "Trainer Certification", "Course Curriculum"]'),
('Engine Resource Management', 'STCW-III/1-ERM', 'Management', 'Engine room team management', '["Accreditation Certificate", "Trainer Certification", "Course Curriculum"]'),
('Tanker Familiarization', 'STCW-V/1-1', 'Specialized', 'Basic tanker operations', '["Accreditation Certificate", "Tanker Training Facility Certificate"]'),
('Advanced Tanker Training (Oil)', 'STCW-V/1-1-ADV', 'Specialized', 'Advanced oil tanker operations', '["Accreditation Certificate", "Advanced Tanker Facility", "Simulator Certification"]'),
('Chemical Tanker Training', 'STCW-V/1-2-CHEM', 'Specialized', 'Chemical tanker operations', '["Accreditation Certificate", "Chemical Handling Certification", "Safety Equipment List"]'),
('LNG Tanker Training', 'STCW-V/1-2-LNG', 'Specialized', 'Liquefied Natural Gas tanker operations', '["Accreditation Certificate", "LNG Training Facility", "Specialized Equipment"]'),
('Ship Security Officer (SSO)', 'STCW-VI/5-SSO', 'Security', 'Ship security management', '["Accreditation Certificate", "Security Training Facility", "Trainer Certification"]'),
('Company Security Officer (CSO)', 'ISPS-CSO', 'Security', 'Company-level security management', '["Accreditation Certificate", "Security Expertise Certificate", "Course Material"]'),
('Crowd Management', 'STCW-V/2', 'Passenger Ships', 'Managing passengers in emergencies', '["Accreditation Certificate", "Training Facility Photos", "Course Curriculum"]')
ON CONFLICT (course_code) DO NOTHING;
