/*
  # Maritime Training Platform Schema - Tables Only
  
  ## Overview
  Complete database schema for the maritime training course aggregator platform.
  This migration creates all tables first, then policies will be added separately.
  
  ## Tables Created
  1. users - Core authentication and user management
  2. institutes - Training institute profiles and accreditation
  3. courses - Maritime training courses
  4. batches - Scheduled course batches with seat management
  5. students - Seafarer profiles with maritime credentials
  6. bookings - Course booking records
  7. certificates - Digital certificates issued upon completion
  8. payments - Payment transaction records
  9. logs - System audit trail
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  userid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('admin', 'institute', 'student')),
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Institutes table
CREATE TABLE IF NOT EXISTS institutes (
  instid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userid uuid REFERENCES users(userid) ON DELETE CASCADE,
  name text NOT NULL,
  accreditation_no text UNIQUE NOT NULL,
  valid_from date NOT NULL,
  valid_to date NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  address text,
  city text,
  state text,
  verified_status text DEFAULT 'pending' CHECK (verified_status IN ('pending', 'verified', 'rejected')),
  documents jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  courseid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instid uuid REFERENCES institutes(instid) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('STCW', 'Refresher', 'Technical', 'Other')),
  duration text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('offline', 'online', 'hybrid')),
  fees decimal(10,2) NOT NULL,
  description text,
  start_date date,
  end_date date,
  validity_months integer DEFAULT 60,
  accreditation_ref text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at timestamptz DEFAULT now()
);

-- Batches table
CREATE TABLE IF NOT EXISTS batches (
  batchid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  courseid uuid REFERENCES courses(courseid) ON DELETE CASCADE,
  batch_name text NOT NULL,
  seats_total integer NOT NULL DEFAULT 30,
  seats_booked integer DEFAULT 0,
  trainer text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  location text,
  batch_status text DEFAULT 'upcoming' CHECK (batch_status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  studid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userid uuid REFERENCES users(userid) ON DELETE CASCADE,
  dgshipping_id text UNIQUE,
  rank text,
  coc_number text,
  date_of_birth date,
  nationality text DEFAULT 'Indian',
  profile_image text,
  created_at timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  bookid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studid uuid REFERENCES students(studid) ON DELETE CASCADE,
  batchid uuid REFERENCES batches(batchid) ON DELETE CASCADE,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  booking_date timestamptz DEFAULT now(),
  amount decimal(10,2) NOT NULL,
  confirmation_number text UNIQUE,
  attendance_status text DEFAULT 'not_started' CHECK (attendance_status IN ('not_started', 'attending', 'completed', 'absent')),
  completion_status text DEFAULT 'incomplete' CHECK (completion_status IN ('incomplete', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  certid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studid uuid REFERENCES students(studid) ON DELETE CASCADE,
  courseid uuid REFERENCES courses(courseid) ON DELETE CASCADE,
  batchid uuid REFERENCES batches(batchid) ON DELETE CASCADE,
  cert_number text UNIQUE NOT NULL,
  issue_date date DEFAULT CURRENT_DATE,
  expiry_date date NOT NULL,
  dgshipping_uploaded boolean DEFAULT false,
  dgshipping_upload_date date,
  certificate_url text,
  status text DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'revoked')),
  created_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  payid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bookid uuid REFERENCES bookings(bookid) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  method text CHECK (method IN ('wallet', 'card', 'upi', 'netbanking', 'cash')),
  txn_ref text UNIQUE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  payment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Logs table
CREATE TABLE IF NOT EXISTS logs (
  logid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor uuid REFERENCES users(userid),
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  remarks text,
  timestamp timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_institutes_verified_status ON institutes(verified_status);
CREATE INDEX IF NOT EXISTS idx_courses_instid ON courses(instid);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_batches_courseid ON batches(courseid);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(batch_status);
CREATE INDEX IF NOT EXISTS idx_bookings_studid ON bookings(studid);
CREATE INDEX IF NOT EXISTS idx_bookings_batchid ON bookings(batchid);
CREATE INDEX IF NOT EXISTS idx_certificates_studid ON certificates(studid);
CREATE INDEX IF NOT EXISTS idx_certificates_expiry_date ON certificates(expiry_date);
CREATE INDEX IF NOT EXISTS idx_payments_bookid ON payments(bookid);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);