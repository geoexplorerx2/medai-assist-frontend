import { ChatRequest, ChatResponse, FeedbackRequest, FeedbackResponse } from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const DEFAULT_API_KEY =
  process.env.NEXT_PUBLIC_DEFAULT_API_KEY || '';

export async function sendChatMessage(
  request: ChatRequest,
  apiKey: string
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey || DEFAULT_API_KEY,
    },
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
  apiKey: string
): Promise<FeedbackResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey || DEFAULT_API_KEY,
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Feedback Error ${response.status}: ${errorText}`);
  }
  return response.json();
}