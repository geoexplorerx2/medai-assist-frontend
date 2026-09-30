import {
  ChatRequest,
  ChatResponse,
  FeedbackRequest,
  FeedbackResponse,
  DoctorLoginRequest,
  DoctorRegisterRequest,
  DoctorUpdateRequest,
  DoctorProfile,
  DoctorPublicSummary,
  AuthResponse,
  DictationResponse,
  PatientDocument,
  PatientDocumentsListResponse,
  CaseContributionRequest,
  CaseContributionResponse
} from './types';



const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL !== undefined
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : '';
const DEFAULT_API_KEY =
  process.env.NEXT_PUBLIC_DEFAULT_API_KEY || 'medai_super_secret_key_2024';

export async function loginDoctor(
  request: DoctorLoginRequest
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': DEFAULT_API_KEY,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Login Failed (${response.status})`);
  }
  return response.json();
}

export async function registerDoctor(
  request: DoctorRegisterRequest
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': DEFAULT_API_KEY,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Registration Failed (${response.status})`);
  }
  return response.json();
}

export async function fetchDoctorProfile(token: string): Promise<DoctorProfile> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Doctor-Token': token,
      'X-API-Key': DEFAULT_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profile (${response.status})`);
  }
  return response.json();
}

export async function updateDoctorProfile(
  updates: DoctorUpdateRequest,
  token: string
): Promise<DoctorProfile> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Doctor-Token': token,
      'X-API-Key': DEFAULT_API_KEY,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Profile update failed (${response.status})`);
  }
  return response.json();
}

export async function fetchDemoDoctors(): Promise<DoctorPublicSummary[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/demo-doctors`, {
    method: 'GET',
    headers: {
      'X-API-Key': DEFAULT_API_KEY,
    },
  });

  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function sendChatMessage(
  request: ChatRequest,
  apiKey: string,
  doctorToken?: string
): Promise<ChatResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey || DEFAULT_API_KEY,
  };
  if (doctorToken) {
    headers['Authorization'] = `Bearer ${doctorToken}`;
    headers['X-Doctor-Token'] = doctorToken;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  return response.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 'healthy';
  } catch {
    return false;
  }
}

export async function fetchSpecialties(apiKey: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/specialties`, {
    method: 'GET',
    headers: {
      'X-API-Key': apiKey || DEFAULT_API_KEY,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch specialties: ${response.status}`);
  }
  const data = await response.json();
  return data.specialties || [];
}

export async function submitDoctorFeedback(
  request: FeedbackRequest,
  apiKey: string,
  doctorToken?: string
): Promise<FeedbackResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey || DEFAULT_API_KEY,
  };
  if (doctorToken) {
    headers['Authorization'] = `Bearer ${doctorToken}`;
    headers['X-Doctor-Token'] = doctorToken;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/feedback`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Feedback Error ${response.status}: ${errorText}`);
  }
  return response.json();
}

export async function transcribeMedicalAudio(
  audioBlob: Blob,
  language: string = 'fa',
  refineMedical: boolean = false,
  apiKey?: string,
  doctorToken?: string
): Promise<DictationResponse> {
  const formData = new FormData();
  const filename = audioBlob.type.includes('wav') ? 'dictation.wav' : 'dictation.webm';
  formData.append('file', audioBlob, filename);
  formData.append('language', language);
  formData.append('refine_medical', refineMedical ? 'true' : 'false');

  const headers: Record<string, string> = {
    'X-API-Key': apiKey || DEFAULT_API_KEY,
  };
  if (doctorToken) {
    headers['Authorization'] = `Bearer ${doctorToken}`;
    headers['X-Doctor-Token'] = doctorToken;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/dictation/transcribe`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Dictation Error (${response.status})`);
  }
  return response.json();
}

export async function uploadPatientDocument(
  file: File,
  sessionId: string,
  apiKey?: string,
  doctorToken?: string
): Promise<PatientDocument> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('session_id', sessionId);

  const headers: Record<string, string> = {
    'X-API-Key': apiKey || DEFAULT_API_KEY,
  };
  if (doctorToken) {
    headers['Authorization'] = `Bearer ${doctorToken}`;
    headers['X-Doctor-Token'] = doctorToken;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/documents/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Document Upload Error (${response.status})`);
  }
  return response.json();
}

export async function fetchSessionDocuments(
  sessionId: string,
  apiKey?: string,
  doctorToken?: string
): Promise<PatientDocument[]> {
  const headers: Record<string, string> = {
    'X-API-Key': apiKey || DEFAULT_API_KEY,
  };
  if (doctorToken) {
    headers['Authorization'] = `Bearer ${doctorToken}`;
    headers['X-Doctor-Token'] = doctorToken;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/documents/${sessionId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    return [];
  }
  const data: PatientDocumentsListResponse = await response.json();
  return data.documents || [];
}

export async function deleteSessionDocument(
  sessionId: string,
  docId: string,
  apiKey?: string,
  doctorToken?: string
): Promise<boolean> {
  const headers: Record<string, string> = {
    'X-API-Key': apiKey || DEFAULT_API_KEY,
  };
  if (doctorToken) {
    headers['Authorization'] = `Bearer ${doctorToken}`;
    headers['X-Doctor-Token'] = doctorToken;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/documents/${sessionId}/${docId}`, {
    method: 'DELETE',
    headers,
  });
  return response.ok;
}

export async function contributeClinicalCase(
  request: CaseContributionRequest,
  apiKey?: string,
  doctorToken?: string
): Promise<CaseContributionResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey || DEFAULT_API_KEY,
  };
  if (doctorToken) {
    headers['Authorization'] = `Bearer ${doctorToken}`;
    headers['X-Doctor-Token'] = doctorToken;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/cases/contribute`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Case Contribution Failed (${response.status})`);
  }
  return response.json();
}