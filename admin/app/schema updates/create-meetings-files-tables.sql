-- Meetings and Files Tables for VOID Tech Solutions
-- Run this in Supabase SQL Editor

-- Project Meetings Table
CREATE TABLE IF NOT EXISTS project_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  meeting_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_link VARCHAR(500), -- Zoom, Google Meet, etc.
  meeting_type VARCHAR(50) DEFAULT 'online', -- online, in-person, phone
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled
  meeting_minutes TEXT,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project Files Table
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50), -- invoice, document, image, client-upload, etc.
  file_size BIGINT, -- in bytes
  uploaded_by VARCHAR(50) NOT NULL, -- 'admin' or 'client'
  uploaded_by_id UUID, -- admin id or client id
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_meetings_project_id ON project_meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_project_meetings_meeting_date ON project_meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_project_meetings_status ON project_meetings(status);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_file_type ON project_files(file_type);

-- Disable RLS for API access (consistent with other tables)
ALTER TABLE project_meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_files DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON project_meetings TO anon, authenticated;
GRANT ALL ON project_files TO anon, authenticated;

-- Useful queries for later:
-- View upcoming meetings: SELECT * FROM project_meetings WHERE meeting_date > NOW() AND status = 'scheduled' ORDER BY meeting_date ASC;
-- View project files: SELECT * FROM project_files WHERE project_id = ? ORDER BY created_at DESC;
-- View meeting history: SELECT * FROM project_meetings WHERE project_id = ? ORDER BY meeting_date DESC;
