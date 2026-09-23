import { create } from 'zustand';
import { Message, Session, FeedbackRating } from '@/lib/types';
import {
  sendChatMessage,
  checkHealth,
  fetchSpecialties,
  submitDoctorFeedback,
} from '@/lib/api';

interface ChatState {
  sessions: Session[];
  currentSessionId: string | null;
  apiKey: string;
  isApiLocked: boolean;
  isLoading: boolean;
  error: string | null;
  isBackendHealthy: boolean;
  availableSpecialties: string[];
  selectedSpecialty: string | null;
  feedbackSubmitting: string | null;

  setApiKey: (key: string) => void;
  lockApi: () => void;
  verifyBackend: () => Promise<boolean>;
  createSession: () => string;
  setCurrentSession: (id: string) => void;
  sendMessage: (query: string, topK?: number) => Promise<void>;
  deleteSession: (id: string) => void;
  loadSpecialties: () => Promise<void>;
  setSelectedSpecialty: (s: string | null) => void;
  submitFeedback: (
    messageId: string,
    rating: FeedbackRating,
    correction?: string
  ) => Promise<void>;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  apiKey: process.env.NEXT_PUBLIC_DEFAULT_API_KEY || '',
  isApiLocked: false,
  isLoading: false,
  error: null,
  isBackendHealthy: false,
  availableSpecialties: [],
  selectedSpecialty: null,
  feedbackSubmitting: null,

  setApiKey: (key) => set({ apiKey: key }),
  lockApi: () => set({ isApiLocked: true }),

  verifyBackend: async () => {
    const healthy = await checkHealth();
    set({ isBackendHealthy: healthy });
    return healthy;
  },

  loadSpecialties: async () => {
    try {
      const list = await fetchSpecialties(get().apiKey);
      set({ availableSpecialties: list });
    } catch (e) {
      console.error('Failed to load specialties:', e);
    }
  },

  setSelectedSpecialty: (s) => set({ selectedSpecialty: s === '' ? null : s }),

  createSession: () => {
    const id = generateId();
    const newSession: Session = {
      id,
      title: 'New Consultation',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      sessions: [...state.sessions, newSession],
      currentSessionId: id,
      error: null,
    }));
    return id;
  },

  setCurrentSession: (id) => set({ currentSessionId: id, error: null }),

  sendMessage: async (query, topK = 3) => {
    const state = get();
    let sessionId = state.currentSessionId;
    if (!sessionId) {
      sessionId = get().createSession();
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      isLoading: true,
      error: null,
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId
          ? {
              ...sess,
              title:
                sess.messages.length === 0
                  ? query.slice(0, 40) + (query.length > 40 ? '...' : '')
                  : sess.title,
              messages: [...sess.messages, userMessage],
            }
          : sess
      ),
    }));

    try {
      const response = await sendChatMessage(
        {
          query,
          session_id: sessionId,
          top_k: topK,
          specialty_filter: state.selectedSpecialty,
        },
        state.apiKey
      );

      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date().toISOString(),
        feedback: null,
        detected_specialty: response.detected_specialty,
      };

      set((s) => ({
        isLoading: false,
        sessions: s.sessions.map((sess) =>
          sess.id === sessionId
            ? { ...sess, messages: [...sess.messages, aiMessage] }
            : sess
        ),
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
      });
    }
  },

  submitFeedback: async (messageId, rating, correction) => {
    const state = get();
    const session = state.sessions.find((s) => s.id === state.currentSessionId);
    if (!session) return;
    const message = session.messages.find((m) => m.id === messageId);
    if (!message) return;

    set({ feedbackSubmitting: messageId });
    try {
      const msgIndex = session.messages.findIndex((m) => m.id === messageId);
      const previousUserMessage = session.messages
        .slice(0, msgIndex)
        .reverse()
        .find((m) => m.role === 'user');
      const query = previousUserMessage?.content || '';

      await submitDoctorFeedback(
        {
          message_id: messageId,
          session_id: session.id,
          rating,
          original_answer: message.content,
          query,
          correction,
        },
        state.apiKey
      );

      set((s) => ({
        feedbackSubmitting: null,
        sessions: s.sessions.map((sess) =>
          sess.id === session.id
            ? {
                ...sess,
                messages: sess.messages.map((m) =>
                  m.id === messageId
                    ? {
                        ...m,
                        feedback: rating,
                        correction: correction || undefined,
                      }
                    : m
                ),
              }
            : sess
        ),
      }));
    } catch (err) {
      set({
        feedbackSubmitting: null,
        error: err instanceof Error ? err.message : 'Failed to submit feedback',
      });
    }
  },

  deleteSession: (id) =>
    set((s) => {
      const remaining = s.sessions.filter((sess) => sess.id !== id);
      return {
        sessions: remaining,
        currentSessionId:
          s.currentSessionId === id
            ? remaining[0]?.id ?? null
            : s.currentSessionId,
      };
    }),
}));