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
}

export type FeedbackRating = 'verify' | 'correct';

export interface FeedbackRequest {
  message_id: string;
  session_id: string;
  rating: FeedbackRating;
  original_answer: string;
  query: string;
  correction?: string;
}

export interface FeedbackResponse {
  status: string;
  feedback_id: string;
}