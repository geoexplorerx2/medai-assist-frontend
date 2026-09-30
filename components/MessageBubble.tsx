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

  const formattedTime = new Date(message.timestamp).toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const msgId = message.id;

  return (
    <motion.div
      id={`message-bubble-motion-${msgId}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      dir="rtl"
      className={`flex gap-3 sm:gap-4 ${isUser ? 'flex-row' : 'flex-row'} w-full group`}
    >
      {/* Avatar Icon */}
      <div
        id={`message-avatar-box-${msgId}`}
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-xs ${
          isUser
            ? 'bg-gradient-to-br from-teal-600 to-emerald-600 text-white'
            : 'bg-slate-900 text-teal-400 border border-slate-700'
        }`}
      >
        {isUser ? (
          <User id={`message-user-icon-${msgId}`} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        ) : (
          <Stethoscope id={`message-ai-icon-${msgId}`} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        )}
      </div>

      {/* Message Content Container */}
      <div id={`message-content-wrapper-${msgId}`} className={`flex flex-col items-start max-w-[88%] sm:max-w-[82%] md:max-w-[78%]`}>
        {/* Header (Role & Time) */}
        <div id={`message-header-${msgId}`} className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400">
          <span id={`message-sender-name-${msgId}`} className="font-semibold text-slate-700">
            {isUser ? 'پزشک معالج' : 'دستیار بالینی MedAI'}
          </span>
          <span id={`message-header-dot-${msgId}`}>•</span>
          <span id={`message-timestamp-${msgId}`} className="flex items-center gap-0.5">
            <Clock id={`message-clock-icon-${msgId}`} className="w-2.5 h-2.5" />
            {formattedTime}
          </span>
        </div>

        {/* Bubble Body */}
        <div
          id={`message-body-box-${msgId}`}
          className={`relative px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl shadow-xs text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-tr-xs'
              : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
          }`}
        >
          {isUser ? (
            <p id={`message-user-text-${msgId}`} className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <>
              <MarkdownRenderer content={message.content} />

              {/* Action Toolbar on AI Bubble */}
              <div id={`message-toolbar-${msgId}`} className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-100 text-slate-400">
                <button
                  id={`message-copy-btn-${msgId}`}
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] hover:text-slate-700 transition-colors p-1 rounded hover:bg-slate-50 cursor-pointer"
                  title="کپی پاسخ بالینی"
                >
                  {copied ? (
                    <>
                      <Check id={`message-copied-check-icon-${msgId}`} className="w-3 h-3 text-emerald-600" />
                      <span id={`message-copied-text-${msgId}`} className="text-emerald-600 font-medium">کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy id={`message-copy-icon-${msgId}`} className="w-3 h-3" />
                      <span id={`message-copy-text-${msgId}`}>کپی متن</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Clinical Entities & Specialty Badges for AI Responses */}
        {!isUser && (
          <div id={`message-clinical-badges-box-${msgId}`} className="mt-2 flex flex-wrap items-center gap-1.5 px-0.5">
            {/* Auto-Classified Specialty Tag */}
            {message.detected_specialty && (
              <span id={`message-specialty-badge-${msgId}`} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                <Sparkles id={`message-specialty-icon-${msgId}`} className="w-2.5 h-2.5 text-teal-500" />
                تخصص: {message.detected_specialty}
              </span>
            )}

            {/* Normalized Medical Entities */}
            {message.normalized_clinical_terms && message.normalized_clinical_terms.length > 0 && (
              message.normalized_clinical_terms.map((term, i) => (
                <span
                  id={`message-clinical-term-${msgId}-${i}`}
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  <Tag id={`message-clinical-term-icon-${msgId}-${i}`} className="w-2.5 h-2.5 text-slate-400" />
                  {term}
                </span>
              ))
            )}
          </div>
        )}

        {/* Source References */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div id={`message-sources-wrapper-${msgId}`} className="mt-3 w-full space-y-2">
            <div id={`message-sources-title-row-${msgId}`} className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
              <span id={`message-sources-title-${msgId}`}>شواهد بالینی و سوابق تطبیق‌یافته ({message.sources.length} مدرک)</span>
            </div>
            <div id={`message-sources-list-${msgId}`} className="space-y-1.5">
              {message.sources.map((src, i) => (
                <SourceCard key={i} source={src} index={i + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Doctor Verification / Correction Controls */}
        {!isUser && (
          <div id={`message-feedback-wrapper-${msgId}`} className="mt-2.5 px-1">
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