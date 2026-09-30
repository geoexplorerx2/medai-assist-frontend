'use client';

import { useState, FormEvent, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import {
  Send,
  Loader2,
  RotateCcw,
  Sparkles,
  Mic,
  Paperclip,
  FileText,
  Image as ImageIcon,
  X,
  AlertCircle,
  UploadCloud
} from 'lucide-react';
import MedicalDictationModal from './MedicalDictationModal';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const [isDictationOpen, setIsDictationOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const {
    sendMessage,
    isLoading,
    currentSessionId,
    selectedSpecialty,
    clearSessionMessages,
    sessions,
    uploadPatientDoc,
    removePatientDoc,
    isUploadingDocument,
    documentUploadError,
    systemSettings,
    currentDoctor,
  } = useChatStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const attachedDocs = currentSession?.attachedDocuments || [];
  const hasMessages = (currentSession?.messages?.length ?? 0) > 0;

  const canUploadPdf = systemSettings.enable_pdf_attachment && (currentDoctor ? currentDoctor.can_upload_pdf !== false : true);
  const canRecordVoice = systemSettings.enable_voice_recording && (currentDoctor ? currentDoctor.can_record_voice !== false : true);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px';
    }
  }, [input]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const q = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(q);
  };

  const handleInsertDictation = (dictatedText: string) => {
    setInput((prev) => (prev ? `${prev} ${dictatedText}` : dictatedText));
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSendDirectDictation = async (dictatedText: string) => {
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(dictatedText);
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await uploadPatientDoc(file);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!canUploadPdf) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    if (!canUploadPdf) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileUpload(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '';
    if (bytes < 1024) return `${bytes} بایت`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} کیلوبایت`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`;
  };

  return (
    <>
      <div id="chat-input-wrapper" dir="rtl" className="glass border-t border-slate-200 p-2.5 sm:p-4">
        <form id="chat-input-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Document Upload Error Banner */}
          <AnimatePresence>
            {documentUploadError && (
              <motion.div
                id="doc-upload-error-banner"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mb-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-700"
              >
                <div id="doc-upload-error-content" className="flex items-center gap-2">
                  <AlertCircle id="doc-upload-error-icon" className="w-4 h-4 flex-shrink-0 text-rose-500" />
                  <span id="doc-upload-error-text">{documentUploadError}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attached Patient Documents Chips */}
          <AnimatePresence>
            {(attachedDocs.length > 0 || isUploadingDocument) && (
              <motion.div
                id="attached-docs-container"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 flex flex-wrap items-center gap-2"
              >
                <span id="attached-docs-label" className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Paperclip id="attached-docs-label-icon" className="w-3 h-3 text-teal-600" />
                  مدارک و گزارشات پیوست‌شده ({attachedDocs.length}):
                </span>

                {attachedDocs.map((doc, idx) => (
                  <motion.div
                    id={`attached-doc-chip-${doc.id || idx}`}
                    key={doc.id || idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50/90 hover:bg-teal-100 border border-teal-200/90 text-xs text-teal-900 shadow-2xs transition-all"
                    title={`پیش‌نمایش: ${doc.preview}`}
                  >
                    {doc.file_type === 'image' ? (
                      <ImageIcon id={`attached-doc-img-icon-${doc.id || idx}`} className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    ) : (
                      <FileText id={`attached-doc-file-icon-${doc.id || idx}`} className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    )}

                    <span id={`attached-doc-name-${doc.id || idx}`} className="font-medium max-w-[140px] sm:max-w-[200px] truncate text-[11px]">
                      {doc.filename}
                    </span>

                    {doc.file_size > 0 && (
                      <span id={`attached-doc-size-${doc.id || idx}`} className="text-[9px] text-teal-600/80 font-mono">
                        ({formatFileSize(doc.file_size)})
                      </span>
                    )}

                    <button
                      id={`attached-doc-remove-btn-${doc.id || idx}`}
                      type="button"
                      onClick={() => removePatientDoc(doc.id)}
                      className="p-0.5 mr-0.5 rounded-full hover:bg-teal-200/70 text-teal-600 hover:text-rose-600 transition-colors cursor-pointer"
                      title="حذف مدرک از این مشاوره"
                    >
                      <X id={`attached-doc-remove-icon-${doc.id || idx}`} className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}

                {/* Upload Spinner Badge */}
                {isUploadingDocument && (
                  <motion.div
                    id="doc-uploading-spinner-badge"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs"
                  >
                    <Loader2 id="doc-uploading-spinner-icon" className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    <span id="doc-uploading-spinnerText" className="text-[11px] font-medium">در حال پردازش OCR و جداول آزمایشگاهی...</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hidden File Input */}
          <input
            id="chat-file-upload-input"
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Input Controls Container with Drag and Drop */}
          <div
            id="chat-input-controls-box"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex items-end gap-2 bg-white border ${
              isDragging
                ? 'border-teal-500 bg-teal-50/40 ring-4 ring-teal-100 border-dashed'
                : 'border-slate-200 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100'
            } rounded-2xl p-2 shadow-xs transition-all`}
          >
            {/* Drag Overlay Hint */}
            {isDragging && (
              <div id="chat-drag-overlay" className="absolute inset-0 z-10 bg-teal-50/90 backdrop-blur-xs rounded-2xl flex items-center justify-center pointer-events-none">
                <div id="chat-drag-overlay-inner" className="flex items-center gap-2 text-teal-700 font-semibold text-sm">
                  <UploadCloud id="chat-drag-overlay-icon" className="w-5 h-5 animate-bounce" />
                  <span id="chat-drag-overlay-text">فایل PDF آزمایشات، CBC یا تصویر اسکن‌شده را برای تحلیل رها کنید</span>
                </div>
              </div>
            )}

            {/* Attach Patient Document Button (Admin & User Controlled Toggle) */}
            {canUploadPdf && (
              <motion.button
                id="chat-attach-doc-btn"
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingDocument}
                title="پیوست فایل آزمایش و پرونده بیمار (PDF, PNG, JPG, CSV)"
                className="p-2 text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-xl transition-all flex items-center justify-center flex-shrink-0 cursor-pointer shadow-2xs hover:shadow-xs group disabled:opacity-50"
              >
                {isUploadingDocument ? (
                  <Loader2 id="chat-attach-doc-spinner" className="w-4 h-4 text-teal-600 animate-spin" />
                ) : (
                  <Paperclip id="chat-attach-doc-icon" className="w-4 h-4 group-hover:text-teal-600 transition-colors" />
                )}
              </motion.button>
            )}

            {/* Voice Dictation Button (Admin & User Controlled Toggle) */}
            {canRecordVoice && (
              <motion.button
                id="chat-voice-dictation-btn"
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsDictationOpen(true)}
                title="دیکته صوتی پزشکی (تبدیل گفتار به متن)"
                className="p-2 text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/80 rounded-xl transition-all flex items-center justify-center flex-shrink-0 cursor-pointer shadow-2xs hover:shadow-xs group"
              >
                <Mic id="chat-voice-dictation-icon" className="w-4 h-4 group-hover:text-teal-600 transition-colors" />
              </motion.button>
            )}

            {/* Text Input Area */}
            <textarea
              id="chat-main-textarea"
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="علائم بالینی، شرح‌حال بیمار یا سوال پزشکی را به فارسی بنویسید (استخراج شواهد و ترجمه خودکار)..."
              disabled={isLoading}
              rows={1}
              className="flex-1 resize-none px-2 py-1.5 bg-transparent border-0 focus:outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 disabled:opacity-50 min-h-[38px] max-h-[140px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            {/* Action Buttons */}
            <div id="chat-action-buttons-group" className="flex items-center gap-1.5 flex-shrink-0">
              {/* Clear Messages shortcut */}
              {hasMessages && currentSessionId && (
                <button
                  id="chat-clear-messages-btn"
                  type="button"
                  onClick={() => clearSessionMessages(currentSessionId)}
                  title="پاک کردن پیام‌های این گفتگو"
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors hidden sm:inline-flex cursor-pointer"
                >
                  <RotateCcw id="chat-clear-messages-icon" className="w-4 h-4" />
                </button>
              )}

              {/* Send Button */}
              <motion.button
                id="chat-submit-btn"
                type="submit"
                disabled={isLoading || (!input.trim() && attachedDocs.length === 0)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 id="chat-submit-spinner" className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send id="chat-submit-send-icon" className="w-4 h-4 rotate-180" />
                    <span id="chat-submit-text" className="hidden sm:inline">ارسال</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Input Bottom Bar with Specialty Selector & Dictation Hint */}
          <div id="chat-bottom-bar" className="flex flex-wrap items-center justify-between gap-2 mt-2 px-1 text-[11px] text-slate-400">
            <div id="chat-bottom-bar-left" className="flex items-center gap-3">
              <span id="chat-specialty-hint-badge" className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500">
                <Sparkles id="chat-specialty-hint-icon" className="w-3 h-3 text-teal-500" />
                {selectedSpecialty ? `تخصص انتخاب‌شده: ${selectedSpecialty}` : 'تشخیص خودکار تخصص توسط هوش مصنوعی'}
              </span>

              {canUploadPdf && (
                <button
                  id="chat-quick-upload-btn"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/80 px-2 py-0.5 rounded-md border border-teal-200 transition-colors cursor-pointer"
                >
                  <Paperclip id="chat-quick-upload-icon" className="w-2.5 h-2.5" />
                  <span id="chat-quick-upload-text">آپلود PDF / آزمایش</span>
                </button>
              )}

              {canRecordVoice && (
                <button
                  id="chat-quick-dictate-btn"
                  type="button"
                  onClick={() => setIsDictationOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-cyan-700 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100/80 px-2 py-0.5 rounded-md border border-cyan-200 transition-colors cursor-pointer"
                >
                  <Mic id="chat-quick-dictate-icon" className="w-2.5 h-2.5" />
                  <span id="chat-quick-dictate-text">دیکته صوتی پزشکی</span>
                </button>
              )}
            </div>

            <span id="chat-keyboard-shortcuts-hint" className="hidden md:inline text-[10px] text-slate-400">
              کلید <kbd id="chat-kbd-enter" className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-mono">Enter</kbd> برای ارسال • <kbd id="chat-kbd-shift-enter" className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-mono">Shift+Enter</kbd> برای خط جدید
            </span>
          </div>
        </form>
      </div>

      {/* Persian & English Medical Voice Dictation Modal */}
      {canRecordVoice && (
        <MedicalDictationModal
          isOpen={isDictationOpen}
          onClose={() => setIsDictationOpen(false)}
          onInsertText={handleInsertDictation}
          onSendDirect={handleSendDirectDictation}
        />
      )}
    </>
  );
}