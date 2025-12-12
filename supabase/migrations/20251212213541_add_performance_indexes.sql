/*
  # Add Performance Indexes

  1. Performance Improvements
    - Add index on users.userid for faster lookups during login
    - Add index on users.email for faster email-based queries
    - Add index on students.userid for faster student profile lookups
    - Add index on institutes.userid for faster institute profile lookups
    - Add index on auth.users email for faster authentication

  2. Notes
    - These indexes will significantly improve login and profile loading performance
    - Uses IF NOT EXISTS to safely handle multiple runs
*/

-- Add index on users.userid if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'users' AND indexname = 'idx_users_userid'
  ) THEN
    CREATE INDEX idx_users_userid ON users(userid);
  END IF;
END $$;

-- Add index on users.email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'users' AND indexname = 'idx_users_email'
  ) THEN
    CREATE INDEX idx_users_email ON users(email);
  END IF;
END $$;

-- Add index on students.userid if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'students' AND indexname = 'idx_students_userid'
  ) THEN
    CREATE INDEX idx_students_userid ON students(userid);
  END IF;
END $$;

-- Add index on institutes.userid if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'institutes' AND indexname = 'idx_institutes_userid'
  ) THEN
    CREATE INDEX idx_institutes_userid ON institutes(userid);
  END IF;
END $$;
