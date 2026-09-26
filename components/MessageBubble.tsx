'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Message } from '@/lib/types';
import { User, Sparkles, Stethoscope, Copy, Check, Tag, Clock } from 'lucide-react';
import SourceCard from './SourceCard';
import FeedbackButtons from './FeedbackButtons';
import MarkdownRenderer from './MarkdownRenderer';

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} w-full group`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-xs ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white'
            : 'bg-slate-900 text-cyan-400 border border-slate-700'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        ) : (
          <Stethoscope className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        )}
      </div>

      {/* Message Content Container */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[88%] sm:max-w-[82%] md:max-w-[78%]`}>
        {/* Header (Role & Time) */}
        <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-700">
            {isUser ? 'Doctor / Clinician' : 'MedAI Clinical Engine'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            {formattedTime}
          </span>
        </div>

        {/* Bubble Body */}
        <div
          className={`relative px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl shadow-xs text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-xs'
              : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <>
              <MarkdownRenderer content={message.content} />

              {/* Action Toolbar on AI Bubble */}
              <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-100 text-slate-400">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] hover:text-slate-700 transition-colors p-1 rounded hover:bg-slate-50"
                  title="Copy consultation response"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Clinical Entities & Specialty Badges for AI Responses */}
        {!isUser && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 px-0.5">
            {/* Auto-Classified Specialty Tag */}
            {message.detected_specialty && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                Domain: {message.detected_specialty}
              </span>
            )}

            {/* Normalized Medical Entities */}
            {message.normalized_clinical_terms && message.normalized_clinical_terms.length > 0 && (
              message.normalized_clinical_terms.map((term, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  <Tag className="w-2.5 h-2.5 text-slate-400" />
                  {term}
                </span>
              ))
            )}
          </div>
        )}

        {/* Source References */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 w-full space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
              <span>Grounded Evidence ({message.sources.length} records)</span>
            </div>
            <div className="space-y-1.5">
              {message.sources.map((src, i) => (
                <SourceCard key={i} source={src} index={i + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Doctor Verification / Correction Controls */}
        {!isUser && (
          <div className="mt-2.5 px-1">
            <FeedbackButtons
              messageId={message.id}
              feedback={message.feedback || null}
              correction={message.correction}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}