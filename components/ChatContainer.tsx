'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import Navbar from './Navbar';
import Logo from './Logo';
import {
  AlertCircle,
  Stethoscope,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  {
    title: 'Allergic Rhinitis',
    query: 'What treatments and nasal sprays were prescribed for allergic rhinitis?',
    specialty: 'Allergy / Immunology',
    icon: '🌿',
  },
  {
    title: 'Orthopnea & Leg Edema',
    query: 'Patient reports shortness of breath when lying flat in bed and swollen ankles.',
    specialty: 'Cardiovascular / Pulmonary',
    icon: '🫀',
  },
  {
    title: 'Foreign Body & Airway',
    query: 'Patient presents with airway compromise due to fishbone foreign body.',
    specialty: 'General Medicine',
    icon: '🫁',
  },
  {
    title: 'Gastric Bypass Consult',
    query: 'Past medical history and dietary consult for laparoscopic gastric bypass.',
    specialty: 'Bariatrics',
    icon: '🩺',
  },
];

export default function ChatContainer() {
  const {
    sessions,
    currentSessionId,
    isLoading,
    error,
    createSession,
    sendMessage,
    clearSessionMessages,
  } = useChatStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const messages = currentSession?.messages ?? [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages.length, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 medical-grid-bg">
      {/* Top Responsive Navigation Bar */}
      <Navbar />

      {/* Main Consultation Canvas */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 md:py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Empty Consultation State with Prompt Chips */}
          {messages.length === 0 ? (
            <div className="py-6 sm:py-12 px-2 text-center max-w-2xl mx-auto">
              <div className="flex justify-center mb-4">
                <Logo size={60} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Clinical Intelligence Assistant
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-lg mx-auto">
                Query clinical cases, examine differential considerations, and extract SOAP documentation with zero hallucinations.
              </p>

              {/* Quick Clinical Suggestion Cards */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-left">
                {SUGGESTED_QUERIES.map((item, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.015, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendMessage(item.query)}
                    className="p-3 sm:p-3.5 bg-white border border-slate-200 hover:border-cyan-400 hover:shadow-md rounded-xl text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {item.specialty}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {item.query}
                    </p>
                  </motion.button>
                ))}
              </div>

              <div className="mt-8 inline-flex items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Grounded in Case Notes
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Hybrid Reranked
                </span>
              </div>
            </div>
          ) : (
            /* Active Messages Feed */
            <div className="space-y-6">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
            </div>
          )}

          {/* Clinical Retrieval Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 sm:gap-4"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 flex items-center justify-center text-cyan-400 border border-slate-700 shadow-xs flex-shrink-0">
                <Stethoscope className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-pulse" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-3.5 rounded-2xl rounded-tl-xs shadow-xs">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-2 h-2 rounded-full bg-blue-500"
                        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                  <span>Analyzing clinical symptoms & retrieving records...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-xs flex items-start gap-2.5 shadow-xs"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1">
                <p className="font-semibold">Engine Communication Error</p>
                <p className="mt-0.5 text-red-600">{error}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Chat Input Bar */}
      <ChatInput />
    </div>
  );
}