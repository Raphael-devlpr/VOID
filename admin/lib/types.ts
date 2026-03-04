// Database Types
export interface Admin {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
}

export interface Client {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  company?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientNote {
  id: string;
  project_id: string;
  client_id: string;
  note: string;
  created_at: string;
}

export interface Project {
  id: string;
  client_id?: string;
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
  id: string;
  project_id: string;
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

export interface LoginFormData {
  email: string;
  password: string;
}
