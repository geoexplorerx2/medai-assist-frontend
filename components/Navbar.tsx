'use client';

import { useChatStore } from '@/store/chatStore';
import { Menu, Plus, Stethoscope, User, ChevronDown } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const {
    sessions,
    currentSessionId,
    createSession,
    toggleMobileSidebar,
    isBackendHealthy,
    selectedSpecialty,
    currentDoctor,
    setProfileModalOpen,
  } = useChatStore();

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <header className="glass sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:px-6 border-b border-slate-200">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={toggleMobileSidebar}
          aria-label="Toggle Navigation Drawer"
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand & Title */}
        <div className="flex items-center gap-2.5">
          <Logo size={32} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm md:text-base tracking-tight">
                MedAI-Assist
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Stethoscope className="w-3 h-3" />
                Clinical RAG
              </span>
            </div>
            {currentSession && (
              <p className="text-[11px] text-slate-500 truncate max-w-[180px] sm:max-w-[280px] md:max-w-[380px]">
                {currentSession.title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Action & Status Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Specialty Pill */}
        {selectedSpecialty && (
          <span className="hidden lg:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-medium">
            Specialty: {selectedSpecialty}
          </span>
        )}

        {/* Backend Status Indicator */}
        <div
          title={isBackendHealthy ? 'Backend Engine Connected (FastAPI)' : 'Connecting to Engine...'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            isBackendHealthy
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="hidden sm:inline">
            {isBackendHealthy ? 'System Active' : 'Connecting...'}
          </span>
        </div>

        {/* New Consultation Shortcut */}
        <button
          onClick={() => createSession()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Consultation</span>
        </button>

        {/* Doctor Profile Badge */}
        {currentDoctor && (
          <button
            onClick={() => setProfileModalOpen(true)}
            title="View Doctor Profile"
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {currentDoctor.full_name.replace('Dr. ', '').charAt(0)}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="truncate max-w-[110px] leading-tight font-bold text-slate-800 group-hover:text-blue-600">
                {currentDoctor.full_name}
              </span>
              <span className="text-[10px] text-slate-500 truncate max-w-[110px] leading-tight">
                {currentDoctor.specialty}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 ml-0.5" />
          </button>
        )}
      </div>
    </header>
  );
}
