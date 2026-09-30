import { create } from 'zustand';
import {
  Message,
  Session,
  FeedbackRating,
  DoctorProfile,
  DoctorLoginRequest,
  DoctorRegisterRequest,
  UserPermissionsUpdateRequest,
  PatientDocument,
  CaseContributionRequest,
  SystemSettings,
} from '@/lib/types';
import {
  sendChatMessage,
  checkHealth,
  fetchSpecialties,
  submitDoctorFeedback,
  loginDoctor as apiLoginDoctor,
  registerDoctor as apiRegisterDoctor,
  fetchDoctorProfile,
  uploadPatientDocument,
  fetchSessionDocuments,
  deleteSessionDocument,
  contributeClinicalCase,
  fetchPublicSettings,
  updateAdminSettings as apiUpdateAdminSettings,
  fetchAdminDoctors as apiFetchAdminDoctors,
  createDoctorByAdmin as apiCreateDoctorByAdmin,
  deleteDoctorByAdmin as apiDeleteDoctorByAdmin,
  updateUserPermissionsByAdmin as apiUpdateUserPermissionsByAdmin,
  importDatasetByAdmin as apiImportDatasetByAdmin,
} from '@/lib/api';

interface ChatState {
  // Doctor Auth & Profile
  currentDoctor: DoctorProfile | null;
  doctorToken: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  isProfileModalOpen: boolean;
  isContributeModalOpen: boolean;

  // System Settings & Feature Toggles
  systemSettings: SystemSettings;
  loadSystemSettings: () => Promise<void>;

  // Admin Management State & Actions
  adminDoctors: DoctorProfile[];
  isAdminLoading: boolean;
  adminError: string | null;
  loadAdminDoctors: () => Promise<void>;
  createDoctorByAdminAction: (data: DoctorRegisterRequest) => Promise<boolean>;
  updateUserPermissionsAction: (userId: string, updates: UserPermissionsUpdateRequest) => Promise<boolean>;
  deleteDoctorByAdminAction: (doctorId: string) => Promise<boolean>;
  updateSystemSettingsAction: (updates: Partial<SystemSettings>) => Promise<boolean>;
  importDatasetAction: (file: File) => Promise<{ success: boolean; message: string }>;

  // Chat & Engine
  sessions: Session[];
  currentSessionId: string | null;
  apiKey: string;
  isApiLocked: boolean;
  isLoading: boolean;
  isUploadingDocument: boolean;
  documentUploadError: string | null;
  error: string | null;
  isBackendHealthy: boolean;
  availableSpecialties: string[];
  selectedSpecialty: string | null;
  feedbackSubmitting: string | null;
  isMobileSidebarOpen: boolean;

  // Actions
  setApiKey: (key: string) => void;
  lockApi: () => void;
  verifyBackend: () => Promise<boolean>;
  
  // Auth Actions
  initAuth: () => Promise<void>;
  login: (credentials: DoctorLoginRequest) => Promise<boolean>;
  register: (data: DoctorRegisterRequest) => Promise<boolean>;
  logout: () => void;
  setProfileModalOpen: (open: boolean) => void;
  setContributeModalOpen: (open: boolean) => void;

  // Consultation Actions
  createSession: (initialTitle?: string) => string;
  setCurrentSession: (id: string) => void;
  sendMessage: (query: string, topK?: number) => Promise<void>;
  deleteSession: (id: string) => void;
  clearSessionMessages: (id: string) => void;
  loadSpecialties: () => Promise<void>;
  setSelectedSpecialty: (s: string | null) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  uploadPatientDoc: (file: File) => Promise<boolean>;
  removePatientDoc: (docId: string) => Promise<void>;
  loadSessionDocs: (sessionId: string) => Promise<void>;
  contributeCase: (caseData: CaseContributionRequest) => Promise<{ success: boolean; message: string }>;
  submitFeedback: (
    messageId: string,
    rating: FeedbackRating,
    correction?: string
  ) => Promise<void>;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const getStorageKey = (doctorId?: string) =>
  doctorId ? `medai_sessions_${doctorId}` : 'medai_sessions_anonymous';

export const useChatStore = create<ChatState>((set, get) => ({
  currentDoctor: null,
  doctorToken: null,
  isAuthenticated: false,
  authLoading: false,
  authError: null,
  isProfileModalOpen: false,
  isContributeModalOpen: false,

  systemSettings: {
    enable_pdf_attachment: true,
    enable_voice_recording: true,
  },

  adminDoctors: [],
  isAdminLoading: false,
  adminError: null,

  sessions: [],
  currentSessionId: null,
  apiKey: process.env.NEXT_PUBLIC_DEFAULT_API_KEY || 'medai_super_secret_key_2024',
  isApiLocked: false,
  isLoading: false,
  isUploadingDocument: false,
  documentUploadError: null,
  error: null,
  isBackendHealthy: false,
  availableSpecialties: [],
  selectedSpecialty: null,
  feedbackSubmitting: null,
  isMobileSidebarOpen: false,

  setApiKey: (key) => set({ apiKey: key }),
  lockApi: () => set({ isApiLocked: true }),

  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  toggleMobileSidebar: () => set((s) => ({ isMobileSidebarOpen: !s.isMobileSidebarOpen })),
  setProfileModalOpen: (open) => set({ isProfileModalOpen: open }),
  setContributeModalOpen: (open) => set({ isContributeModalOpen: open }),

  loadSystemSettings: async () => {
    try {
      const settings = await fetchPublicSettings();
      set({ systemSettings: settings });
    } catch (e) {
      console.error('Failed to load system settings:', e);
    }
  },

  verifyBackend: async () => {
    const healthy = await checkHealth();
    set({ isBackendHealthy: healthy });
    return healthy;
  },

  initAuth: async () => {
    get().loadSystemSettings();
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('medai_doctor_token');
    const storedDoctor = localStorage.getItem('medai_doctor_profile');

    if (token && storedDoctor) {
      try {
        const doctor: DoctorProfile = JSON.parse(storedDoctor);
        const savedSessionsRaw = localStorage.getItem(getStorageKey(doctor.id));
        const savedSessions: Session[] = savedSessionsRaw ? JSON.parse(savedSessionsRaw) : [];

        set({
          doctorToken: token,
          currentDoctor: doctor,
          isAuthenticated: true,
          sessions: savedSessions,
          currentSessionId: savedSessions[0]?.id || null,
        });

        // Background profile refresh
        fetchDoctorProfile(token).then((freshDoc) => {
          localStorage.setItem('medai_doctor_profile', JSON.stringify(freshDoc));
          set({ currentDoctor: freshDoc });
        }).catch(() => {});
      } catch (e) {
        console.error('Error restoring doctor session:', e);
        localStorage.removeItem('medai_doctor_token');
        localStorage.removeItem('medai_doctor_profile');
      }
    }
  },

  login: async (credentials) => {
    set({ authLoading: true, authError: null });
    try {
      const resp = await apiLoginDoctor(credentials);
      const doctor = resp.doctor;
      const token = resp.access_token;

      if (typeof window !== 'undefined') {
        localStorage.setItem('medai_doctor_token', token);
        localStorage.setItem('medai_doctor_profile', JSON.stringify(doctor));
      }

      const savedSessionsRaw = typeof window !== 'undefined' ? localStorage.getItem(getStorageKey(doctor.id)) : null;
      const savedSessions: Session[] = savedSessionsRaw ? JSON.parse(savedSessionsRaw) : [];

      set({
        currentDoctor: doctor,
        doctorToken: token,
        isAuthenticated: true,
        authLoading: false,
        authError: null,
        sessions: savedSessions,
        currentSessionId: savedSessions[0]?.id || null,
      });

      get().loadSpecialties();
      get().loadSystemSettings();
      return true;
    } catch (err) {
      set({
        authLoading: false,
        authError: err instanceof Error ? err.message : 'نام کاربری یا رمز عبور نامعتبر است.',
      });
      return false;
    }
  },

  register: async (data) => {
    set({ authLoading: true, authError: null });
    try {
      const resp = await apiRegisterDoctor(data);
      const doctor = resp.doctor;
      const token = resp.access_token;

      if (typeof window !== 'undefined') {
        localStorage.setItem('medai_doctor_token', token);
        localStorage.setItem('medai_doctor_profile', JSON.stringify(doctor));
      }

      set({
        currentDoctor: doctor,
        doctorToken: token,
        isAuthenticated: true,
        authLoading: false,
        authError: null,
        sessions: [],
        currentSessionId: null,
      });

      get().loadSpecialties();
      return true;
    } catch (err) {
      set({
        authLoading: false,
        authError: err instanceof Error ? err.message : 'ثبت‌نام انجام نشد.',
      });
      return false;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medai_doctor_token');
      localStorage.removeItem('medai_doctor_profile');
    }
    set({
      currentDoctor: null,
      doctorToken: null,
      isAuthenticated: false,
      sessions: [],
      currentSessionId: null,
      isProfileModalOpen: false,
      adminDoctors: [],
    });
  },

  // ==========================================
  // Admin Store Actions
  // ==========================================

  loadAdminDoctors: async () => {
    const { doctorToken, currentDoctor } = get();
    if (!doctorToken || currentDoctor?.role !== 'admin') return;

    set({ isAdminLoading: true, adminError: null });
    try {
      const docs = await apiFetchAdminDoctors(doctorToken);
      set({ adminDoctors: docs, isAdminLoading: false });
    } catch (err) {
      set({
        isAdminLoading: false,
        adminError: err instanceof Error ? err.message : 'خطا در بارگذاری فهرست کاربران.',
      });
    }
  },

  createDoctorByAdminAction: async (data: DoctorRegisterRequest) => {
    const { doctorToken, currentDoctor } = get();
    if (!doctorToken || currentDoctor?.role !== 'admin') return false;

    set({ isAdminLoading: true, adminError: null });
    try {
      await apiCreateDoctorByAdmin(data, doctorToken);
      await get().loadAdminDoctors();
      set({ isAdminLoading: false });
      return true;
    } catch (err) {
      set({
        isAdminLoading: false,
        adminError: err instanceof Error ? err.message : 'خطا در ایجاد کاربر جدید.',
      });
      return false;
    }
  },

  updateUserPermissionsAction: async (userId: string, updates: UserPermissionsUpdateRequest) => {
    const { doctorToken, currentDoctor } = get();
    if (!doctorToken || currentDoctor?.role !== 'admin') return false;

    set({ isAdminLoading: true, adminError: null });
    try {
      await apiUpdateUserPermissionsByAdmin(userId, updates, doctorToken);
      await get().loadAdminDoctors();
      set({ isAdminLoading: false });
      return true;
    } catch (err) {
      set({
        isAdminLoading: false,
        adminError: err instanceof Error ? err.message : 'خطا در به‌روزرسانی دسترسی‌های کاربر.',
      });
      return false;
    }
  },

  deleteDoctorByAdminAction: async (doctorId: string) => {
    const { doctorToken, currentDoctor } = get();
    if (!doctorToken || currentDoctor?.role !== 'admin') return false;

    try {
      await apiDeleteDoctorByAdmin(doctorId, doctorToken);
      await get().loadAdminDoctors();
      return true;
    } catch (err) {
      set({
        adminError: err instanceof Error ? err.message : 'خطا در حذف کاربر.',
      });
      return false;
    }
  },

  updateSystemSettingsAction: async (updates: Partial<SystemSettings>) => {
    const { doctorToken, currentDoctor } = get();
    if (!doctorToken || currentDoctor?.role !== 'admin') return false;

    try {
      const updated = await apiUpdateAdminSettings(updates, doctorToken);
      set({ systemSettings: updated });
      return true;
    } catch (err) {
      set({
        adminError: err instanceof Error ? err.message : 'خطا در به‌روزرسانی تنظیمات.',
      });
      return false;
    }
  },

  importDatasetAction: async (file: File) => {
    const { doctorToken, currentDoctor } = get();
    if (!doctorToken || currentDoctor?.role !== 'admin') {
      return { success: false, message: 'دسترسی مدیریت مورد نیاز است.' };
    }

    set({ isAdminLoading: true, adminError: null });
    try {
      const res = await apiImportDatasetByAdmin(file, doctorToken);
      set({ isAdminLoading: false });
      get().loadSpecialties();
      return { success: true, message: res.message };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطا در آپلود و وکتورایز دیتاست.';
      set({ isAdminLoading: false, adminError: msg });
      return { success: false, message: msg };
    }
  },

  // ==========================================
  // Consultation Actions
  // ==========================================

  loadSpecialties: async () => {
    try {
      const list = await fetchSpecialties(get().apiKey);
      set({ availableSpecialties: list });
    } catch (e) {
      console.error('Failed to load specialties:', e);
    }
  },

  setSelectedSpecialty: (s) => set({ selectedSpecialty: s === '' ? null : s }),

  createSession: (initialTitle = 'مشاوره بالینی جدید') => {
    const id = generateId();
    const currentDoc = get().currentDoctor;
    const newSession: Session = {
      id,
      title: initialTitle,
      messages: [],
      createdAt: new Date().toISOString(),
      specialty: get().selectedSpecialty,
      doctorId: currentDoc?.id,
    };
    
    const updatedSessions = [newSession, ...get().sessions];
    set({
      sessions: updatedSessions,
      currentSessionId: id,
      error: null,
      isMobileSidebarOpen: false,
    });

    if (typeof window !== 'undefined' && currentDoc) {
      localStorage.setItem(getStorageKey(currentDoc.id), JSON.stringify(updatedSessions));
    }
    return id;
  },

  setCurrentSession: (id) => set({ currentSessionId: id, error: null, isMobileSidebarOpen: false }),

  deleteSession: (id) => {
    const currentDoc = get().currentDoctor;
    const remaining = get().sessions.filter((sess) => sess.id !== id);
    set({
      sessions: remaining,
      currentSessionId:
        get().currentSessionId === id ? remaining[0]?.id ?? null : get().currentSessionId,
    });
    if (typeof window !== 'undefined' && currentDoc) {
      localStorage.setItem(getStorageKey(currentDoc.id), JSON.stringify(remaining));
    }
  },

  clearSessionMessages: (id) => {
    const currentDoc = get().currentDoctor;
    const updated = get().sessions.map((sess) =>
      sess.id === id ? { ...sess, messages: [] } : sess
    );
    set({ sessions: updated });
    if (typeof window !== 'undefined' && currentDoc) {
      localStorage.setItem(getStorageKey(currentDoc.id), JSON.stringify(updated));
    }
  },

  sendMessage: async (query, topK = 3) => {
    const state = get();
    let sessionId = state.currentSessionId;
    if (!sessionId) {
      sessionId = get().createSession(query.slice(0, 36) + (query.length > 36 ? '...' : ''));
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    const intermediateSessions = get().sessions.map((sess) =>
      sess.id === sessionId
        ? {
            ...sess,
            title:
              sess.messages.length === 0
                ? query.slice(0, 36) + (query.length > 36 ? '...' : '')
                : sess.title,
            messages: [...sess.messages, userMessage],
          }
        : sess
    );

    set({
      isLoading: true,
      error: null,
      sessions: intermediateSessions,
    });

    try {
      const response = await sendChatMessage(
        {
          query,
          session_id: sessionId,
          top_k: topK,
          specialty_filter: state.selectedSpecialty,
          doctor_id: state.currentDoctor?.id,
        },
        state.apiKey,
        state.doctorToken || undefined
      );

      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date().toISOString(),
        feedback: null,
        detected_specialty: response.detected_specialty,
        normalized_clinical_terms: response.normalized_clinical_terms,
        extracted_entities: response.extracted_entities,
      };

      const finalSessions = get().sessions.map((sess) =>
        sess.id === sessionId
          ? {
              ...sess,
              specialty: response.detected_specialty || sess.specialty,
              messages: [...sess.messages, aiMessage],
            }
          : sess
      );

      set({
        isLoading: false,
        sessions: finalSessions,
      });

      if (typeof window !== 'undefined' && state.currentDoctor) {
        localStorage.setItem(getStorageKey(state.currentDoctor.id), JSON.stringify(finalSessions));
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'خطایی در ارتباط با موتور هوش مصنوعی بالینی رخ داد.',
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
          doctor_id: state.currentDoctor?.id,
        },
        state.apiKey,
        state.doctorToken || undefined
      );

      const updatedSessions = state.sessions.map((sess) =>
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
      );

      set({
        feedbackSubmitting: null,
        sessions: updatedSessions,
      });

      if (typeof window !== 'undefined' && state.currentDoctor) {
        localStorage.setItem(getStorageKey(state.currentDoctor.id), JSON.stringify(updatedSessions));
      }
    } catch (err) {
      set({
        feedbackSubmitting: null,
        error: err instanceof Error ? err.message : 'ثبت بازخورد بالینی با خطا مواجه شد.',
      });
    }
  },

  uploadPatientDoc: async (file: File) => {
    const state = get();
    let sessionId = state.currentSessionId;
    if (!sessionId) {
      sessionId = get().createSession(`پرونده: ${file.name.slice(0, 24)}`);
    }

    set({ isUploadingDocument: true, documentUploadError: null });
    try {
      const doc = await uploadPatientDocument(
        file,
        sessionId,
        state.apiKey,
        state.doctorToken || undefined
      );

      const updatedSessions = get().sessions.map((sess) => {
        if (sess.id === sessionId) {
          const currentDocs = sess.attachedDocuments || [];
          return {
            ...sess,
            attachedDocuments: [...currentDocs, doc],
          };
        }
        return sess;
      });

      set({
        isUploadingDocument: false,
        documentUploadError: null,
        sessions: updatedSessions,
      });

      if (typeof window !== 'undefined' && state.currentDoctor) {
        localStorage.setItem(getStorageKey(state.currentDoctor.id), JSON.stringify(updatedSessions));
      }
      return true;
    } catch (err) {
      set({
        isUploadingDocument: false,
        documentUploadError: err instanceof Error ? err.message : 'بارگذاری سند پزشکی با خطا مواجه شد.',
      });
      return false;
    }
  },

  removePatientDoc: async (docId: string) => {
    const state = get();
    const sessionId = state.currentSessionId;
    if (!sessionId) return;

    try {
      await deleteSessionDocument(
        sessionId,
        docId,
        state.apiKey,
        state.doctorToken || undefined
      );

      const updatedSessions = get().sessions.map((sess) => {
        if (sess.id === sessionId) {
          const currentDocs = sess.attachedDocuments || [];
          return {
            ...sess,
            attachedDocuments: currentDocs.filter((d) => d.id !== docId),
          };
        }
        return sess;
      });

      set({ sessions: updatedSessions });

      if (typeof window !== 'undefined' && state.currentDoctor) {
        localStorage.setItem(getStorageKey(state.currentDoctor.id), JSON.stringify(updatedSessions));
      }
    } catch (err) {
      console.error('Failed to remove document:', err);
    }
  },

  loadSessionDocs: async (sessionId: string) => {
    const state = get();
    try {
      const docs = await fetchSessionDocuments(
        sessionId,
        state.apiKey,
        state.doctorToken || undefined
      );

      const updatedSessions = get().sessions.map((sess) =>
        sess.id === sessionId ? { ...sess, attachedDocuments: docs } : sess
      );

      set({ sessions: updatedSessions });
    } catch (err) {
      console.error('Failed to fetch session documents:', err);
    }
  },

  contributeCase: async (caseData: CaseContributionRequest) => {
    const state = get();
    try {
      const resp = await contributeClinicalCase(
        caseData,
        state.apiKey,
        state.doctorToken || undefined
      );

      get().loadSpecialties();

      return {
        success: true,
        message: resp.message || `مورد بالینی '${caseData.sample_name}' با موفقیت به پایگاه دانش افزوده شد!`
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ثبت مورد بالینی با خطا مواجه شد.';
      return {
        success: false,
        message: msg
      };
    }
  },
}));