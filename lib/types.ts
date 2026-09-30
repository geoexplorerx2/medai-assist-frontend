export interface DoctorProfile {
  id: string;
  username: string;
  role?: 'admin' | 'doctor' | string;
  can_upload_pdf?: boolean;
  can_record_voice?: boolean;
  can_contribute_case?: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface DoctorPublicSummary {
  id: string;
  username: string;
  role?: 'admin' | 'doctor' | string;
}

export interface DoctorLoginRequest {
  username: string;
  password: string;
}

export interface DoctorRegisterRequest {
  username: string;
  password: string;
  repeat_password?: string;
  role?: string;
  can_upload_pdf?: boolean;
  can_record_voice?: boolean;
  can_contribute_case?: boolean;
}

export interface UserPermissionsUpdateRequest {
  role?: string;
  can_upload_pdf?: boolean;
  can_record_voice?: boolean;
  can_contribute_case?: boolean;
  is_active?: boolean;
  password?: string;
}

export interface SystemSettings {
  enable_pdf_attachment: boolean;
  enable_voice_recording: boolean;
}

export interface DatasetImportResponse {
  status: string;
  message: string;
  records_count: number;
  chunks_indexed: number;
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
  extracted_entities?: string[];
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
  extracted_entities?: string[];
}

export interface PatientDocument {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  char_count: number;
  uploaded_at: string;
  preview: string;
}

export interface PatientDocumentsListResponse {
  session_id: string;
  documents: PatientDocument[];
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  specialty?: string | null;
  doctorId?: string;
  attachedDocuments?: PatientDocument[];
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

export interface DictationResponse {
  text: string;
  language: string;
  duration?: number;
  refined_text?: string | null;
  medical_terms?: string[];
}

export interface CaseContributionRequest {
  specialty: string;
  sample_name: string;
  description?: string;
  transcription: string;
  keywords?: string;
}

export interface CaseContributionResponse {
  status: string;
  doc_id: string;
  sample_name: string;
  specialty: string;
  chunks_indexed: number;
  message: string;
}