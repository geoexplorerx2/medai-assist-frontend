'use client';

import { useChatStore } from '@/store/chatStore';
import { Menu, Plus } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const {
    sessions,
    currentSessionId,
    createSession,
    toggleMobileSidebar,
    isBackendHealthy,
    selectedSpecialty,
  } = useChatStore();

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <header id="app-navbar" className="glass sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:px-6 border-b border-slate-200">
      <div id="navbar-left-container" className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          id="navbar-mobile-toggle-btn"
          onClick={toggleMobileSidebar}
          aria-label="باز کردن منوی سایدبار"
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Menu id="navbar-menu-icon" className="w-5 h-5" />
        </button>

        {/* Brand & Title */}
        <div id="navbar-brand-wrapper" className="flex items-center gap-2.5">
          <Logo size={32} />
          <div id="navbar-titles-box">
            <div id="navbar-brand-title-row" className="flex items-center gap-2">
              <span id="navbar-brand-name" className="font-bold text-slate-900 text-sm md:text-base tracking-tight">
                دستیار هوشمند MedAI
              </span>
            </div>
            {currentSession && (
              <p id="navbar-current-session-title" className="text-[11px] text-slate-500 truncate max-w-[180px] sm:max-w-[280px] md:max-w-[380px]">
                {currentSession.title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action & Status Controls */}
      <div id="navbar-actions-container" className="flex items-center gap-2 sm:gap-3">
        {/* Active Specialty Pill */}
        {selectedSpecialty && (
          <span id="navbar-specialty-badge" className="hidden lg:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-medium">
            تخصص: {selectedSpecialty}
          </span>
        )}

        {/* Backend Status Indicator */}
        <div
          id="navbar-backend-status-badge"
          title={isBackendHealthy ? 'هسته پردازشی هوش مصنوعی فعال است' : 'در حال اتصال به سرور...'}
          className={`flex items-center justify-center p-1.5 rounded-full border transition-colors ${
            isBackendHealthy
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <span
            id="navbar-backend-status-dot"
            className={`w-2.5 h-2.5 rounded-full ${
              isBackendHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
        </div>

        {/* New Consultation Shortcut */}
        <button
          id="navbar-new-consultation-btn"
          onClick={() => createSession()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Plus id="navbar-plus-icon" className="w-4 h-4" />
          <span id="navbar-new-consultation-text" className="hidden sm:inline">مشاوره جدید</span>
        </button>
      </div>
    </header>
  );
}
