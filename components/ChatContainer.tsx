'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import Navbar from './Navbar';
import {
  AlertCircle,
  Stethoscope,
  Sparkles,
} from 'lucide-react';

export default function ChatContainer() {
  const {
    sessions,
    currentSessionId,
    isLoading,
    error,
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
    <div dir="rtl" className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 medical-grid-bg">
      {/* Top Responsive Navigation Bar */}
      <Navbar />

      {/* Main Consultation Canvas */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 md:py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Messages list */}
          {messages.length > 0 && (
            <div className="space-y-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          )}

          {/* Typing / Loading Skeleton */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 text-right"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                <Stethoscope className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tr-sm p-4 shadow-sm max-w-2xl w-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-800">
                    دستیار هوش مصنوعی MedAI
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-medium animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    در حال جستجو و تولید پاسخ به زبان فارسی...
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="h-3.5 bg-slate-100 rounded-full w-4/5 animate-pulse" />
                  <div className="h-3.5 bg-slate-100 rounded-full w-full animate-pulse" />
                  <div className="h-3.5 bg-slate-100 rounded-full w-2/3 animate-pulse" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs"
            >
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">خطای سیستم بالینی</span>
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Chat Input Form */}
      <ChatInput />
    </div>
  );
}