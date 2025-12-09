/*
  # Row Level Security Policies
  
  ## Security Implementation
  Enables RLS on all tables and creates role-based access policies
  
  ## Policy Strategy
  - Super Admin: Full access to all data
  - Institute: Access to own profile, courses, batches, and enrolled students
  - Student: Access to own profile, bookings, and certificates
  - Public: Read access to verified institutes and active courses
*/

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = userid);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = userid)
  WITH CHECK (auth.uid() = userid);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.userid = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Institutes policies
CREATE POLICY "Institutes can read own data"
  ON institutes FOR SELECT
  TO authenticated
  USING (userid = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE users.userid = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Institutes can update own data"
  ON institutes FOR UPDATE
  TO authenticated
  USING (userid = auth.uid())
  WITH CHECK (userid = auth.uid());

CREATE POLICY "Admins can manage all institutes"
  ON institutes FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.userid = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Students can read verified institutes"
  ON institutes FOR SELECT
  TO authenticated
  USING (verified_status = 'verified');

-- Courses policies
CREATE POLICY "Anyone can read active courses"
  ON courses FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Institutes can manage own courses"
  ON courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM institutes
      WHERE institutes.instid = courses.instid
      AND institutes.userid = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all courses"
  ON courses FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.userid = auth.uid() AND users.role = 'admin'
  ));

-- Batches policies
CREATE POLICY "Anyone can read active batches"
  ON batches FOR SELECT
  TO authenticated
  USING (batch_status IN ('upcoming', 'ongoing'));

CREATE POLICY "Institutes can manage own batches"
  ON batches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      JOIN institutes ON institutes.instid = courses.instid
      WHERE courses.courseid = batches.courseid
      AND institutes.userid = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all batches"
  ON batches FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.userid = auth.uid() AND users.role = 'admin'
  ));

-- Students policies
CREATE POLICY "Students can read own data"
  ON students FOR SELECT
  TO authenticated
  USING (userid = auth.uid());

CREATE POLICY "Students can update own data"
  ON students FOR UPDATE
  TO authenticated
  USING (userid = auth.uid())
  WITH CHECK (userid = auth.uid());

CREATE POLICY "Admins can read all students"
  ON students FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.userid = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Institutes can read enrolled students"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      JOIN batches ON batches.batchid = bookings.batchid
      JOIN courses ON courses.courseid = batches.courseid
      JOIN institutes ON institutes.instid = courses.instid
      WHERE bookings.studid = students.studid
      AND institutes.userid = auth.uid()
    )
  );

-- Bookings policies
CREATE POLICY "Students can read own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.studid = bookings.studid
      AND students.userid = auth.uid()
    )
  );

CREATE POLICY "Students can create own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.studid = bookings.studid
      AND students.userid = auth.uid()
    )
  );

CREATE POLICY "Institutes can read own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM batches
      JOIN courses ON courses.courseid = batches.courseid
      JOIN institutes ON institutes.instid = courses.instid
      WHERE batches.batchid = bookings.batchid
      AND institutes.userid = auth.uid()
    )
  );

CREATE POLICY "Institutes can update booking status"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM batches
      JOIN courses ON courses.courseid = batches.courseid
      JOIN institutes ON institutes.instid = courses.instid
      WHERE batches.batchid = bookings.batchid
      AND institutes.userid = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM batches
      JOIN courses ON courses.courseid = batches.courseid
      JOIN institutes ON institutes.instid = courses.instid
      WHERE batches.batchid = bookings.batchid
      AND institutes.userid = auth.uid()
    )
  );

CREATE POLICY "Admins can read all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.userid = auth.uid() AND users.role = 'admin'
  ));

-- Certificates policies
CREATE POLICY "Students can read own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.studid = certificates.studid
      AND students.userid = auth.uid()
    )
  );

CREATE POLICY "Institutes can manage certificates for own courses"
  ON certificates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      JOIN institutes ON institutes.instid = courses.instid
      WHERE courses.courseid = certificates.courseid
      AND institutes.userid = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all certificates"
  ON certificates FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.userid = auth.uid() AND users.role = 'admin'
  ));

-- Payments policies
CREATE POLICY "Students can read own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      JOIN students ON students.studid = bookings.studid
      WHERE bookings.bookid = payments.bookid
      AND students.userid = auth.uid()
    )
  );

CREATE POLICY "Institutes can read payments for own courses"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      JOIN batches ON batches.batchid = bookings.batchid
      JOIN courses ON courses.courseid = batches.courseid
      JOIN institutes ON institutes.instid = courses.instid
      WHERE bookings.bookid = payments.bookid
      AND institutes.userid = auth.uid()
    )
  );

CREATE POLICY "Admins can read all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.userid = auth.uid() AND users.role = 'admin'
  ));

-- Logs policies
CREATE POLICY "Admins can read all logs"
  ON logs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.userid = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Users can create logs"
  ON logs FOR INSERT
  TO authenticated
  WITH CHECK (actor = auth.uid());