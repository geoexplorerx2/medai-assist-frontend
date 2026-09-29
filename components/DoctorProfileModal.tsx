'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import {
  X,
  User,
  Stethoscope,
  FileBadge,
  Mail,
  Hospital,
  BookOpen,
  Calendar,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Activity
} from 'lucide-react';

export default function DoctorProfileModal() {
  const {
    currentDoctor,
    isProfileModalOpen,
    setProfileModalOpen,
    updateProfile,
    logout,
    sessions,
    availableSpecialties,
  } = useChatStore();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit fields
  const [fullName, setFullName] = useState(currentDoctor?.full_name || '');
  const [specialty, setSpecialty] = useState(currentDoctor?.specialty || '');
  const [licenseNumber, setLicenseNumber] = useState(currentDoctor?.license_number || '');
  const [department, setDepartment] = useState(currentDoctor?.department || '');
  const [email, setEmail] = useState(currentDoctor?.email || '');
  const [bio, setBio] = useState(currentDoctor?.bio || '');

  if (!isProfileModalOpen || !currentDoctor) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    const success = await updateProfile({
      full_name: fullName.trim(),
      specialty: specialty.trim(),
      license_number: licenseNumber.trim(),
      department: department.trim(),
      email: email.trim(),
      bio: bio.trim(),
    });

    setSaving(false);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setIsEditing(false);
      }, 1200);
    } else {
      setError('Could not update profile. Please try again.');
    }
  };

  const memberDate = currentDoctor.created_at
    ? new Date(currentDoctor.created_at).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="glass w-full max-w-lg rounded-3xl shadow-2xl border border-white/60 overflow-hidden bg-white relative z-10"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-bold border border-white/30 shadow-inner">
              {currentDoctor.full_name.replace('Dr. ', '').charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-1.5">
                {currentDoctor.full_name}
              </h2>
              <p className="text-xs text-blue-100 flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5" />
                {currentDoctor.specialty}
              </p>
            </div>
          </div>

          <button
            onClick={() => setProfileModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* Status Banners */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {savedSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>Profile updated successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!isEditing ? (
            /* Profile View Mode */
            <div className="space-y-4">
              {/* Doctor Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Total Consultations
                  </span>
                  <span className="text-xl font-bold text-slate-800 mt-0.5 block">
                    {sessions.length}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Verified Physician
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    HIPAA Active
                  </span>
                </div>
              </div>

              {/* Profile Details List */}
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <User className="w-4 h-4 text-slate-400" />
                    Username
                  </span>
                  <span className="font-semibold text-slate-800 font-mono">
                    @{currentDoctor.username}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <FileBadge className="w-4 h-4 text-slate-400" />
                    License / NPI
                  </span>
                  <span className="font-semibold text-slate-800">
                    {currentDoctor.license_number || 'N/A'}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Hospital className="w-4 h-4 text-slate-400" />
                    Department
                  </span>
                  <span className="font-semibold text-slate-800 max-w-[220px] text-right truncate">
                    {currentDoctor.department || 'General Medicine'}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Mail className="w-4 h-4 text-slate-400" />
                    Email
                  </span>
                  <span className="font-semibold text-slate-800">
                    {currentDoctor.email || 'None registered'}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Member Since
                  </span>
                  <span className="font-semibold text-slate-800">{memberDate}</span>
                </div>
              </div>

              {/* Bio block */}
              {currentDoctor.bio && (
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                    Clinical Focus & Notes
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">{currentDoctor.bio}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  onClick={() => {
                    setFullName(currentDoctor.full_name);
                    setSpecialty(currentDoctor.specialty || 'General Medicine');
                    setLicenseNumber(currentDoctor.license_number || '');
                    setDepartment(currentDoctor.department || '');
                    setEmail(currentDoctor.email || '');
                    setBio(currentDoctor.bio || '');
                    setIsEditing(true);
                  }}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <User className="w-3.5 h-3.5" />
                  Edit Profile
                </button>

                <button
                  onClick={() => {
                    logout();
                  }}
                  className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Profile Edit Mode */
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specialty <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  value={specialty || ''}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="General Medicine">General Medicine / Auto-Detect</option>
                  {availableSpecialties.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    License / NPI
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Hospital
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={saving || !fullName.trim()}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
