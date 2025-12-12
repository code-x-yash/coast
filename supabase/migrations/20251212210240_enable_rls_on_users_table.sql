/*
  # Enable RLS on users table
  
  1. Changes
    - Enable Row Level Security on the users table
    - This is critical for the application to work properly
  
  2. Security
    - RLS policies already exist for the users table
    - Enabling RLS will activate these policies and secure the table
*/

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
