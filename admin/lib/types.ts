// Database Types
export interface Admin {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
}

export interface Client {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  company?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientNote {
  id: number;
  project_id: number;
  client_id: number;
  note: string;
  created_at: string;
}

export interface Project {
  id: number;
  client_id?: number;
  client_name: string;
  client_email: string;
  client_phone?: string;
  project_name: string;
  project_description?: string;
  project_type?: string;
  budget?: number;
  status: 'pending' | 'in-progress' | 'review' | 'completed' | 'on-hold' ;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectStatusHistory {
  id: number;
  project_id: number;
  status: string;
  notes?: string;
  changed_at: string;
}

export interface SoftwarePin {
  id: number;
  pin: string;
  is_used: boolean;
  used_at: string | null;
  used_by_ip: string | null;
  created_at: string;
  created_by: number | null;
  notes: string | null;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  project_id?: number;
  project_name?: string;
  client_id?: number;
  client_name: string;
  client_email: string;
  client_phone?: string;
  payment_reference?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  invoice_date: string;
  due_date?: string;
  paid_date?: string;
  notes?: string;
  payment_terms?: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  billing_address?: string;
  pdf_generated: boolean;
  pdf_url?: string;
}

export interface InvoicePayment {
  id: number;
  invoice_id: number;
  amount: number;
  payment_date: string;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
}

// Form Types
export interface ProjectFormData {
  client_name: string;
  client_email: string;
  client_phone?: string;
  project_name: string;
  project_description?: string;
  project_type?: string;
  budget?: number;
  status: string;
  start_date?: string;
  end_date?: string;
}

export interface InvoiceFormData {
  project_id?: number;
  client_id?: number;
  client_name: string;
  client_email: string;
  client_phone?: string;
  payment_reference?: string;
  items: InvoiceItem[];
  discount?: number;
  tax?: number;
  amount_due?: number;
  invoice_date: string;
  due_date?: string;
  notes?: string;
  payment_terms?: string;
  billing_address?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}
