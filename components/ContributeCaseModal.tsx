'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import {
  X,
  PlusCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Mic
} from 'lucide-react';
import MedicalDictationModal from './MedicalDictationModal';

const SOAP_TEMPLATE = `SUBJECTIVE:, [سن، جنسیت، شکایت اصلی بیمار، مدت زمان علائم، سوابق قبلی]

CURRENT MEDICATIONS:, [داروهای مصرفی فعلی با دوز و تکرار]

ALLERGIES:, [حساسیت‌های دارویی یا No known drug allergies]

OBJECTIVE:, علائم حیاتی: فشار خون [BP]، ضربان [HR]، تنفس [RR]، اشباع اکسیژن [SpO2]%.
معاینات بالینی و یافته‌های پاراکلینیک: [یافته‌های فیزیکی، ECG، آزمایشات و تصویربرداری]

ASSESSMENT:, 1. [تشخیص اولیه بالینی]
2. [تشخیص‌های افتراقی یا بیماری‌های زمینه‌ای]

PLAN:, 1. [نام داروها، دوز دقیق، نحوه مصرف و طول دوره درمان]
2. [اقدامات پاراکلینیک، پایش و دستورات پیگیری]
3. [آموزش به بیمار و علائم هشداردهنده Red Flags]`;

export default function ContributeCaseModal() {
  const {
    isContributeModalOpen,
    setContributeModalOpen,
    availableSpecialties,
    contributeCase,
  } = useChatStore();

  const [specialty, setSpecialty] = useState('Cardiovascular / Pulmonary');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [sampleName, setSampleName] = useState('');
  const [description, setDescription] = useState('');
  const [transcription, setTranscription] = useState('');
  const [keywords, setKeywords] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDictationOpen, setIsDictationOpen] = useState(false);

  if (!isContributeModalOpen) return null;

  const handleInsertTemplate = () => {
    if (!transcription.trim()) {
      setTranscription(SOAP_TEMPLATE);
    } else {
      setTranscription((prev) => `${prev}\n\n${SOAP_TEMPLATE}`);
    }
  };

  const handleInsertDictation = (dictatedText: string) => {
    setTranscription((prev) => (prev ? `${prev}\n${dictatedText}` : dictatedText));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const finalSpecialty = specialty === 'Custom' ? customSpecialty.trim() : specialty.trim();

    if (!finalSpecialty) {
      setStatusMessage({ type: 'error', text: 'لطفاً تخصص پزشکی را مشخص کنید.' });
      return;
    }
    if (!sampleName.trim()) {
      setStatusMessage({ type: 'error', text: 'لطفاً عنوان مورد بالینی را وارد کنید.' });
      return;
    }
    if (!transcription.trim()) {
      setStatusMessage({ type: 'error', text: 'لطفاً مستندات و شرح‌حال بالینی را وارد کنید.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const result = await contributeCase({
      specialty: finalSpecialty,
      sample_name: sampleName.trim(),
      description: description.trim(),
      transcription: transcription.trim(),
      keywords: keywords.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      setSampleName('');
      setDescription('');
      setTranscription('');
      setKeywords('');
      setTimeout(() => {
        setStatusMessage(null);
        setContributeModalOpen(false);
      }, 2500);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <>
      <div id="contribute-case-modal-backdrop" dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          id="contribute-case-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="glass w-full max-w-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden bg-white relative z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header Ribbon */}
          <div id="contribute-case-header-ribbon" className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
            <div id="contribute-case-header-info" className="flex items-center gap-3">
              <div id="contribute-case-header-icon-box" className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-teal-100 border border-white/30 shadow-inner">
                <PlusCircle id="contribute-case-header-plus" className="w-6 h-6" />
              </div>
              <div id="contribute-case-header-titles">
                <h2 id="contribute-case-title" className="text-base sm:text-lg font-bold">
                  مشارکت در ثبت مورد بالینی جدید
                </h2>
                <p id="contribute-case-subtitle" className="text-xs text-teal-100">
                  افزودن بلادرنگ پرونده به پایگاه دانش RAG و وکتورایز خودکار
                </p>
              </div>
            </div>

            <button
              id="contribute-case-close-btn"
              type="button"
              onClick={() => setContributeModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X id="contribute-case-close-icon" className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <div id="contribute-case-form-body" className="p-6 overflow-y-auto flex-1">
            {/* Status Alert */}
            <AnimatePresence>
              {statusMessage && (
                <motion.div
                  id="contribute-case-status-banner"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 id="contribute-case-status-check-icon" className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle id="contribute-case-status-alert-icon" className="w-4 h-4 shrink-0 text-red-600" />
                  )}
                  <span id="contribute-case-status-text">{statusMessage.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form id="contribute-case-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div id="contribute-case-grid-specialty-sample" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div id="contribute-case-specialty-field">
                  <label id="contribute-case-specialty-label" htmlFor="contribute-case-specialty-select" className="block font-semibold text-slate-700 mb-1">
                    تخصص پزشکی *
                  </label>
                  <select
                    id="contribute-case-specialty-select"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                  >
                    {availableSpecialties.map((s, idx) => (
                      <option id={`contribute-spec-opt-${idx}`} key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option id="contribute-spec-opt-custom" value="Custom">سایر (تعریف تخصص جدید)</option>
                  </select>
                </div>

                {specialty === 'Custom' && (
                  <div id="contribute-case-custom-specialty-field">
                    <label id="contribute-case-custom-specialty-label" htmlFor="contribute-case-custom-specialty-input" className="block font-semibold text-slate-700 mb-1">
                      نام تخصص جدید *
                    </label>
                    <input
                      id="contribute-case-custom-specialty-input"
                      type="text"
                      required
                      value={customSpecialty}
                      onChange={(e) => setCustomSpecialty(e.target.value)}
                      placeholder="مثال: Endocrinology"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                    />
                  </div>
                )}

                <div id="contribute-case-samplename-field">
                  <label id="contribute-case-samplename-label" htmlFor="contribute-case-samplename-input" className="block font-semibold text-slate-700 mb-1">
                    عنوان پرونده / بیماری *
                  </label>
                  <input
                    id="contribute-case-samplename-input"
                    type="text"
                    required
                    value={sampleName}
                    onChange={(e) => setSampleName(e.target.value)}
                    placeholder="مثال: Acute Unstable Angina Evaluation"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                  />
                </div>
              </div>

              <div id="contribute-case-description-field">
                <label id="contribute-case-description-label" htmlFor="contribute-case-description-input" className="block font-semibold text-slate-700 mb-1">
                  خلاصه یا توصیف کوتاه پرونده
                </label>
                <input
                  id="contribute-case-description-input"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="خلاصه ۱ خطی از وضعیت بیمار و مداخله انجام‌شده"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div id="contribute-case-transcription-field">
                <div id="contribute-case-transcription-header" className="flex items-center justify-between mb-1">
                  <label id="contribute-case-transcription-label" htmlFor="contribute-case-transcription-textarea" className="font-semibold text-slate-700">
                    متن و مستندات بالینی (SOAP Notes) *
                  </label>
                  <div id="contribute-case-transcription-actions" className="flex items-center gap-2">
                    <button
                      id="contribute-case-insert-soap-btn"
                      type="button"
                      onClick={handleInsertTemplate}
                      className="text-[11px] text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                    >
                      <FileText id="contribute-case-soap-icon" className="w-3 h-3" />
                      <span id="contribute-case-soap-text">درج قالب SOAP</span>
                    </button>
                    <button
                      id="contribute-case-dictate-btn"
                      type="button"
                      onClick={() => setIsDictationOpen(true)}
                      className="text-[11px] text-cyan-600 hover:text-cyan-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Mic id="contribute-case-dictate-icon" className="w-3 h-3" />
                      <span id="contribute-case-dictate-text">دیکته صوتی</span>
                    </button>
                  </div>
                </div>
                <textarea
                  id="contribute-case-transcription-textarea"
                  rows={8}
                  required
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  placeholder="شرح‌حال، معاینات، آزمایشات، تشخیص و پلن درمانی را وارد کنید..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono resize-none text-slate-800"
                />
              </div>

              <div id="contribute-case-keywords-field">
                <label id="contribute-case-keywords-label" htmlFor="contribute-case-keywords-input" className="block font-semibold text-slate-700 mb-1">
                  کلمات کلیدی بالینی (با کاما جدا کنید)
                </label>
                <input
                  id="contribute-case-keywords-input"
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="angina, ecg, troponin, nitroglycerin, heparin"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dir-ltr text-left"
                />
              </div>

              <div id="contribute-case-submit-actions" className="pt-2 flex items-center justify-end gap-2">
                <button
                  id="contribute-case-cancel-btn"
                  type="button"
                  onClick={() => setContributeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  id="contribute-case-submit-btn"
                  type="submit"
                  disabled={isSubmitting || !sampleName.trim() || !transcription.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 id="contribute-case-submit-spinner" className="w-4 h-4 animate-spin" />
                      <span id="contribute-case-submitting-text">در حال ایندکس و وکتورایز...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle id="contribute-case-submit-plus-icon" className="w-4 h-4" />
                      <span id="contribute-case-submit-label">ثبت در پایگاه دانش</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      <MedicalDictationModal
        isOpen={isDictationOpen}
        onClose={() => setIsDictationOpen(false)}
        onInsertText={handleInsertDictation}
      />
    </>
  );
}
