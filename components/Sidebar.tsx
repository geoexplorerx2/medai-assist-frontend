'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import Logo from './Logo';

export default function Sidebar() {
  const {
    sessions,
    currentSessionId,
    createSession,
    setCurrentSession,
    deleteSession,
  } = useChatStore();

  return (
    <aside className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-300 flex flex-col h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/20 to-transparent" />

      <div className="p-5 border-b border-slate-700/50 flex items-center gap-3 relative z-10">
        <Logo size={40} />
        <div>
          <h1 className="text-base font-bold text-white">MedAI-Assist</h1>
          <p className="text-[10px] text-slate-400">Clinical Intelligence</p>
        </div>
      </div>

      <div className="p-4 relative z-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => createSession()}
          className="w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New Consultation
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 relative z-10">
        {sessions.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-slate-500 px-3 py-4 text-center"
          >
            No consultations yet
          </motion.p>
        )}
        <AnimatePresence>
          {sessions.map((sess, idx) => (
            <motion.div
              key={sess.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: idx * 0.05 }}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-all ${
                sess.id === currentSessionId
                  ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/20 text-white border border-blue-500/30'
                  : 'hover:bg-slate-700/50'
              }`}
              onClick={() => setCurrentSession(sess.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span className="flex-1 truncate">{sess.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(sess.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-slate-700/50 relative z-10">
        <div className="text-[10px] text-slate-500 space-y-1">
          <p className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Connected to backend
          </p>
          <p>MVP — For Research Use Only</p>
        </div>
      </div>
    </aside>
  );
}