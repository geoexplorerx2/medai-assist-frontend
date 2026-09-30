'use client';

import { motion } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import {
  X,
  User,
  ShieldCheck,
  Calendar,
  LogOut,
  FileText,
  Mic,
  Database,
  CheckCircle2,
  XCircle,
  Shield
} from 'lucide-react';

export default function DoctorProfileModal() {
  const {
    currentDoctor,
    isProfileModalOpen,
    setProfileModalOpen,
    logout,
    sessions,
  } = useChatStore();

  if (!isProfileModalOpen || !currentDoctor) return null;

  const memberDate = currentDoctor.created_at
    ? new Date(currentDoctor.created_at).toLocaleDateString('fa-IR', {
        month: 'short',
        year: 'numeric',
      })
    : 'به تازگی';

  return (
    <div id="doctor-profile-modal-backdrop" dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        id="doctor-profile-modal-container"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="glass w-full max-w-md rounded-3xl shadow-2xl border border-white/60 overflow-hidden bg-white relative z-10"
      >
        {/* Header Ribbon */}
        <div id="doctor-profile-header-ribbon" className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div id="doctor-profile-header-info" className="flex items-center gap-3">
            <div id="doctor-profile-avatar-initial" className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-bold border border-white/30 shadow-inner">
              {currentDoctor.username.charAt(0).toUpperCase()}
            </div>
            <div id="doctor-profile-header-titles">
              <h2 id="doctor-profile-header-fullname" className="text-lg font-bold flex items-center gap-1.5">
                کاربر: {currentDoctor.username}
              </h2>
              <p id="doctor-profile-header-specialty" className="text-xs text-teal-100 flex items-center gap-1">
                <Shield id="doctor-profile-header-shield" className="w-3.5 h-3.5" />
                نقش کاربری: {currentDoctor.role === 'admin' ? 'مدیر سیستم (Admin)' : 'پزشک (Doctor)'}
              </p>
            </div>
          </div>

          <button
            id="doctor-profile-close-btn"
            type="button"
            onClick={() => setProfileModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X id="doctor-profile-close-icon" className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div id="doctor-profile-body-content" className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {/* Doctor Stats Cards */}
          <div id="doctor-profile-stats-grid" className="grid grid-cols-2 gap-3">
            <div id="doctor-profile-stat-sessions" className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <span id="doctor-profile-stat-sessions-label" className="text-[10px] font-semibold text-slate-400 block">
                مجموع جلسات مشاوره
              </span>
              <span id="doctor-profile-stat-sessions-val" className="text-xl font-bold text-slate-800 mt-0.5 block">
                {sessions.length} جلسه
              </span>
            </div>
            <div id="doctor-profile-stat-status" className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <span id="doctor-profile-stat-status-label" className="text-[10px] font-semibold text-slate-400 block">
                وضعیت حساب
              </span>
              <span id="doctor-profile-stat-status-val" className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                <ShieldCheck id="doctor-profile-stat-shield-icon" className="w-4 h-4 text-emerald-600" />
                {currentDoctor.is_active !== false ? 'فعال و مجاز' : 'غیرفعال'}
              </span>
            </div>
          </div>

          {/* Profile Details List */}
          <div id="doctor-profile-details-list" className="divide-y divide-slate-100 text-xs bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
            <div id="doctor-profile-row-username" className="py-2 flex items-center justify-between">
              <span id="doctor-profile-username-label" className="text-slate-500 flex items-center gap-2 font-medium">
                <User id="doctor-profile-username-icon" className="w-4 h-4 text-slate-400" />
                نام کاربری
              </span>
              <span id="doctor-profile-username-val" className="font-semibold text-slate-800 font-mono dir-ltr">
                @{currentDoctor.username}
              </span>
            </div>

            <div id="doctor-profile-row-pdf" className="py-2 flex items-center justify-between">
              <span id="doctor-profile-pdf-label" className="text-slate-500 flex items-center gap-2 font-medium">
                <FileText id="doctor-profile-pdf-icon" className="w-4 h-4 text-slate-400" />
                دسترسی پیوست فایل و آزمایشات (PDF)
              </span>
              <span id="doctor-profile-pdf-val" className="font-semibold flex items-center gap-1">
                {currentDoctor.can_upload_pdf !== false ? (
                  <span id="doctor-profile-pdf-enabled" className="text-emerald-700 flex items-center gap-1 font-medium text-[11px]">
                    <CheckCircle2 id="doctor-pdf-check-icon" className="w-3.5 h-3.5 text-emerald-600" />
                    مجاز
                  </span>
                ) : (
                  <span id="doctor-profile-pdf-disabled" className="text-rose-600 flex items-center gap-1 font-medium text-[11px]">
                    <XCircle id="doctor-pdf-x-icon" className="w-3.5 h-3.5 text-rose-500" />
                    غیرمجاز
                  </span>
                )}
              </span>
            </div>

            <div id="doctor-profile-row-voice" className="py-2 flex items-center justify-between">
              <span id="doctor-profile-voice-label" className="text-slate-500 flex items-center gap-2 font-medium">
                <Mic id="doctor-profile-voice-icon" className="w-4 h-4 text-slate-400" />
                دسترسی دیکته و ضبط صوتی
              </span>
              <span id="doctor-profile-voice-val" className="font-semibold flex items-center gap-1">
                {currentDoctor.can_record_voice !== false ? (
                  <span id="doctor-profile-voice-enabled" className="text-emerald-700 flex items-center gap-1 font-medium text-[11px]">
                    <CheckCircle2 id="doctor-voice-check-icon" className="w-3.5 h-3.5 text-emerald-600" />
                    مجاز
                  </span>
                ) : (
                  <span id="doctor-profile-voice-disabled" className="text-rose-600 flex items-center gap-1 font-medium text-[11px]">
                    <XCircle id="doctor-voice-x-icon" className="w-3.5 h-3.5 text-rose-500" />
                    غیرمجاز
                  </span>
                )}
              </span>
            </div>

            <div id="doctor-profile-row-contribute" className="py-2 flex items-center justify-between">
              <span id="doctor-profile-contribute-label" className="text-slate-500 flex items-center gap-2 font-medium">
                <Database id="doctor-profile-contribute-icon" className="w-4 h-4 text-slate-400" />
                دسترسی ثبت و مشارکت در پرونده
              </span>
              <span id="doctor-profile-contribute-val" className="font-semibold flex items-center gap-1">
                {currentDoctor.can_contribute_case !== false ? (
                  <span id="doctor-profile-contribute-enabled" className="text-emerald-700 flex items-center gap-1 font-medium text-[11px]">
                    <CheckCircle2 id="doctor-contribute-check-icon" className="w-3.5 h-3.5 text-emerald-600" />
                    مجاز
                  </span>
                ) : (
                  <span id="doctor-profile-contribute-disabled" className="text-rose-600 flex items-center gap-1 font-medium text-[11px]">
                    <XCircle id="doctor-contribute-x-icon" className="w-3.5 h-3.5 text-rose-500" />
                    غیرمجاز
                  </span>
                )}
              </span>
            </div>

            <div id="doctor-profile-row-date" className="py-2 flex items-center justify-between">
              <span id="doctor-profile-date-label" className="text-slate-500 flex items-center gap-2 font-medium">
                <Calendar id="doctor-profile-date-icon" className="w-4 h-4 text-slate-400" />
                تاریخ ثبت حساب
              </span>
              <span id="doctor-profile-date-val" className="font-semibold text-slate-800">{memberDate}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div id="doctor-profile-actions-row" className="pt-2 flex items-center gap-3">
            <button
              id="doctor-profile-close-bottom-btn"
              type="button"
              onClick={() => setProfileModalOpen(false)}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              بستن
            </button>

            <button
              id="doctor-profile-logout-btn"
              type="button"
              onClick={() => {
                logout();
              }}
              className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors flex flex-row-reverse items-center gap-1.5 cursor-pointer"
            >
              <LogOut id="doctor-profile-logout-icon" className="w-3.5 h-3.5" />
              خروج از حساب
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
