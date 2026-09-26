'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import { Send, Loader2, Filter, RotateCcw, Sparkles } from 'lucide-react';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const {
    sendMessage,
    isLoading,
    currentSessionId,
    availableSpecialties,
    selectedSpecialty,
    setSelectedSpecialty,
    clearSessionMessages,
    sessions,
  } = useChatStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const hasMessages = (currentSession?.messages?.length ?? 0) > 0;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px';
    }
  }, [input]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const q = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(q);
  };

  return (
    <div className="glass border-t border-slate-200 p-2.5 sm:p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Input Controls Container */}
        <div className="flex items-end gap-2 bg-white border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-2xl p-2 shadow-xs transition-all">
          {/* Text Input Area */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe clinical symptoms, ask about medication plans, or enter a diagnostic query..."
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none px-2 py-1.5 bg-transparent border-0 focus:outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 disabled:opacity-50 min-h-[38px] max-h-[140px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Clear Messages shortcut if session has messages */}
            {hasMessages && currentSessionId && (
              <button
                type="button"
                onClick={() => clearSessionMessages(currentSessionId)}
                title="Clear Consultation Messages"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors hidden sm:inline-flex"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Send Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Input Bottom Bar with Specialty Selector & Keyboard Hint */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 px-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500">
              <Sparkles className="w-3 h-3 text-cyan-500" />
              {selectedSpecialty ? `Domain: ${selectedSpecialty}` : 'Auto-detected specialty'}
            </span>
          </div>

          <span className="hidden md:inline text-[10px] text-slate-400">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-mono">Enter</kbd> to submit • <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-mono">Shift+Enter</kbd> for newline
          </span>
        </div>
      </form>
    </div>
  );
}