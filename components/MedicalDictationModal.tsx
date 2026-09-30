'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Square,
  Sparkles,
  Languages,
  Check,
  RotateCcw,
  Send,
  Loader2,
  X,
  AlertCircle,
  FileText,
  Volume2,
  Globe
} from 'lucide-react';
import { transcribeMedicalAudio } from '@/lib/api';
import { useChatStore } from '@/store/chatStore';

interface MedicalDictationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertText: (text: string) => void;
  onSendDirect?: (text: string) => void;
}


export default function MedicalDictationModal({
  isOpen,
  onClose,
  onInsertText,
  onSendDirect,
}: MedicalDictationModalProps) {
  const { apiKey, doctorToken } = useChatStore();

  const [language, setLanguage] = useState<'fa' | 'auto' | 'en'>('fa');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Timer logic
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  // Clean up on modal close
  useEffect(() => {
    if (!isOpen && isRecording) {
      stopRecording();
    }
  }, [isOpen]);

  const startRecording = async () => {
    setErrorMessage(null);
    setTranscript('');
    setDetectedLang(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Find supported audio container
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach((track) => track.stop());
        if (audioBlob.size > 1500) {
          await processAudioWithWhisper(audioBlob);
        } else {
          setErrorMessage('مدت زمان ضبط خیلی کوتاه بود یا صدایی دریافت نشد.');
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      // Start live interim visual speech streaming
      startLiveSpeechStreaming();
    } catch (err) {
      console.error('Microphone access denied:', err);
      setErrorMessage('Microphone access denied. Please allow microphone permissions in your browser.');
    }
  };

  const startLiveSpeechStreaming = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language === 'fa' ? 'fa-IR' : language === 'en' ? 'en-US' : 'fa-IR';

        recognition.onresult = (event: any) => {
          let currentText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript + ' ';
          }
          if (currentText.trim()) {
            setTranscript(currentText.trim());
          }
        };

        recognition.onerror = () => {};
        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.log('Live speech preview fallback');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  const processAudioWithWhisper = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await transcribeMedicalAudio(
        audioBlob,
        language,
        false,
        apiKey,
        doctorToken || undefined
      );

      if (response.text) {
        setTranscript(response.text.trim());
        setDetectedLang(response.language);
      }
    } catch (err) {
      console.error('Whisper transcription error:', err);
      if (!transcript) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to transcribe audio. Please check your connection.'
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Detect RTL for Persian text
  const isPersianContent = /[\u0600-\u06FF]/.test(transcript) || language === 'fa';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="glass w-full max-w-xl rounded-3xl shadow-2xl border border-white/60 bg-white overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-700 via-cyan-700 to-blue-800 px-5 py-4 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-1.5">
                دیکته صوتی هوشمند (Voice Dictation)
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-100 border border-cyan-400/40 font-mono">
                  Whisper AI
                </span>
              </h2>
              <p className="text-[11px] text-blue-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                پشتیبانی دقیق از زبان فارسی و کلیه مفاهیم عمومی، بالینی و تخصصی
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Language Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-blue-600" />
              زبان گفتار (Language):
            </span>

            <div className="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLanguage('fa')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  language === 'fa'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🇮🇷</span>
                فارسی (Persian)
              </button>
              <button
                type="button"
                onClick={() => setLanguage('auto')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  language === 'auto'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3 h-3 text-cyan-600" />
                تشخیص خودکار
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  language === 'en'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🇺🇸</span>
                English
              </button>
            </div>
          </div>

          {/* Recording Canvas & Wave Visualizer */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden shadow-inner">
            {/* Ambient recording glow */}
            {isRecording && (
              <div className="absolute inset-0 bg-red-600/10 animate-pulse pointer-events-none" />
            )}

            {/* Central Mic Button */}
            <div className="relative mb-3">
              {isRecording && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full bg-red-500 blur-md pointer-events-none"
                />
              )}

              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-xl active:scale-95 cursor-pointer relative z-10 ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 ring-4 ring-red-400/40'
                    : isProcessing
                    ? 'bg-slate-700 opacity-60 cursor-not-allowed'
                    : 'bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 ring-4 ring-blue-400/20'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-7 h-7 animate-spin text-cyan-300" />
                ) : isRecording ? (
                  <Square className="w-6 h-6 fill-white" />
                ) : (
                  <Mic className="w-7 h-7 text-white" />
                )}
              </button>
            </div>

            {/* Recording Timer & Status */}
            <div className="text-center">
              {isRecording ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-base font-mono font-bold tracking-wider text-red-400">
                      {formatTime(recordingDuration)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">
                    در حال شنیدن گفتار شما... (برای اتمام ضبط کلیک کنید)
                  </p>
                </div>
              ) : isProcessing ? (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-cyan-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    تبدیل صوت به متن با هوش مصنوعی Whisper...
                  </p>
                  <p className="text-[11px] text-slate-400">Transcribing natural speech...</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    برای شروع دیکته صوتی دکمه میکروفون را فشار دهید
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    می‌توانید به زبان فارسی روان درباره هر موضوع بالینی، تشخیصی، سوال یا شرح حال صحبت کنید
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-red-700 text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Editable Live Transcript Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                متن شناسایی‌شده (Transcript):
                {detectedLang && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-mono">
                    {detectedLang.toUpperCase()}
                  </span>
                )}
              </span>
              {transcript && (
                <button
                  type="button"
                  onClick={() => setTranscript('')}
                  className="text-[10px] text-slate-400 hover:text-red-500 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  پاک کردن
                </button>
              )}
            </div>

            <textarea
              rows={4}
              dir={isPersianContent ? 'rtl' : 'ltr'}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="متن تبدیل‌شده از صوت شما در اینجا قرار می‌گیرد و می‌توانید آن را ویرایش کنید..."
              className={`w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none ${
                isPersianContent ? 'font-sans text-right' : 'text-left'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (transcript.trim()) {
                  onInsertText(transcript.trim());
                  onClose();
                }
              }}
              disabled={!transcript.trim() || isProcessing || isRecording}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              درج در کادر پیام (Insert)
            </button>

            {onSendDirect && (
              <button
                type="button"
                onClick={() => {
                  if (transcript.trim() && onSendDirect) {
                    onSendDirect(transcript.trim());
                    onClose();
                  }
                }}
                disabled={!transcript.trim() || isProcessing || isRecording}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-4 h-4" />
                ارسال مستقیم سوال (Send)
              </button>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}
