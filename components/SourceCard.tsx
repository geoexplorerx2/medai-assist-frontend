'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SourceDocument } from '@/lib/types';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface Props {
  source: SourceDocument;
  index: number;
}

export default function SourceCard({ source, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(source.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardId = `source-card-${source.doc_id || index}`;

  return (
    <div id={cardId} dir="rtl" className="bg-white/90 border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs hover:shadow-xs transition-all">
      {/* Card Header */}
      <div
        id={`${cardId}-header`}
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-2.5 sm:p-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
      >
        <div id={`${cardId}-header-left`} className="flex items-center gap-2 min-w-0">
          <div id={`${cardId}-badge-index`} className="w-5 h-5 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 border border-teal-200">
            {index}
          </div>
          <div id={`${cardId}-meta-box`} className="min-w-0 text-right">
            <h4 id={`${cardId}-sample-name`} className="text-xs font-semibold text-slate-800 truncate">
              {source.sample_name || `پرونده بالینی شماره ${index}`}
            </h4>
            <div id={`${cardId}-specialty-row`} className="flex items-center gap-1.5 mt-0.5">
              <span id={`${cardId}-specialty-label`} className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                {source.specialty}
              </span>
              {source.doc_id && (
                <span id={`${cardId}-doc-id-label`} className="text-[9px] font-mono text-slate-400">
                  شناسه: {source.doc_id}
                </span>
              )}
            </div>
          </div>
        </div>

        <div id={`${cardId}-header-actions`} className="flex items-center gap-1">
          <button
            id={`${cardId}-copy-btn`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            title="کپی متن مدرک"
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check id={`${cardId}-copy-check-icon`} className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy id={`${cardId}-copy-icon`} className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            id={`${cardId}-expand-btn`}
            type="button"
            aria-label="نمایش جزئیات سند"
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {expanded ? (
              <ChevronUp id={`${cardId}-chevron-up`} className="w-4 h-4" />
            ) : (
              <ChevronDown id={`${cardId}-chevron-down`} className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Excerpt Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            id={`${cardId}-content-motion`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-700 leading-relaxed font-mono text-left dir-ltr"
          >
            <p id={`${cardId}-content-text`} className="whitespace-pre-wrap">{source.content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}