-- Add address column to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add comment to the column
COMMENT ON COLUMN clients.address IS 'Client billing address for invoices';
