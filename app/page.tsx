'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import LoginForm from '@/components/LoginForm';
import AdminPanel from '@/components/AdminPanel';
import Sidebar from '@/components/Sidebar';
import ChatContainer from '@/components/ChatContainer';
import DoctorProfileModal from '@/components/DoctorProfileModal';
import ContributeCaseModal from '@/components/ContributeCaseModal';

export default function Home() {
  const { isAuthenticated, currentDoctor, initAuth, loadSpecialties, verifyBackend } = useChatStore();

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
            id="login-view-container"
            key="login-portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
          >
            <LoginForm />
          </motion.div>
        ) : currentDoctor?.role === 'admin' ? (
          <motion.div
            id="admin-view-container"
            key="admin-workspace"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="min-h-screen"
          >
            <AdminPanel />
          </motion.div>
        ) : (
          <motion.div
            id="clinical-workspace-container"
            key="clinical-workspace"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            dir="rtl"
            className="flex h-screen overflow-hidden font-sans"
          >
            <Sidebar />
            <ChatContainer />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Doctor Profile View & Edit Modal */}
      <DoctorProfileModal />

      {/* Global Doctor Clinical Case Contribution Modal */}
      <ContributeCaseModal />
    </>
  );
}