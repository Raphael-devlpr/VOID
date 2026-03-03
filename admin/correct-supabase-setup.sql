-- Drop existing tables if they exist (be careful - this deletes data!)
DROP TABLE IF EXISTS project_status_history CASCADE;
DROP TABLE IF EXISTS software_pins CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- Create admins table
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  start_date DATE,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project status history table
CREATE TABLE project_status_history (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create software PINs table
CREATE TABLE software_pins (
  id SERIAL PRIMARY KEY,
  pin TEXT UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by_ip TEXT,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for projects table
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_pins ENABLE ROW LEVEL SECURITY;

-- Create policies for projects (allow all operations for now)
CREATE POLICY "Enable all access for projects" ON projects FOR ALL USING (true);
CREATE POLICY "Enable all access for history" ON project_status_history FOR ALL USING (true);
CREATE POLICY "Enable all access for pins" ON software_pins FOR ALL USING (true);
CREATE POLICY "Enable all access for admins" ON admins FOR ALL USING (true);

-- Insert default admin
-- Password: 'Admin123!' 
-- Hash generated with: bcrypt.hash('Admin123!', 10)
INSERT INTO admins (email, password_hash, name) 
VALUES (
  'admin@voidtechsolutions.co.za',
  '$2a$10$rKx8YGHWnrQYF1KY1P5y.OGxVFQKjZp8F8VXzPvEX8ypWjJJEKZAi',
  'VOID Admin'
);

-- Verify admin was created
SELECT id, email, name, created_at FROM admins;
