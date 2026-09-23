'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import ApiKeyGate from '@/components/ApiKeyGate';
import Sidebar from '@/components/Sidebar';
import ChatContainer from '@/components/ChatContainer';

export default function Home() {
  const isApiLocked = useChatStore((s) => s.isApiLocked);
  const loadSpecialties = useChatStore((s) => s.loadSpecialties);

  useEffect(() => {
    if (isApiLocked) {
      loadSpecialties();
    }
  }, [isApiLocked, loadSpecialties]);

  return (
    <AnimatePresence mode="wait">
      {!isApiLocked ? (
        <motion.div
          key="gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <ApiKeyGate />
        </motion.div>
      ) : (
        <motion.div
          key="workspace"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex h-screen overflow-hidden"
        >
          <Sidebar />
          <ChatContainer />
        </motion.div>
      )}
    </AnimatePresence>
  );
}