/*
  # Enable RLS on remaining tables
  
  1. Changes
    - Enable Row Level Security on cart_items
    - Enable Row Level Security on email_verifications
    - Enable Row Level Security on master_courses
    - Enable Row Level Security on notifications
    - Enable Row Level Security on phone_verifications
  
  2. Security
    - All these tables have RLS policies already defined
    - Enabling RLS will activate these policies
*/

-- Enable RLS on all remaining tables
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;
