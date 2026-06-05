-- Add payment_reference column to invoices table
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN invoices.payment_reference IS 'Payment reference for the client to use when making payment';
