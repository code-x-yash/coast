-- Create enums
DO $$ BEGIN
  CREATE TYPE account_status_enum AS ENUM ('active', 'suspended', 'deleted');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type_enum AS ENUM ('email', 'whatsapp', 'sms', 'in_app');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE currency_enum AS ENUM ('INR', 'USD', 'EUR', 'AED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Update users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS account_status account_status_enum DEFAULT 'active';

-- Update institutes table
ALTER TABLE institutes
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS banner_url TEXT,
  ADD COLUMN IF NOT EXISTS customer_care_email TEXT,
  ADD COLUMN IF NOT EXISTS customer_care_phone TEXT,
  ADD COLUMN IF NOT EXISTS admin_contact_person TEXT,
  ADD COLUMN IF NOT EXISTS house_number TEXT,
  ADD COLUMN IF NOT EXISTS street_name TEXT,
  ADD COLUMN IF NOT EXISTS landmark TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS postcode TEXT,
  ADD COLUMN IF NOT EXISTS license_number TEXT,
  ADD COLUMN IF NOT EXISTS issuing_authority TEXT DEFAULT 'DG Shipping';

-- Update students table
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS house_number TEXT,
  ADD COLUMN IF NOT EXISTS street_name TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS postcode TEXT,
  ADD COLUMN IF NOT EXISTS position TEXT,
  ADD COLUMN IF NOT EXISTS education_details TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Update courses table
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS course_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS instructor_name TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS additional_notes TEXT,
  ADD COLUMN IF NOT EXISTS currency currency_enum DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS approval_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(userid);

-- Update batches table
ALTER TABLE batches
  ADD COLUMN IF NOT EXISTS instructor_name TEXT;

-- Update bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS currency currency_enum DEFAULT 'INR';

-- Update payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS currency currency_enum DEFAULT 'INR';

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  cart_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(courseid) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(batchid) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id, batch_id)
);

-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  verification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create phone_verifications table
CREATE TABLE IF NOT EXISTS phone_verifications (
  verification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
  type notification_type_enum NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read_status BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create platform_configuration table
CREATE TABLE IF NOT EXISTS platform_configuration (
  config_key TEXT PRIMARY KEY,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(userid),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default configuration values
INSERT INTO platform_configuration (config_key, config_value, description) VALUES
  ('default_commission_percent', '10', 'Default commission percentage for courses'),
  ('supported_currencies', '["INR", "USD", "EUR", "AED"]', 'List of supported currencies'),
  ('max_file_size_mb', '20', 'Maximum file upload size in MB'),
  ('allowed_file_types', '["pdf", "png", "jpg", "jpeg"]', 'Allowed file types for uploads'),
  ('password_min_length', '8', 'Minimum password length'),
  ('otp_expiry_minutes', '10', 'OTP expiry time in minutes'),
  ('email_verification_expiry_hours', '24', 'Email verification link expiry in hours')
ON CONFLICT (config_key) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_course_id ON cart_items(course_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_status ON notifications(read_status);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_user_id ON phone_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_course_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);

-- Enable RLS on new tables
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_configuration ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cart_items
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can add items to own cart"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove items from own cart"
  ON cart_items FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for email_verifications
CREATE POLICY "Users can view own email verifications"
  ON email_verifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create email verifications"
  ON email_verifications FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "System can update email verifications"
  ON email_verifications FOR UPDATE
  TO authenticated, anon
  USING (true);

-- RLS Policies for phone_verifications
CREATE POLICY "Users can view own phone verifications"
  ON phone_verifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create phone verifications"
  ON phone_verifications FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "System can update phone verifications"
  ON phone_verifications FOR UPDATE
  TO authenticated, anon
  USING (true);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for platform_configuration
CREATE POLICY "Everyone can view configuration"
  ON platform_configuration FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage configuration"
  ON platform_configuration FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.userid = auth.uid()
      AND users.role = 'admin'
    )
  );