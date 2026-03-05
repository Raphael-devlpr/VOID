-- Software PINs Table for VOID Tech Solutions
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS software_pins (
  id SERIAL PRIMARY KEY,
  pin VARCHAR(20) NOT NULL UNIQUE,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  used_by_ip VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES admins(id),
  notes TEXT
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_software_pins_pin ON software_pins(pin);
CREATE INDEX IF NOT EXISTS idx_software_pins_is_used ON software_pins(is_used);

-- Disable RLS for API access (consistent with other tables)
ALTER TABLE software_pins DISABLE ROW LEVEL SECURITY;

-- Add notes column if it doesn't exist (for existing tables)
ALTER TABLE software_pins ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE software_pins ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES admins(id);



-- Grant permissions
GRANT ALL ON software_pins TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE software_pins_id_seq TO anon, authenticated;

-- Useful queries for later:
-- View all active PINs: SELECT * FROM software_pins WHERE is_used = FALSE ORDER BY created_at DESC;
-- View used PINs: SELECT * FROM software_pins WHERE is_used = TRUE ORDER BY used_at DESC;
-- Count stats: SELECT is_used, COUNT(*) FROM software_pins GROUP BY is_used;
