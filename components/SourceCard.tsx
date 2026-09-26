'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SourceDocument } from '@/lib/types';
import { FileText, ChevronDown, ChevronUp, Tag, Copy, Check } from 'lucide-react';

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

  return (
    <div className="bg-white/90 border border-slate-200/80 rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all">
      {/* Card Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-2.5 sm:p-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 border border-blue-200">
            {index}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-slate-800 truncate">
              {source.sample_name || `Clinical Record #${index}`}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                {source.specialty}
              </span>
              {source.doc_id && (
                <span className="text-[9px] font-mono text-slate-400">
                  ID: {source.doc_id}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            title="Copy snippet"
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            aria-label="Toggle excerpt"
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Excerpt Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-700 leading-relaxed font-mono"
          >
            <p className="whitespace-pre-wrap">{source.content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}