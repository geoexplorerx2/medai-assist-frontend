'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Stethoscope,
  ShieldCheck,
  Hospital,
  Mail,
  FileBadge,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  LogIn
} from 'lucide-react';
import Logo from './Logo';

export default function LoginForm() {
  const {
    login,
    register,
    authLoading,
    authError,
    demoDoctors,
    loadDemoDoctors,
    availableSpecialties,
    loadSpecialties,
    verifyBackend
  } = useChatStore();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login Form State
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSpecialty, setRegSpecialty] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regBio, setRegBio] = useState('');

  useEffect(() => {
    loadDemoDoctors();
    loadSpecialties();
    verifyBackend();
  }, [loadDemoDoctors, loadSpecialties, verifyBackend]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass) return;
    await login({
      username: loginUser.trim(),
      password: loginPass,
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regPassword || !regFullName.trim()) return;
    await register({
      username: regUsername.trim(),
      password: regPassword,
      full_name: regFullName.trim(),
      specialty: regSpecialty.trim() || 'General Medicine',
      license_number: regLicense.trim(),
      email: regEmail.trim(),
      department: regDepartment.trim(),
      bio: regBio.trim(),
    });
  };

  const handleQuickLogin = async (username: string) => {
    setLoginUser(username);
    setLoginPass('doctor123');
    await login({
      username,
      password: 'doctor123',
    });
  };

  const defaultSpecialties = [
    'Cardiovascular / Pulmonary',
    'Neurology',
    'General Medicine',
    'Orthopedic',
    'Gastroenterology',
    'Allergy / Immunology',
    'Dermatology',
    'Surgery',
    'Urology',
    'Radiology'
  ];

  const specialtiesList = availableSpecialties.length > 0 ? availableSpecialties : defaultSpecialties;

  const bgImageUrl =
    process.env.NEXT_PUBLIC_LOGIN_BG_IMAGE ||
    'https://cdn.sanity.io/images/0vv8moc6/medec/8022c91678b2731dffb6b564ec54ab428b93dc1e-5376x3584.jpg';

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden bg-slate-950 select-none">
      {/* Background Image Layer (Fits entire viewport) */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url('${bgImageUrl}')`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
        }}
      />

      {/* Dark Overlay Layer with exact rgba(0, 0, 0, 0.5) - crisp & sharp */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      />

      {/* Subtle Ambient Lights */}
      <div className="absolute top-6 left-6 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-6 right-6 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Form Container Card - Fit to Screen */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="glass rounded-2xl sm:rounded-3xl shadow-2xl border border-white/60 p-4 sm:p-7 w-full max-w-lg max-h-[96vh] flex flex-col justify-between overflow-y-auto relative z-10 backdrop-blur-2xl bg-white/95"
      >
        <div>
          {/* Header Branding */}
          <div className="flex flex-col items-center text-center mb-3 sm:mb-4">
            <div className="relative">
              <Logo size={42} />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-white shadow-xs">
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold gradient-text mt-1.5 tracking-tight">
              MedAI-Assist
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
              <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
              Physician Portal & Clinical Workspace
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-3 sm:mb-4 border border-slate-200">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                tab === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600" />
              Physician Login
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                tab === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-cyan-600" />
              Create Doctor Profile
            </button>
          </div>

          {/* Global Error Banner */}
          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{authError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab 1: Physician Login */}
          {tab === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                {/* Username Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Physician Username / ID
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      required
                      value={loginUser}
                      onChange={(e) => setLoginUser(e.target.value)}
                      placeholder="e.g. dr_sarah"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={authLoading || !loginUser.trim() || !loginPass}
                  className="w-full mt-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Access Clinical Workspace
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Quick Demo Switcher Section */}
              <div className="mt-4 pt-3 border-t border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    1-Click Demo Physician Accounts
                  </span>
                  <span className="text-[9px] text-slate-400">Password: doctor123</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {demoDoctors.length > 0 ? (
                    demoDoctors.map((doc) => (
                      <button
                        key={doc.username}
                        type="button"
                        onClick={() => handleQuickLogin(doc.username)}
                        disabled={authLoading}
                        className="text-left p-2 bg-slate-50 hover:bg-blue-50/80 border border-slate-200/90 hover:border-blue-300 rounded-xl transition-all group flex items-center gap-2 shadow-2xs hover:shadow-xs"
                      >
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-[11px] font-bold shadow-xs flex-shrink-0">
                          {doc.full_name.replace('Dr. ', '').charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-slate-800 truncate group-hover:text-blue-700">
                            {doc.full_name}
                          </p>
                          <p className="text-[9px] text-slate-500 truncate">
                            {doc.specialty}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 text-center text-xs text-slate-400 py-1">
                      Loading demo accounts...
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Create Doctor Profile */}
          {tab === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                {/* Full Name & Username */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Physician Full Name *
                    </label>
                    <div className="relative group">
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-cyan-600" />
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Dr. Maria Gonzalez, MD"
                        className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Account Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="dr_maria"
                      className="w-full px-2.5 py-1.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Password & Specialty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Password (min 6 chars) *
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-cyan-600" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-8 pr-8 py-1.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Specialty <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      value={regSpecialty}
                      onChange={(e) => setRegSpecialty(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-slate-800"
                    >
                      <option value="">✨ Auto-Detect / General</option>
                      {specialtiesList.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* License & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      License / NPI <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative group">
                      <FileBadge className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-cyan-600" />
                      <input
                        type="text"
                        value={regLicense}
                        onChange={(e) => setRegLicense(e.target.value)}
                        placeholder="MED-94021"
                        className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Department <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative group">
                      <Hospital className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-cyan-600" />
                      <input
                        type="text"
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        placeholder="Pulmonary Care"
                        className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Email & Bio */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Email <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-cyan-600" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="dr.maria@hospital.org"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Clinical Focus / Bio <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={1}
                    value={regBio}
                    onChange={(e) => setRegBio(e.target.value)}
                    placeholder="Brief clinical focus or notes..."
                    className="w-full px-2.5 py-1.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none"
                  />
                </div>

                {/* Register Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={authLoading || !regUsername.trim() || !regPassword || !regFullName.trim()}
                  className="w-full mt-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Register & Enter Workspace
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </div>

        {/* Footer Security Badge */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>PBKDF2 Credentials • HIPAA Session Isolation</span>
        </div>
      </motion.div>
    </div>
  );
}
