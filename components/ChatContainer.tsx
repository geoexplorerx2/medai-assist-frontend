'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import Logo from './Logo';
import { AlertCircle } from 'lucide-react';

export default function ChatContainer() {
  const { sessions, currentSessionId, isLoading, error } = useChatStore();
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
  }, [messages, isLoading]);

  if (!currentSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gradient-bg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <Logo size={72} />
          </div>
          <h2 className="text-2xl font-bold gradient-text">MedAI-Assist</h2>
          <p className="text-sm text-slate-500 mt-2">
            Click <span className="font-semibold text-blue-600">&quot;New Consultation&quot;</span> in the sidebar to begin.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen gradient-bg">
      <div className="glass border-b border-slate-200/50 px-6 py-4">
        <motion.h2
          key={currentSession.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-semibold text-slate-800 truncate"
        >
          {currentSession.title}
        </motion.h2>
        <p className="text-[11px] text-slate-400">
          Session ID: {currentSession.id}
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-sm text-slate-400">
                Start by asking a clinical question, e.g.,
              </p>
              <motion.p
                whileHover={{ scale: 1.05 }}
                className="text-sm text-slate-600 italic mt-2 cursor-default"
              >
                &quot;What are the symptoms of allergic rhinitis?&quot;
              </motion.p>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0 shadow-md">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 8V4H8" />
                  <rect width="16" height="12" x="4" y="8" rx="2" />
                  <path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
                </svg>
              </div>
              <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-blue-500"
                      animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}
        </div>
      </div>

      <ChatInput />
    </div>
  );
}