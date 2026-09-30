'use client';

import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import {
  X,
  PlusCircle,
  Stethoscope,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Mic,
  Tag
} from 'lucide-react';
import MedicalDictationModal from './MedicalDictationModal';

const SOAP_TEMPLATE = `SUBJECTIVE:, [Describe patient age, gender, chief complaint, symptom duration, past medical history, and specific triggers]

CURRENT MEDICATIONS:, [Document current dosages, frequency]

ALLERGIES:, [Document drug allergies or 'No known drug allergies']

OBJECTIVE:, Vitals: BP [BP] mmHg, HR [HR] bpm, Temp [Temp] C, SpO2 [SpO2]%.
Physical Exam & Diagnostic Tests: [Document pertinent physical findings, lab results, ECG, or imaging]

ASSESSMENT:, 1. [Primary Diagnosis / Differential]
2. [Secondary Condition / Comorbidity]

PLAN:, 1. [Specific medication names, dosages, route, and duration]
2. [Diagnostic workup / monitoring orders]
3. [Lifestyle advice / Patient education]
4. [Red-flag warning signs and follow-up timeline]`;

export default function ContributeCaseModal() {
  const {
    isContributeModalOpen,
    setContributeModalOpen,
    currentDoctor,
    availableSpecialties,
    contributeCase,
  } = useChatStore();

  const [specialty, setSpecialty] = useState('Cardiology');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [sampleName, setSampleName] = useState('');
  const [description, setDescription] = useState('');
  const [transcription, setTranscription] = useState('');
  const [keywords, setKeywords] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDictationOpen, setIsDictationOpen] = useState(false);

  useEffect(() => {
    if (currentDoctor?.specialty && currentDoctor.specialty !== 'General Medicine') {
      setSpecialty(currentDoctor.specialty);
    }
  }, [currentDoctor]);

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
      setStatusMessage({ type: 'error', text: 'Please specify a clinical specialty.' });
      return;
    }
    if (!sampleName.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a case or condition title.' });
      return;
    }
    if (!transcription.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide clinical SOAP notes / documentation.' });
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
      setTimeout(() => {
        // Reset and close after brief success display
        setSampleName('');
        setDescription('');
        setTranscription('');
        setKeywords('');
        setStatusMessage(null);
        setContributeModalOpen(false);
      }, 1500);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-cyan-800 p-4 sm:p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
                <PlusCircle className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">Contribute Clinical Case & Symptoms</h3>
                <p className="text-xs text-cyan-100 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>
                    Physician: {currentDoctor?.full_name ? currentDoctor.full_name : 'Attending Clinician'}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setContributeModalOpen(false)}
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
            {/* Status Alert */}
            <AnimatePresence>
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`p-3 rounded-xl flex items-center gap-2.5 text-xs font-medium ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Specialty & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Specialty */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Specialty <span className="text-rose-500">*</span>
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                >
                  {availableSpecialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                  <option value="Cardiology">Cardiology</option>
                  <option value="Endocrinology">Endocrinology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Gastroenterology">Gastroenterology</option>
                  <option value="Pulmonology">Pulmonology</option>
                  <option value="Infectious Disease">Infectious Disease</option>
                  <option value="Nephrology">Nephrology</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Custom">+ Other / Custom Specialty</option>
                </select>

                {specialty === 'Custom' && (
                  <input
                    type="text"
                    value={customSpecialty}
                    onChange={(e) => setCustomSpecialty(e.target.value)}
                    placeholder="Enter specialty name..."
                    className="mt-1.5 w-full px-3 py-1.5 text-xs rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Title / Condition */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Case / Condition Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={sampleName}
                  onChange={(e) => setSampleName(e.target.value)}
                  placeholder="e.g. Acute Pericarditis Management"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Brief Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Case Summary / Presentation
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 34-year-old male presenting with sharp pleuritic chest pain and ECG ST elevation."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            {/* Clinical SOAP Notes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Clinical SOAP Documentation <span className="text-rose-500">*</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInsertTemplate}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Insert SOAP Template</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDictationOpen(true)}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-2 py-0.5 rounded-md border border-cyan-200 transition-colors"
                  >
                    <Mic className="w-3 h-3" />
                    <span>Dictate Notes (Voice)</span>
                  </button>
                </div>
              </div>

              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                rows={9}
                required
                placeholder="SUBJECTIVE: Patient presents with...&#10;OBJECTIVE: Vitals, Labs, Physical Exam...&#10;ASSESSMENT: Diagnosis...&#10;PLAN: Medications, Dosages, Management..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 leading-relaxed resize-y"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>Search Keywords & Drug Synonyms (optional)</span>
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. pericarditis, chest pain, colchicine, ibuprofen, st elevation"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setContributeModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !sampleName.trim() || !transcription.trim()}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Vectorizing & Indexing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save & Index to Knowledge Base</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Voice Dictation Modal Integration */}
      <MedicalDictationModal
        isOpen={isDictationOpen}
        onClose={() => setIsDictationOpen(false)}
        onInsertText={handleInsertDictation}
      />
    </>
  );
}
