'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import {
  Plus,
  MessageSquare,
  Trash2,
  X,
  Filter,
  Stethoscope,
  Activity,
  Calendar,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import Logo from './Logo';

export default function Sidebar() {
  const {
    sessions,
    currentSessionId,
    createSession,
    setCurrentSession,
    deleteSession,
    availableSpecialties,
    selectedSpecialty,
    setSelectedSpecialty,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    isBackendHealthy,
  } = useChatStore();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              MedAI-Assist
              <span className="text-[9px] px-1.5 py-0.2 bg-blue-600 text-white rounded font-mono">v1.2</span>
            </h1>
            <p className="text-[10px] text-slate-400">Clinical Intelligence SaaS</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Consultation CTA */}
      <div className="p-3">
        <button
          onClick={() => createSession()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs md:text-sm font-semibold transition-all shadow-md active:scale-98"
        >
          <Plus className="w-4 h-4" />
          New Consultation
        </button>
      </div>

      {/* Medical Specialty Domain Filter */}
      {availableSpecialties.length > 0 && (
        <div className="px-3 py-2 border-b border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5 px-1">
            <span className="flex items-center gap-1">
              <Filter className="w-3 h-3 text-cyan-400" />
              Domain Filter
            </span>
            {selectedSpecialty && (
              <button
                onClick={() => setSelectedSpecialty(null)}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <select
            value={selectedSpecialty || ''}
            onChange={(e) => setSelectedSpecialty(e.target.value || null)}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
          >
            <option value="">✨ Auto-Detect (All Specialties)</option>
            {availableSpecialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Consultations List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-slate-400">
          <span>Recent Consultations</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {sessions.length}
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Stethoscope className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-slate-400 font-medium">No consultations yet</p>
            <p className="text-[10px] text-slate-500 mt-1">
              Start a new session to query clinical transcriptions.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {sessions.map((sess) => {
              const isActive = sess.id === currentSessionId;
              const dateStr = new Date(sess.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              return (
                <motion.div
                  key={sess.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-all border ${
                    isActive
                      ? 'bg-slate-800 text-white border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent'
                  }`}
                  onClick={() => setCurrentSession(sess.id)}
                >
                  <MessageSquare
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`truncate font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {sess.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        {dateStr}
                      </span>
                      {sess.messages.length > 0 && (
                        <span>• {sess.messages.length} msg</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(sess.id);
                    }}
                    title="Delete Consultation"
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendHealthy ? 'bg-emerald-400 pulse-glow-green' : 'bg-amber-400'
            }`}
          />
          <span className="text-[10px]">
            {isBackendHealthy ? 'Engine Connected' : 'Connecting...'}
          </span>
        </div>
        <span className="text-[9px] text-slate-400">HIPAA Sandbox</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex w-72 lg:w-80 flex-col h-screen flex-shrink-0 border-r border-slate-800 shadow-xl z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="md:hidden fixed inset-y-0 left-0 w-4/5 max-w-xs z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}