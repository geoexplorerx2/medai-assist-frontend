export interface DoctorProfile {
  id: string;
  username: string;
  full_name: string;
  specialty?: string;
  license_number?: string;
  email?: string;
  department?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
}

export interface DoctorPublicSummary {
  id: string;
  username: string;
  full_name: string;
  specialty?: string;
  department?: string;
  license_number?: string;
  avatar_url?: string;
}

export interface DoctorLoginRequest {
  username: string;
  password: string;
}

export interface DoctorRegisterRequest {
  username: string;
  password: string;
  full_name: string;
  specialty?: string;
  license_number?: string;
  email?: string;
  department?: string;
  bio?: string;
}

export interface DoctorUpdateRequest {
  full_name?: string;
  specialty?: string;
  license_number?: string;
  email?: string;
  department?: string;
  bio?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  doctor: DoctorProfile;
}

export interface SourceDocument {
  content: string;
  specialty: string;
  sample_name?: string;
  doc_id?: string;
}

export interface ChatRequest {
  query: string;
  session_id: string;
  specialty_filter?: string | null;
  top_k?: number;
  doctor_id?: string;
}

export interface ChatResponse {
  answer: string;
  sources: SourceDocument[];
  query: string;
  detected_specialty?: string | null;
  normalized_clinical_terms?: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceDocument[];
  timestamp: string;
  feedback?: 'verify' | 'correct' | null;
  correction?: string;
  detected_specialty?: string | null;
  normalized_clinical_terms?: string[];
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  specialty?: string | null;
  doctorId?: string;
}

export type FeedbackRating = 'verify' | 'correct';

export interface FeedbackRequest {
  message_id: string;
  session_id: string;
  rating: FeedbackRating;
  original_answer: string;
  query: string;
  correction?: string;
  doctor_id?: string;
}

export interface FeedbackResponse {
  status: string;
  feedback_id: string;
}