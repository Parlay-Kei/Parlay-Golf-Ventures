-- Create user role enum
CREATE TYPE user_role AS ENUM ('member', 'mentor', 'admin');

-- Add role and verification columns to auth.users
ALTER TABLE auth.users
ADD COLUMN role user_role DEFAULT 'member',
ADD COLUMN is_verified BOOLEAN DEFAULT false,
ADD COLUMN verification_token TEXT,
ADD COLUMN verification_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Create function to check if user is a mentor
CREATE OR REPLACE FUNCTION is_mentor(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = user_id AND role = 'mentor' AND is_verified = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to auto-approve mentor contributions
CREATE OR REPLACE FUNCTION auto_approve_mentor_contributions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contributor_type = 'mentor' AND is_mentor(NEW.contributor_id) THEN
    NEW.status := 'approved';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-approval
CREATE TRIGGER auto_approve_mentor_contributions_trigger
  BEFORE INSERT ON contributions
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_mentor_contributions();

-- Create policy for mentors to update any contribution status
CREATE POLICY "Mentors can update any contribution status"
  ON contributions FOR UPDATE
  USING (is_mentor(auth.uid()));

-- Create policy for admins to perform any operation
CREATE POLICY "Admins can perform any operation"
  ON contributions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM auth.users
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 