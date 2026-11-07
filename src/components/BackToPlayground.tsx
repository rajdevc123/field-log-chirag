'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export function BackToPlayground({
  show = true,
  onClick,
}: {
  show?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      className="Back_wrap"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : -6 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
    >
      <button
        type="button"
        onClick={onClick}
        className="Back_pill"
        aria-label="Back to playground"
      >
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
        <span>Back to playground</span>
      </button>
    </motion.div>
  );
}

export default BackToPlayground;
