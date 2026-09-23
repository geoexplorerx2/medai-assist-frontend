'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SourceDocument } from '@/lib/types';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

export default function SourceCard({
  source,
  index,
}: {
  source: SourceDocument;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
            {index}
          </div>
          <FileText className="w-4 h-4 text-amber-700" />
        </div>
        <span className="text-[10px] font-semibold px-2.5 py-1 bg-amber-200 text-amber-800 rounded-full uppercase tracking-wide">
          {source.specialty}
        </span>
      </div>

      <p className={`text-xs text-slate-700 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
        {source.content}
      </p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 flex items-center gap-1 text-[10px] font-medium text-amber-700 hover:text-amber-800 transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp className="w-3 h-3" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3" />
            Show more
          </>
        )}
      </button>
    </motion.div>
  );
}