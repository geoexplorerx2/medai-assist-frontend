'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Stethoscope,
  ShieldCheck,
  Loader2,
  AlertCircle,
  LogIn,
  FileCheck2,
} from 'lucide-react';

export default function LoginForm() {
  const {
    login,
    authLoading,
    authError,
    verifyBackend,
    isBackendHealthy,
  } = useChatStore();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    verifyBackend();
  }, [verifyBackend]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    await login({
      username: username.trim(),
      password,
    });
  };

  return (
    <div
      id="login-page-root"
      dir="rtl"
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 text-slate-100 font-['Vazirmatn']"
    >
      {/* High-Resolution Medical Clinical Background Image with Balanced Dark Overlay */}
      <div
        id="login-background-image-layer"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 pointer-events-none scale-100"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(2, 6, 23, 0.65) 0%, rgba(15, 23, 42, 0.52) 50%, rgba(2, 6, 23, 0.70) 100%), url('https://miro.medium.com/v2/1*zRy6oMDcuVtAQKAOluentQ.png')`,
        }}
      />

      {/* Dynamic Medical Background Glows */}
      <div id="login-glow-top-left" className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div id="login-glow-bottom-right" className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div id="login-glow-center" className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Pattern Layer */}
      <div id="login-grid-pattern" className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-25" />

      <div id="login-card-container" className="w-full max-w-xl relative z-10 my-8">
        {/* Main Card with Translucent Dark Glassmorphism */}
        <motion.div
          id="login-main-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-slate-900/75 backdrop-blur-2xl border border-slate-700/60 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/90 relative"
        >
          {/* Top Logo & Title */}
          <div id="login-header-section" className="flex flex-col items-center text-center mb-8">
            <div id="login-logo-wrapper" className="flex items-center gap-2 mb-3">
              <div id="login-icon-box" className="p-3 bg-gradient-to-tr from-teal-500/20 to-blue-500/20 border border-teal-500/30 rounded-2xl shadow-inner">
                <Stethoscope id="login-stethoscope-icon" className="w-8 h-8 text-teal-400" />
              </div>
              <h1 id="login-app-title" className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-300 via-emerald-200 to-blue-300 bg-clip-text text-transparent">
                دستیار هوشمند MedAI
              </h1>
            </div>
            <p id="login-subtitle-desc" className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
              سامانه هوشمند بالینی، استخراج شواهد و بازیابی دانش پزشکی (RAG)
            </p>

            {/* Status indicator */}
            <div id="login-status-badge" className="mt-3 flex items-center gap-2 px-3 py-1 bg-slate-800/60 border border-slate-700/50 rounded-full text-xs text-slate-300">
              <span id="login-status-dot" className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span id="login-status-text">{isBackendHealthy ? 'هسته پردازشی و هوش مصنوعی متصل است' : 'در حال بررسی اتصال به سرور...'}</span>
            </div>
          </div>

          {/* Error Alert */}
          {authError && (
            <motion.div
              id="login-error-alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-3"
            >
              <AlertCircle id="login-error-icon" className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div id="login-error-content" className="flex-1">
                <span id="login-error-heading" className="font-semibold block mb-0.5">خطای ورود</span>
                <span id="login-error-message">{authError}</span>
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          <form id="login-form-element" onSubmit={handleLoginSubmit} className="space-y-5">
            <div id="login-username-group">
              <label id="login-username-label" htmlFor="login-username-input" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                نام کاربری
              </label>
              <div id="login-username-input-wrapper" className="relative">
                <div id="login-username-icon-container" className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <User id="login-username-icon" className="w-4 h-4" />
                </div>
                <input
                  id="login-username-input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin یا نام کاربری پزشک"
                  className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl pr-10 pl-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-right dir-rtl"
                />
              </div>
            </div>

            <div id="login-password-group">
              <label id="login-password-label" htmlFor="login-password-input" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                رمز عبور
              </label>
              <div id="login-password-input-wrapper" className="relative">
                <div id="login-password-icon-container" className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock id="login-password-icon" className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-700/70 rounded-xl pr-10 pl-11 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-right dir-rtl"
                />
                <button
                  id="login-toggle-password-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff id="login-eyeoff-icon" className="w-4 h-4" /> : <Eye id="login-eye-icon" className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={authLoading || !username.trim() || !password}
              style={{ color: '#ffffff' }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 hover:from-teal-500 hover:via-teal-600 hover:to-emerald-600 text-white font-bold text-base rounded-xl transition-all shadow-xl shadow-black/60 border border-teal-400/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {authLoading ? (
                <>
                  <Loader2 id="login-loader-spinner" className="w-5 h-5 animate-spin text-white" />
                  <span id="login-loader-text" style={{ color: '#ffffff' }} className="text-white font-bold text-sm sm:text-base">در حال تأیید هویت و ورود...</span>
                </>
              ) : (
                <>
                  <LogIn id="login-btn-icon" className="w-5 h-5 text-white" />
                  <span id="login-btn-text" style={{ color: '#ffffff' }} className="text-white font-bold text-sm sm:text-base">ورود به سامانه</span>
                </>
              )}
            </button>
          </form>

          {/* Notice */}
          <div id="login-notice-section" className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p id="login-notice-text" className="text-xs text-slate-300 leading-relaxed">
              <span id="login-notice-strong" className="inline-block font-semibold text-slate-200 ml-1">اطلاعیه سامانه:</span>
              ایجاد و مدیریت حساب‌های کاربری صرفاً از طریق پنل مدیریت ارشد (Admin) امکان‌پذیر است.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
