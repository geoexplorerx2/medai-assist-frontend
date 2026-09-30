'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import {
  Plus,
  PlusCircle,
  MessageSquare,
  Trash2,
  X,
  Filter,
  Stethoscope,
  Calendar,
  LogOut,
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
    currentDoctor,
    setProfileModalOpen,
    setContributeModalOpen,
    logout,
  } = useChatStore();

  const sidebarContent = (
    <div id="sidebar-inner-content" dir="rtl" className="flex flex-col h-full bg-slate-900 text-slate-300 select-none">
      {/* Sidebar Header */}
      <div id="sidebar-header-box" className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div id="sidebar-logo-group" className="flex items-center gap-3">
          <Logo size={36} />
          <div id="sidebar-app-name-box">
            <h1 id="sidebar-app-title" className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              دستیار هوشمند MedAI
              <span id="sidebar-version-badge" className="text-[9px] px-1.5 py-0.2 bg-teal-600 text-white rounded font-mono">v1.3</span>
            </h1>
            <p id="sidebar-app-desc" className="text-[10px] text-slate-400">سامانه هوش مصنوعی بالینی</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          id="sidebar-mobile-close-btn"
          onClick={() => setMobileSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X id="sidebar-close-icon" className="w-5 h-5" />
        </button>
      </div>

      {/* Action CTAs */}
      <div id="sidebar-action-buttons" className="p-3 space-y-2">
        <button
          id="sidebar-new-consultation-action-btn"
          onClick={() => createSession()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs md:text-sm font-semibold transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <Plus id="sidebar-plus-action-icon" className="w-4 h-4" />
          <span id="sidebar-new-consultation-btn-text">مشاوره بالینی جدید</span>
        </button>

        {currentDoctor?.can_contribute_case !== false && (
          <button
            id="sidebar-contribute-case-btn"
            onClick={() => {
              setContributeModalOpen(true);
              setMobileSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 hover:border-teal-500/60 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all shadow-xs active:scale-98 group cursor-pointer"
          >
            <PlusCircle id="sidebar-contribute-icon" className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
            <span id="sidebar-contribute-text">مشارکت در ثبت مورد بالینی</span>
          </button>
        )}
      </div>

      {/* Medical Specialty Domain Filter */}
      {availableSpecialties.length > 0 && (
        <div id="sidebar-domain-filter-section" className="px-3 py-2 border-b border-slate-800/80">
          <div id="sidebar-filter-header" className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5 px-1">
            <span id="sidebar-filter-label" className="flex items-center gap-1">
              <Filter id="sidebar-filter-icon" className="w-3 h-3 text-teal-400" />
              فیلتر دامنه تخصص
            </span>
            {selectedSpecialty && (
              <button
                id="sidebar-reset-filter-btn"
                onClick={() => setSelectedSpecialty(null)}
                className="text-[10px] text-teal-400 hover:underline cursor-pointer"
              >
                حذف فیلتر
              </button>
            )}
          </div>
          <select
            id="sidebar-specialty-select"
            value={selectedSpecialty || ''}
            onChange={(e) => setSelectedSpecialty(e.target.value || null)}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
          >
            <option id="sidebar-specialty-option-auto" value="">✨ تشخیص خودکار هوشمند (همه تخصص‌ها)</option>
            {availableSpecialties.map((s, idx) => (
              <option id={`sidebar-specialty-option-${idx}`} key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Consultations List */}
      <div id="sidebar-sessions-list-container" className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        <div id="sidebar-sessions-header" className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-slate-400">
          <span id="sidebar-sessions-title">سوابق مشاوره‌ها و پرونده‌ها</span>
          <span id="sidebar-sessions-count-badge" className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {sessions.length}
          </span>
        </div>

        {sessions.length === 0 ? (
          <div id="sidebar-empty-sessions-box" className="text-center py-10 px-4">
            <Stethoscope id="sidebar-empty-stethoscope-icon" className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
            <p id="sidebar-empty-sessions-text" className="text-xs text-slate-400 font-medium">هنوز مشاوره‌ای ثبت نشده است</p>
            <p id="sidebar-empty-sessions-subtext" className="text-[10px] text-slate-500 mt-1 leading-relaxed">
              برای جستجو و تحلیل سوابق پزشکی، یک گفتگوی جدید آغاز کنید.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {sessions.map((sess) => {
              const isActive = sess.id === currentSessionId;
              const dateStr = new Date(sess.createdAt).toLocaleDateString('fa-IR', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <motion.div
                  id={`sidebar-session-item-${sess.id}`}
                  key={sess.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-all border ${
                    isActive
                      ? 'bg-slate-800 text-white border-teal-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent'
                  }`}
                  onClick={() => setCurrentSession(sess.id)}
                >
                  <MessageSquare
                    id={`sidebar-session-icon-${sess.id}`}
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  />
                  <div id={`sidebar-session-info-${sess.id}`} className="flex-1 min-w-0">
                    <p id={`sidebar-session-title-${sess.id}`} className={`truncate font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {sess.title}
                    </p>
                    <div id={`sidebar-session-meta-${sess.id}`} className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span id={`sidebar-session-date-${sess.id}`} className="flex items-center gap-0.5">
                        <Calendar id={`sidebar-session-cal-${sess.id}`} className="w-2.5 h-2.5" />
                        {dateStr}
                      </span>
                      {sess.messages.length > 0 && (
                        <span id={`sidebar-session-msgcount-${sess.id}`}>• {sess.messages.length} پیام</span>
                      )}
                    </div>
                  </div>

                  <button
                    id={`sidebar-delete-session-btn-${sess.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(sess.id);
                    }}
                    title="حذف گفتگو"
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity cursor-pointer"
                  >
                    <Trash2 id={`sidebar-trash-icon-${sess.id}`} className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* User Profile Footer in Sidebar */}
      {currentDoctor && (
        <div id="sidebar-user-footer-box" className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div
            id="sidebar-user-profile-trigger"
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer group"
          >
            <div id="sidebar-user-avatar-circle" className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0">
              {currentDoctor.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div id="sidebar-user-details-text" className="min-w-0 flex-1">
              <p id="sidebar-user-username-text" className="text-xs font-bold text-white truncate group-hover:text-teal-400 transition-colors">
                {currentDoctor.username}
              </p>
              <p id="sidebar-user-role-text" className="text-[10px] text-slate-400 truncate">
                {currentDoctor.role === 'admin' ? 'مدیر سیستم' : 'پزشک کاربر'}
              </p>
            </div>
            <button
              id="sidebar-logout-btn"
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              title="خروج از سامانه"
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut id="sidebar-logout-icon" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside id="app-desktop-sidebar" className="hidden md:flex w-72 lg:w-80 flex-col h-screen flex-shrink-0 border-l border-slate-800 shadow-xl z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              id="sidebar-mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
            />

            {/* Slide-out Drawer */}
            <motion.div
              id="sidebar-mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="md:hidden fixed inset-y-0 right-0 w-4/5 max-w-xs z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}