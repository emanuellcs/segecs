export interface Student {
  id: string;
  profile_id?: string | null;
  name: string;
  registration?: string | null;
  cpf?: string | null;
  birth_date?: string | null;
  course_id: string;
  guardian_id: string;
  status: "pending" | "interning" | "completed" | "dropped_out";
  created_at: string;
}

export interface Company {
  id: string;
  business_name: string;
  cnpj: string;
  address?: string | null;
  city_id: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  agreement_number?: string | null;
  agreement_validity?: string | null;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  inep?: string | null;
  city_id: string;
  created_at: string;
}

export interface Internship {
  id: string;
  student_id: string;
  vacancy_id: string;
  advisor_id: string;
  supervisor_id: string;
  start_date: string;
  end_date: string;
  total_workload: number;
  daily_workload: number;
  status: "active" | "completed" | "interrupted";
  created_at: string;
}

export interface Supervisor {
  id: string;
  profile_id?: string | null;
  name: string;
  company_id: string;
  position?: string | null;
  education?: string | null;
  created_at: string;
}

export interface Advisor {
  id: string;
  profile_id?: string | null;
  name: string;
  cpf?: string | null;
  school_id: string;
  created_at: string;
}

export interface Frequency {
  id: string;
  internship_id: string;
  date: string;
  performed_hours: number;
  activities: string;
  validated_by_supervisor: boolean;
  validated_by_advisor: boolean;
  created_at: string;
}

export interface Evaluation {
  id: string;
  internship_id: string;
  type: number;
  grade: number;
  comments?: string | null;
  evaluation_date: string;
  created_at: string;
}

export interface SocialProject {
  id: string;
  student_id: string;
  title: string;
  description?: string | null;
  estimated_hours: number;
  execution_date?: string | null;
  status: "planned" | "executed";
  created_at: string;
}

export interface City {
  id: string;
  name: string;
  state: string;
  created_at: string;
}

export interface Level {
  id: string;
  description: string;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  school_id: string;
  level_id: string;
  mandatory_workload: number;
  created_at: string;
}

export interface Guardian {
  id: string;
  name: string;
  cpf?: string | null;
  phone?: string | null;
  created_at: string;
}

export interface Vacancy {
  id: string;
  company_id: string;
  course_id: string;
  title: string;
  description?: string | null;
  quantity: number;
  status: "open" | "filled" | "cancelled";
  created_at: string;
}

export interface Visit {
  id: string;
  internship_id: string;
  visit_date: string;
  type: "in_person" | "remote";
  summary: string;
  observations?: string | null;
  created_at: string;
}
