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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-xs font-medium text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-3 py-1.5 shadow-sm"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
        <span>Verified by doctor</span>
      </motion.div>
    );
  }

  if (feedback === 'correct') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg px-3 py-1.5 shadow-sm">
          <ThumbsDown className="w-3.5 h-3.5" />
          <span>Flagged for correction by doctor</span>
        </div>
        {correction && (
          <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1 font-semibold">
              Doctor&rsquo;s Correction:
            </p>
            <p className="text-slate-700">{correction}</p>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleVerify}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 hover:bg-green-50 hover:border-green-300 hover:text-green-700 rounded-lg disabled:opacity-50 transition-all shadow-sm"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          Verify
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCorrectionBox(!showCorrectionBox)}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 rounded-lg disabled:opacity-50 transition-all shadow-sm"
        >
          <X className="w-3.5 h-3.5" />
          Correct
        </motion.button>
      </div>

      <AnimatePresence>
        {showCorrectionBox && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <textarea
              value={correctionText}
              onChange={(e) => setCorrectionText(e.target.value)}
              placeholder="Type the correct answer or note what was wrong..."
              rows={3}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none shadow-sm"
            />
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCorrect}
                disabled={isSubmitting || !correctionText.trim()}
                className="text-xs font-medium px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white rounded-lg shadow-sm"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Correction'}
              </motion.button>
              <button
                onClick={() => {
                  setShowCorrectionBox(false);
                  setCorrectionText('');
                }}
                className="text-xs font-medium px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}