'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import { Check, X, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Props {
  messageId: string;
  feedback: 'verify' | 'correct' | null;
  correction?: string;
}

export default function FeedbackButtons({ messageId, feedback, correction }: Props) {
  const { submitFeedback, feedbackSubmitting } = useChatStore();
  const [showCorrectionBox, setShowCorrectionBox] = useState(false);
  const [correctionText, setCorrectionText] = useState(correction || '');

  const isSubmitting = feedbackSubmitting === messageId;

  const handleVerify = async () => {
    await submitFeedback(messageId, 'verify');
  };

  const handleCorrect = async () => {
    if (!correctionText.trim()) {
      setShowCorrectionBox(true);
      return;
    }
    await submitFeedback(messageId, 'correct', correctionText.trim());
    setShowCorrectionBox(false);
  };

  if (feedback === 'verify') {
    return (
      <motion.div
        id={`feedback-verified-container-${messageId}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        dir="rtl"
        className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg px-3 py-1.5 shadow-xs"
      >
        <ThumbsUp id={`feedback-thumbsup-icon-${messageId}`} className="w-3.5 h-3.5" />
        <span id={`feedback-verified-text-${messageId}`}>صحت پاسخ توسط پزشک معالج تأیید شد</span>
      </motion.div>
    );
  }

  if (feedback === 'correct') {
    return (
      <motion.div
        id={`feedback-corrected-container-${messageId}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        dir="rtl"
        className="space-y-2"
      >
        <div id={`feedback-corrected-badge-${messageId}`} className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg px-3 py-1.5 shadow-xs">
          <ThumbsDown id={`feedback-thumbsdown-icon-${messageId}`} className="w-3.5 h-3.5" />
          <span id={`feedback-corrected-text-${messageId}`}>اصلاحیه بالینی توسط پزشک ثبت شد</span>
        </div>
        {correction && (
          <div id={`feedback-correction-details-${messageId}`} className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <p id={`feedback-correction-title-${messageId}`} className="text-[10px] text-slate-500 mb-1 font-semibold">
              یادداشت اصلاحی پزشک:
            </p>
            <p id={`feedback-correction-content-${messageId}`} className="text-slate-700 leading-relaxed">{correction}</p>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div id={`feedback-actions-wrapper-${messageId}`} dir="rtl" className="space-y-2">
      <div id={`feedback-buttons-row-${messageId}`} className="flex items-center gap-2">
        <motion.button
          id={`feedback-verify-btn-${messageId}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleVerify}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 rounded-lg disabled:opacity-50 transition-all shadow-xs cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 id={`feedback-verify-spinner-${messageId}`} className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check id={`feedback-verify-check-icon-${messageId}`} className="w-3.5 h-3.5" />
          )}
          <span id={`feedback-verify-btn-label-${messageId}`}>تأیید بالینی</span>
        </motion.button>
        <motion.button
          id={`feedback-correct-toggle-btn-${messageId}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCorrectionBox(!showCorrectionBox)}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 rounded-lg disabled:opacity-50 transition-all shadow-xs cursor-pointer"
        >
          <X id={`feedback-correct-toggle-icon-${messageId}`} className="w-3.5 h-3.5" />
          <span id={`feedback-correct-toggle-label-${messageId}`}>ثبت اصلاحیه</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showCorrectionBox && (
          <motion.div
            id={`feedback-correction-box-${messageId}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <textarea
              id={`feedback-correction-textarea-${messageId}`}
              value={correctionText}
              onChange={(e) => setCorrectionText(e.target.value)}
              placeholder="توضیح دهید چه نکته‌ای باید تصحیح شود یا دوز/داروی صحیح چیست..."
              rows={3}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none shadow-xs text-slate-800"
            />
            <div id={`feedback-correction-actions-${messageId}`} className="flex gap-2">
              <motion.button
                id={`feedback-correction-submit-btn-${messageId}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCorrect}
                disabled={isSubmitting || !correctionText.trim()}
                className="text-xs font-medium px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white rounded-lg shadow-xs cursor-pointer"
              >
                {isSubmitting ? (
                  <span id={`feedback-correction-submitting-text-${messageId}`}>در حال ثبت...</span>
                ) : (
                  <span id={`feedback-correction-submit-label-${messageId}`}>ارسال اصلاحیه</span>
                )}
              </motion.button>
              <button
                id={`feedback-correction-cancel-btn-${messageId}`}
                type="button"
                onClick={() => {
                  setShowCorrectionBox(false);
                  setCorrectionText('');
                }}
                className="text-xs font-medium px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}