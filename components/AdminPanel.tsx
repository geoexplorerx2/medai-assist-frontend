'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import {
  Database,
  UserPlus,
  Sliders,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Users,
  Shield,
  FileText,
  Mic,
  RefreshCw,
  LogOut,
  Lock,
  UserCheck,
  UserX,
  KeyRound,
  Sparkles,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { DoctorRegisterRequest } from '@/lib/types';

export default function AdminPanel() {
  const {
    currentDoctor,
    logout,
    systemSettings,
    updateSystemSettingsAction,
    adminDoctors,
    loadAdminDoctors,
    createDoctorByAdminAction,
    updateUserPermissionsAction,
    deleteDoctorByAdminAction,
    importDatasetAction,
    isAdminLoading,
    adminError,
    loadSpecialties,
  } = useChatStore();

  const [activeTab, setActiveTab] = useState<'dataset' | 'create_user' | 'users_permissions' | 'features'>('users_permissions');

  // Dataset Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [datasetMsg, setDatasetMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isVectorizing, setIsVectorizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Doctor Form State (ONLY username, password, repeat password)
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRepeatPassword, setNewRepeatPassword] = useState('');
  const [docCreateSuccess, setDocCreateSuccess] = useState<string | null>(null);
  const [docCreateError, setDocCreateError] = useState<string | null>(null);

  // Feature Toggles State
  const [enablePdf, setEnablePdf] = useState(systemSettings.enable_pdf_attachment);
  const [enableVoice, setEnableVoice] = useState(systemSettings.enable_voice_recording);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // User Permissions Editing State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<'admin' | 'doctor'>('doctor');
  const [editPdf, setEditPdf] = useState(true);
  const [editVoice, setEditVoice] = useState(true);
  const [editContributeCase, setEditContributeCase] = useState(true);
  const [editActive, setEditActive] = useState(true);
  const [editNewPassword, setEditNewPassword] = useState('');
  const [permSuccess, setPermSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAdminDoctors();
    loadSpecialties();
  }, [loadAdminDoctors, loadSpecialties]);

  useEffect(() => {
    setEnablePdf(systemSettings.enable_pdf_attachment);
    setEnableVoice(systemSettings.enable_voice_recording);
  }, [systemSettings]);

  // Handle Dataset Upload & Vectorize
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.json')) {
        setDatasetMsg({ type: 'error', text: 'لطفاً فقط فایل JSON دیتاست پزشکی انتخاب کنید.' });
        return;
      }
      setSelectedFile(file);
      setDatasetMsg(null);
    }
  };

  const handleDatasetSubmit = async () => {
    if (!selectedFile) return;
    setIsVectorizing(true);
    setDatasetMsg(null);

    const res = await importDatasetAction(selectedFile);
    setIsVectorizing(false);

    if (res.success) {
      setDatasetMsg({ type: 'success', text: res.message });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setDatasetMsg({ type: 'error', text: res.message });
    }
  };

  // Handle Create Doctor / User (ONLY username, password, repeat password)
  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocCreateError(null);
    setDocCreateSuccess(null);

    if (!newUsername.trim()) {
      setDocCreateError('لطفاً نام کاربری را وارد کنید.');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setDocCreateError('رمز عبور باید حداقل ۴ کاراکتر باشد.');
      return;
    }
    if (newPassword !== newRepeatPassword) {
      setDocCreateError('رمز عبور و تکرار آن یکسان نیستند.');
      return;
    }

    const data: DoctorRegisterRequest = {
      username: newUsername.trim(),
      password: newPassword,
      repeat_password: newRepeatPassword,
    };

    const success = await createDoctorByAdminAction(data);
    if (success) {
      setDocCreateSuccess(`حساب کاربری "${newUsername}" با موفقیت ایجاد شد.`);
      setNewUsername('');
      setNewPassword('');
      setNewRepeatPassword('');
      setTimeout(() => setDocCreateSuccess(null), 5000);
    }
  };

  // Open Permission Modal / Edit for a User
  const handleStartEditPerms = (user: any) => {
    setEditingUserId(user.id);
    setEditRole(user.role === 'admin' ? 'admin' : 'doctor');
    setEditPdf(user.can_upload_pdf !== false);
    setEditVoice(user.can_record_voice !== false);
    setEditContributeCase(user.can_contribute_case !== false);
    setEditActive(user.is_active !== false);
    setEditNewPassword('');
    setPermSuccess(null);
  };

  // Save Updated Permissions
  const handleSavePerms = async () => {
    if (!editingUserId) return;
    const updates: any = {
      role: editRole,
      can_upload_pdf: editPdf,
      can_record_voice: editVoice,
      can_contribute_case: editContributeCase,
      is_active: editActive,
    };
    if (editNewPassword.trim()) {
      updates.password = editNewPassword.trim();
    }

    const success = await updateUserPermissionsAction(editingUserId, updates);
    if (success) {
      setPermSuccess('دسترسی‌های کاربر با موفقیت به‌روزرسانی شد.');
      setTimeout(() => {
        setPermSuccess(null);
        setEditingUserId(null);
      }, 1500);
    }
  };

  // Handle Delete Doctor
  const handleDeleteDoctor = async (id: string, name: string) => {
    if (confirm(`آیا از حذف حساب کاربری "${name}" اطمینان دارید؟`)) {
      await deleteDoctorByAdminAction(id);
    }
  };

  // Handle Global Feature Toggles Save
  const handleSaveFeatures = async () => {
    const success = await updateSystemSettingsAction({
      enable_pdf_attachment: enablePdf,
      enable_voice_recording: enableVoice,
    });
    if (success) {
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 4000);
    }
  };

  return (
    <div id="admin-panel-root" dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Navbar */}
      <header id="admin-header" className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div id="admin-header-brand" className="flex items-center gap-3">
          <div id="admin-shield-icon-box" className="p-2 bg-teal-500/20 border border-teal-500/30 rounded-xl text-teal-400">
            <Shield id="admin-shield-icon" className="w-5 h-5" />
          </div>
          <div id="admin-header-title-box">
            <div id="admin-header-brand-row" className="flex items-center gap-2">
              <h1 id="admin-header-title" className="font-bold text-base sm:text-lg text-slate-100">پنل مدیریت ارشد سامانه</h1>
            </div>
          </div>
        </div>

        <div id="admin-header-actions" className="flex items-center gap-3">
          <div id="admin-user-summary" className="text-left hidden sm:block">
            <span id="admin-user-badge" className="text-[10px] text-teal-400 block">مدیر سیستم</span>
          </div>
          <button
            id="admin-logout-btn"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs transition-colors cursor-pointer"
          >
            <LogOut id="admin-logout-icon" className="w-3.5 h-3.5" />
            <span id="admin-logout-text">خروج</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main id="admin-main-container" className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div id="admin-tabs-nav" className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-3">
          <button
            id="admin-tab-users-perms-btn"
            onClick={() => setActiveTab('users_permissions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'users_permissions'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Users id="admin-tab-users-icon" className="w-4 h-4" />
            <span id="admin-tab-users-text">۱. مشاهده کاربران و مدیریت سطوح دسترسی</span>
          </button>

          <button
            id="admin-tab-create-user-btn"
            onClick={() => setActiveTab('create_user')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'create_user'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <UserPlus id="admin-tab-create-user-icon" className="w-4 h-4" />
            <span id="admin-tab-create-user-text">۲. ایجاد حساب کاربری جدید (پزشک/ادمین)</span>
          </button>

          <button
            id="admin-tab-dataset-btn"
            onClick={() => setActiveTab('dataset')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'dataset'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Database id="admin-tab-dataset-icon" className="w-4 h-4" />
            <span id="admin-tab-dataset-text">۳. ارتقای دیتاست و بازسازی وکتورها</span>
          </button>

          <button
            id="admin-tab-features-btn"
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'features'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Sliders id="admin-tab-features-icon" className="w-4 h-4" />
            <span id="admin-tab-features-text">۴. کنترل سراسری امکانات</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {adminError && (
          <div id="admin-global-error-banner" className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle id="admin-global-error-icon" className="w-5 h-5 shrink-0 text-red-400" />
            <span id="admin-global-error-text">{adminError}</span>
          </div>
        )}

        {/* TAB 1: ALL USERS & PERMISSIONS MANAGEMENT */}
        {activeTab === 'users_permissions' && (
          <motion.div
            id="admin-users-perms-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div id="admin-users-table-card" className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6">
              <div id="admin-users-table-header" className="flex items-center justify-between mb-4">
                <div id="admin-users-table-title-group" className="flex items-center gap-2">
                  <Users id="admin-users-header-icon" className="w-5 h-5 text-teal-400" />
                  <h3 id="admin-users-table-title" className="text-base font-bold text-slate-100">
                    لیست تمام کاربران و سطوح دسترسی ({adminDoctors.length})
                  </h3>
                </div>
                <button
                  id="admin-refresh-users-btn"
                  onClick={loadAdminDoctors}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                  title="تازه‌سازی لیست"
                >
                  <RefreshCw id="admin-refresh-icon" className="w-3.5 h-3.5" />
                  <span id="admin-refresh-text">تازه‌سازی</span>
                </button>
              </div>

              {/* Users Table */}
              <div id="admin-users-table-wrapper" className="overflow-x-auto">
                <table id="admin-users-table" className="w-full text-right text-xs">
                  <thead id="admin-users-thead" className="text-slate-400 border-b border-slate-800 bg-slate-950/40">
                    <tr id="admin-users-thead-row">
                      <th id="th-user" className="p-3">نام کاربری</th>
                      <th id="th-role" className="p-3">نقش</th>
                      <th id="th-pdf" className="p-3">پیوست PDF</th>
                      <th id="th-voice" className="p-3">دیکته صوتی</th>
                      <th id="th-contribute" className="p-3">ثبت پرونده</th>
                      <th id="th-status" className="p-3">وضعیت حساب</th>
                      <th id="th-actions" className="p-3 text-center">عملیات و ویرایش دسترسی</th>
                    </tr>
                  </thead>
                  <tbody id="admin-users-tbody" className="divide-y divide-slate-800/60">
                    {adminDoctors.map((user) => (
                      <tr id={`user-row-${user.id}`} key={user.id} className="hover:bg-slate-800/30 transition-colors">
                        <td id={`user-col-name-${user.id}`} className="p-3 font-semibold text-slate-200 font-mono">
                          {user.username}
                        </td>
                        <td id={`user-col-role-${user.id}`} className="p-3">
                          <span
                            id={`user-role-badge-${user.id}`}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              user.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            }`}
                          >
                            {user.role === 'admin' ? 'مدیر سیستم' : 'پزشک'}
                          </span>
                        </td>
                        <td id={`user-col-pdf-${user.id}`} className="p-3">
                          <span id={`user-pdf-status-${user.id}`} className={`font-medium ${user.can_upload_pdf !== false ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {user.can_upload_pdf !== false ? '✓ مجاز' : '✕ غیرمجاز'}
                          </span>
                        </td>
                        <td id={`user-col-voice-${user.id}`} className="p-3">
                          <span id={`user-voice-status-${user.id}`} className={`font-medium ${user.can_record_voice !== false ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {user.can_record_voice !== false ? '✓ مجاز' : '✕ غیرمجاز'}
                          </span>
                        </td>
                        <td id={`user-col-contribute-${user.id}`} className="p-3">
                          <span id={`user-contribute-status-${user.id}`} className={`font-medium ${user.can_contribute_case !== false ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {user.can_contribute_case !== false ? '✓ مجاز' : '✕ غیرمجاز'}
                          </span>
                        </td>
                        <td id={`user-col-status-${user.id}`} className="p-3">
                          <span
                            id={`user-status-badge-${user.id}`}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              user.is_active !== false
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-red-500/15 text-red-400'
                            }`}
                          >
                            {user.is_active !== false ? 'فعال' : 'مسدود'}
                          </span>
                        </td>
                        <td id={`user-col-actions-${user.id}`} className="p-3 text-center">
                          <div id={`user-actions-box-${user.id}`} className="flex items-center justify-center gap-2">
                            <button
                              id={`user-edit-perm-btn-${user.id}`}
                              onClick={() => handleStartEditPerms(user)}
                              className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg transition-colors cursor-pointer"
                            >
                              تغییر دسترسی‌ها
                            </button>

                            {user.username !== 'admin' && (
                              <button
                                id={`user-delete-btn-${user.id}`}
                                onClick={() => handleDeleteDoctor(user.id, user.username)}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors cursor-pointer"
                                title="حذف کاربر"
                              >
                                <Trash2 id={`user-trash-icon-${user.id}`} className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Permission Edit Modal */}
            <AnimatePresence>
              {editingUserId && (
                <div id="perm-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                  <motion.div
                    id="perm-modal-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-xs space-y-4"
                  >
                    <div id="perm-modal-header" className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 id="perm-modal-title" className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <Sliders id="perm-modal-icon" className="w-4 h-4 text-teal-400" />
                        تغییر سطح دسترسی کاربر
                      </h4>
                      <button
                        id="perm-modal-close-btn"
                        onClick={() => setEditingUserId(null)}
                        className="text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {permSuccess && (
                      <div id="perm-modal-success-alert" className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center gap-2">
                        <CheckCircle2 id="perm-modal-success-icon" className="w-4 h-4 shrink-0" />
                        <span id="perm-modal-success-text">{permSuccess}</span>
                      </div>
                    )}

                    {/* Role selector */}
                    <div id="perm-role-group">
                      <label id="perm-role-label" className="block text-slate-300 mb-1 font-semibold">نقش کاربری</label>
                      <select
                        id="perm-role-select"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as 'admin' | 'doctor')}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
                      >
                        <option id="perm-opt-doctor" value="doctor">پزشک (Doctor)</option>
                        <option id="perm-opt-admin" value="admin">مدیر ارشد سامانه (Admin)</option>
                      </select>
                    </div>

                    {/* PDF upload permission toggle */}
                    <div id="perm-pdf-toggle-row" className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span id="perm-pdf-label" className="text-slate-300">مجوز پیوست فایل و آزمایشات PDF</span>
                      <input
                        id="perm-pdf-checkbox"
                        type="checkbox"
                        checked={editPdf}
                        onChange={(e) => setEditPdf(e.target.checked)}
                        className="w-4 h-4 accent-teal-500 cursor-pointer"
                      />
                    </div>

                    {/* Voice dictation permission toggle */}
                    <div id="perm-voice-toggle-row" className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span id="perm-voice-label" className="text-slate-300">مجوز ضبط صدا و دیکته صوتی</span>
                      <input
                        id="perm-voice-checkbox"
                        type="checkbox"
                        checked={editVoice}
                        onChange={(e) => setEditVoice(e.target.checked)}
                        className="w-4 h-4 accent-teal-500 cursor-pointer"
                      />
                    </div>

                    {/* Contribute Case permission toggle */}
                    <div id="perm-contribute-toggle-row" className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span id="perm-contribute-label" className="text-slate-300">مجوز ثبت و مشارکت در پرونده‌های بالینی</span>
                      <input
                        id="perm-contribute-checkbox"
                        type="checkbox"
                        checked={editContributeCase}
                        onChange={(e) => setEditContributeCase(e.target.checked)}
                        className="w-4 h-4 accent-teal-500 cursor-pointer"
                      />
                    </div>

                    {/* Active status toggle */}
                    <div id="perm-active-toggle-row" className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span id="perm-active-label" className="text-slate-300">وضعیت فعال بودن حساب کاربری</span>
                      <input
                        id="perm-active-checkbox"
                        type="checkbox"
                        checked={editActive}
                        onChange={(e) => setEditActive(e.target.checked)}
                        className="w-4 h-4 accent-teal-500 cursor-pointer"
                      />
                    </div>

                    {/* Optional Reset password */}
                    <div id="perm-reset-pwd-group">
                      <label id="perm-reset-pwd-label" className="block text-slate-300 mb-1">تغییر رمز عبور (در صورت تمایل)</label>
                      <input
                        id="perm-reset-pwd-input"
                        type="password"
                        value={editNewPassword}
                        onChange={(e) => setEditNewPassword(e.target.value)}
                        placeholder="رمز عبور جدید..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-teal-500 dir-rtl text-right"
                      />
                    </div>

                    <div id="perm-modal-actions" className="flex items-center justify-end gap-2 pt-2">
                      <button
                        id="perm-modal-cancel-btn"
                        type="button"
                        onClick={() => setEditingUserId(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                      >
                        انصراف
                      </button>
                      <button
                        id="perm-modal-save-btn"
                        type="button"
                        onClick={handleSavePerms}
                        className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl cursor-pointer"
                      >
                        ذخیره تغییرات دسترسی
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* TAB 2: CREATE NEW USER (ONLY USERNAME, PASSWORD, REPEAT PASSWORD) */}
        {activeTab === 'create_user' && (
          <motion.div
            id="admin-create-user-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8"
          >
            <div id="create-user-header" className="flex items-center gap-3 mb-6">
              <div id="create-user-icon-box" className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-teal-400">
                <UserPlus id="create-user-header-icon" className="w-6 h-6" />
              </div>
              <div id="create-user-title-box">
                <h2 id="create-user-heading" className="text-lg font-bold text-slate-100">ایجاد حساب کاربری پزشک</h2>
                <p id="create-user-subheading" className="text-xs text-slate-400">
                  تنها با وارد کردن نام کاربری و رمز عبور حساب جدید ایجاد کنید.
                </p>
              </div>
            </div>

            {docCreateSuccess && (
              <div id="create-user-success-alert" className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 id="create-user-success-icon" className="w-4 h-4 shrink-0" />
                <span id="create-user-success-text">{docCreateSuccess}</span>
              </div>
            )}

            {docCreateError && (
              <div id="create-user-error-alert" className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle id="create-user-error-icon" className="w-4 h-4 shrink-0" />
                <span id="create-user-error-text">{docCreateError}</span>
              </div>
            )}

            <form id="create-user-form" onSubmit={handleCreateDoctor} className="space-y-4 text-xs">
              <div id="create-username-group">
                <label id="create-username-label" className="block text-slate-300 mb-1.5 font-semibold">
                  نام کاربری (Username) *
                </label>
                <input
                  id="create-username-input"
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="مثال: dr_rezaei"
                  className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 dir-ltr text-left"
                />
              </div>

              <div id="create-password-group">
                <label id="create-password-label" className="block text-slate-300 mb-1.5 font-semibold">
                  رمز عبور (Password) *
                </label>
                <input
                  id="create-password-input"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 dir-ltr text-left"
                />
              </div>

              <div id="create-repeat-password-group">
                <label id="create-repeat-password-label" className="block text-slate-300 mb-1.5 font-semibold">
                  تکرار رمز عبور (Repeat Password) *
                </label>
                <input
                  id="create-repeat-password-input"
                  type="password"
                  required
                  value={newRepeatPassword}
                  onChange={(e) => setNewRepeatPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 dir-ltr text-left"
                />
              </div>

              <button
                id="create-user-submit-btn"
                type="submit"
                disabled={isAdminLoading || !newUsername.trim() || !newPassword}
                className="w-full mt-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                {isAdminLoading ? <Loader2 id="create-user-spinner" className="w-4 h-4 animate-spin" /> : <UserPlus id="create-user-btn-icon" className="w-4 h-4" />}
                <span id="create-user-btn-text">ثبت و ایجاد حساب کاربری</span>
              </button>
            </form>
          </motion.div>
        )}

        {/* TAB 3: DATASET MANAGEMENT & VECTOR REFRESH */}
        {activeTab === 'dataset' && (
          <motion.div
            id="admin-dataset-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div id="admin-dataset-upload-card" className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
              <div id="dataset-card-header" className="flex items-center gap-3 mb-4">
                <div id="dataset-icon-box" className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                  <Database id="dataset-header-icon" className="w-6 h-6" />
                </div>
                <div id="dataset-title-box">
                  <h2 id="dataset-heading" className="text-lg font-bold text-slate-100">بارگذاری دیتاست و بازسازی وکتورها</h2>
                  <p id="dataset-desc" className="text-xs text-slate-400">
                    فایل JSON دیتاست را بارگذاری کنید تا خودکار وکتورایز و در ChromaDB ثبت شود.
                  </p>
                </div>
              </div>

              {/* Upload Zone */}
              <div
                id="dataset-drop-zone"
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 border-2 border-dashed border-slate-700 hover:border-teal-500/60 bg-slate-950/40 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <input
                  id="dataset-file-input"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
                <div id="dataset-upload-icon-container" className="p-4 rounded-full bg-slate-800/60 group-hover:bg-teal-500/20 text-slate-400 group-hover:text-teal-300 transition-all">
                  <Upload id="dataset-upload-icon" className="w-8 h-8" />
                </div>
                <div id="dataset-upload-text-box">
                  <p id="dataset-upload-prompt-text" className="text-sm font-semibold text-slate-200">
                    {selectedFile ? selectedFile.name : 'کلیک کنید یا فایل JSON دیتاست را به اینجا بکشید'}
                  </p>
                  <p id="dataset-upload-hint-text" className="text-xs text-slate-500 mt-1">
                    {selectedFile
                      ? `حجم فایل: ${(selectedFile.size / 1024 / 1024).toFixed(2)} مگابایت`
                      : 'پشتیبانی از ساختار استاندارد MTSamples (شامل rows, transcription, medical_specialty)'}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div id="dataset-submit-wrapper" className="mt-6 flex items-center justify-end">
                <button
                  id="dataset-submit-btn"
                  type="button"
                  onClick={handleDatasetSubmit}
                  disabled={!selectedFile || isVectorizing}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {isVectorizing ? (
                    <>
                      <Loader2 id="dataset-loader-icon" className="w-4 h-4 animate-spin" />
                      <span id="dataset-loader-text">در حال وکتورایز و بازسازی ChromaDB...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw id="dataset-refresh-icon" className="w-4 h-4" />
                      <span id="dataset-refresh-text">شروع بارگذاری و بازسازی وکتورها</span>
                    </>
                  )}
                </button>
              </div>

              {/* Alert Feedback */}
              {datasetMsg && (
                <div
                  id="dataset-feedback-alert"
                  className={`mt-6 p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 ${
                    datasetMsg.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}
                >
                  {datasetMsg.type === 'success' ? (
                    <CheckCircle2 id="dataset-feedback-success-icon" className="w-5 h-5 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle id="dataset-feedback-error-icon" className="w-5 h-5 shrink-0 text-red-400" />
                  )}
                  <span id="dataset-feedback-text">{datasetMsg.text}</span>
                </div>
              )}
            </div>

            {/* Ingestion Info Card */}
            <div id="dataset-info-card" className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
              <div id="dataset-info-content">
                <h3 id="dataset-info-title" className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <Sparkles id="dataset-sparkle-icon" className="w-4 h-4 text-teal-400" />
                  پایپ‌لاین پردازش دیتاست
                </h3>
                <ul id="dataset-info-list" className="text-xs text-slate-400 space-y-3 leading-relaxed">
                  <li id="dataset-info-item-1" className="flex items-start gap-2">
                    <span id="dataset-dot-1" className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                    <span id="dataset-desc-1">الگوریتم Semantic Chunking روی سوابق اجرا می‌شود.</span>
                  </li>
                  <li id="dataset-info-item-2" className="flex items-start gap-2">
                    <span id="dataset-dot-2" className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                    <span id="dataset-desc-2">مدل Embedding وکتورها را تولید و در ChromaDB بازنویسی می‌کند.</span>
                  </li>
                  <li id="dataset-info-item-3" className="flex items-start gap-2">
                    <span id="dataset-dot-3" className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                    <span id="dataset-desc-3">فهرست‌های جستجوی BM25 به صورت درجا به‌روزرسانی می‌شوند.</span>
                  </li>
                </ul>
              </div>

              <div id="dataset-notice-box" className="mt-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                <span id="dataset-notice-heading" className="font-semibold text-slate-300 block mb-1">دوزبانه بودن سامانه:</span>
                پایگاه دانش مرجع انگلیسی باقی می‌ماند و ترجمه سوالات و پاسخ‌ها توسط هوش مصنوعی انجام می‌پذیرد.
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: GLOBAL FEATURE FLAGS */}
        {activeTab === 'features' && (
          <motion.div
            id="admin-features-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8"
          >
            <div id="features-header-box" className="flex items-center gap-3 mb-6">
              <div id="features-icon-container" className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-teal-400">
                <Sliders id="features-header-icon" className="w-6 h-6" />
              </div>
              <div id="features-title-container">
                <h2 id="features-heading" className="text-lg font-bold text-slate-100">تنظیمات و دسترسی‌های سراسری</h2>
                <p id="features-desc" className="text-xs text-slate-400">
                  مدیریت دسترسی به قابلیت‌های بارگذاری پرونده PDF و ضبط صوتی برای تمامی کاربران
                </p>
              </div>
            </div>

            {settingsSuccess && (
              <div id="features-success-alert" className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-3">
                <CheckCircle2 id="features-success-icon" className="w-5 h-5 shrink-0 text-emerald-400" />
                <span id="features-success-text">تنظیمات پرمیشن‌ها با موفقیت ذخیره و اعمال شدند.</span>
              </div>
            )}

            <div id="features-toggles-list" className="space-y-4">
              {/* PDF Toggle */}
              <div id="feature-pdf-card" className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between gap-4">
                <div id="feature-pdf-info" className="flex items-center gap-3">
                  <div id="feature-pdf-icon-box" className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    <FileText id="feature-pdf-icon" className="w-5 h-5" />
                  </div>
                  <div id="feature-pdf-text-box">
                    <h4 id="feature-pdf-title" className="text-sm font-semibold text-slate-200">
                      دکمه پیوست فایل PDF و آزمایشات
                    </h4>
                    <p id="feature-pdf-subtitle" className="text-xs text-slate-400 mt-0.5">
                      امکان آپلود آزمایشات و پرونده بیمار در صفحه گفتگو
                    </p>
                  </div>
                </div>

                <label id="feature-pdf-toggle-label" className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="feature-pdf-toggle-checkbox"
                    type="checkbox"
                    checked={enablePdf}
                    onChange={(e) => setEnablePdf(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div id="feature-pdf-toggle-switch" className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
              </div>

              {/* Voice Recording Toggle */}
              <div id="feature-voice-card" className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between gap-4">
                <div id="feature-voice-info" className="flex items-center gap-3">
                  <div id="feature-voice-icon-box" className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                    <Mic id="feature-voice-icon" className="w-5 h-5" />
                  </div>
                  <div id="feature-voice-text-box">
                    <h4 id="feature-voice-title" className="text-sm font-semibold text-slate-200">
                      دکمه ضبط صدا و دیکته صوتی
                    </h4>
                    <p id="feature-voice-subtitle" className="text-xs text-slate-400 mt-0.5">
                      امکان تبدیل گفتار به متن شرح‌حال به زبان فارسی
                    </p>
                  </div>
                </div>

                <label id="feature-voice-toggle-label" className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="feature-voice-toggle-checkbox"
                    type="checkbox"
                    checked={enableVoice}
                    onChange={(e) => setEnableVoice(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div id="feature-voice-toggle-switch" className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
              </div>
            </div>

            <div id="features-save-wrapper" className="mt-8 flex justify-end">
              <button
                id="features-save-btn"
                type="button"
                onClick={handleSaveFeatures}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-teal-500/20 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 id="features-save-icon" className="w-4 h-4" />
                <span id="features-save-text">ذخیره تغییرات</span>
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
