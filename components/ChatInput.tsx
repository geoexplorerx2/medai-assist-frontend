'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import { Send, Loader2 } from 'lucide-react';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const { sendMessage, isLoading, currentSessionId } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const q = input.trim();
    setInput('');
    await sendMessage(q);
  };

  return (
    <div className="glass border-t border-slate-200/50 p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                currentSessionId
                  ? 'Ask any medical question — specialty will be auto-detected...'
                  : 'Click "New Consultation" to begin'
              }
              disabled={isLoading || !currentSessionId}
              rows={1}
              className="w-full resize-none px-4 py-3 pr-4 bg-white/90 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed text-sm shadow-sm transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          <motion.button
            type="submit"
            disabled={isLoading || !input.trim() || !currentSessionId}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-2xl transition-all shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2">
          🤖 AI auto-detects medical specialty • Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">Shift+Enter</kbd> for new line
        </p>
      </form>
    </div>
  );
}