'use client';

import { motion } from 'framer-motion';
import { Message } from '@/lib/types';
import { User, Sparkles } from 'lucide-react';
import SourceCard from './SourceCard';
import FeedbackButtons from './FeedbackButtons';
import MarkdownRenderer from './MarkdownRenderer';

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
            : 'bg-gradient-to-br from-slate-700 to-slate-800'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
          </svg>
        )}
      </motion.div>

      <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-tr-sm'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </motion.div>

        {!isUser && message.detected_specialty && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-blue-700 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-full px-3 py-1 shadow-sm"
          >
            <Sparkles className="w-3 h-3" />
            <span>Auto-classified: {message.detected_specialty}</span>
          </motion.div>
        )}

        {!isUser && message.sources && message.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 w-full space-y-2"
          >
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
              Sources ({message.sources.length})
            </p>
            {message.sources.map((src, i) => (
              <SourceCard key={i} source={src} index={i + 1} />
            ))}
          </motion.div>
        )}

        {!isUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-3"
          >
            <FeedbackButtons
              messageId={message.id}
              feedback={message.feedback || null}
              correction={message.correction}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}