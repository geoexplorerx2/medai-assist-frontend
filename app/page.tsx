'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import LoginForm from '@/components/LoginForm';
import Sidebar from '@/components/Sidebar';
import ChatContainer from '@/components/ChatContainer';
import DoctorProfileModal from '@/components/DoctorProfileModal';

export default function Home() {
  const { isAuthenticated, initAuth, loadSpecialties, verifyBackend } = useChatStore();

  useEffect(() => {
    initAuth();
    verifyBackend();
  }, [initAuth, verifyBackend]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSpecialties();
    }
  }, [isAuthenticated, loadSpecialties]);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login-portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
          >
            <LoginForm />
          </motion.div>
        ) : (
          <motion.div
            key="clinical-workspace"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex h-screen overflow-hidden"
          >
            <Sidebar />
            <ChatContainer />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Doctor Profile View & Edit Modal */}
      <DoctorProfileModal />
    </>
  );
}