// ============================================================
// Domain Types — JobSeeker Pro
// ============================================================

// --- User & Auth ---
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  target_role?: string;
  target_locations?: string[];
  experience_years?: number;
  skills?: string[];
  created_at: string;
  updated_at: string;
}

// --- Resume ---
export type ResumeStatus = 'uploaded' | 'parsing' | 'parsed' | 'error';

export interface Resume {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  raw_text: string;
  parsed_data?: ParsedResume;
  status: ResumeStatus;
  version_label?: string; // e.g., "SWE - FAANG", "ML Engineer - Startup"
  created_at: string;
}

export interface ParsedResume {
  contact: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications?: string[];
}

export interface WorkExperience {
  company: string;
  title: string;
  location?: string;
  start_date: string;
  end_date?: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduation_date?: string;
  gpa?: string;
}

// --- ATS Analysis ---
export interface ATSAnalysis {
  id: string;
  resume_id: string;
  job_description: string;
  job_title?: string;
  company?: string;
  overall_score: number; // 0-100
  keyword_match: KeywordMatch;
  section_scores: SectionScore[];
  suggestions: ATSSuggestion[];
  created_at: string;
}

export interface KeywordMatch {
  matched: string[];
  missing: string[];
  match_percentage: number;
}

export interface SectionScore {
  section: string;
  score: number;
  feedback: string;
}

export interface ATSSuggestion {
  type: 'critical' | 'important' | 'nice_to_have';
  category: 'keywords' | 'formatting' | 'content' | 'impact';
  message: string;
  original?: string;
  suggested?: string;
}

// --- Jobs ---
export interface Job {
  id: string;
  external_id?: string;
  title: string;
  company: string;
  location: string;
  remote_type?: 'remote' | 'hybrid' | 'onsite';
  description: string;
  salary_min?: number;
  salary_max?: number;
  posted_date: string;
  source_url: string;
  source: string; // jsearch, linkedin, etc.
  match_score?: number;
  saved: boolean;
}

export interface JobSearchFilters {
  query: string;
  location?: string;
  remote_only?: boolean;
  salary_min?: number;
  date_posted?: 'today' | '3days' | 'week' | 'month';
  employment_type?: 'fulltime' | 'contract' | 'parttime';
  page?: number;
}

// --- Application Tracker ---
export type ApplicationStage =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: string;
  user_id: string;
  job: Job;
  resume_id?: string;
  stage: ApplicationStage;
  applied_date?: string;
  notes: ApplicationNote[];
  follow_up_date?: string;
  salary_offered?: number;
  contacts?: Contact[];
  created_at: string;
  updated_at: string;
}

export interface ApplicationNote {
  id: string;
  content: string;
  created_at: string;
}

export interface Contact {
  name: string;
  role?: string;
  email?: string;
  linkedin?: string;
}

// --- Dashboard Stats ---
export interface DashboardStats {
  total_applications: number;
  applications_this_week: number;
  interviews_scheduled: number;
  offers_received: number;
  avg_ats_score: number;
  stage_breakdown: Record<ApplicationStage, number>;
  weekly_activity: { week: string; count: number }[];
}
