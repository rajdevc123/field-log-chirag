'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

// The one way back on a project page, in place of the site nav.
// Fixed to the top left; the page title sits below it.
export function BackToProjects({ show = true }: { show?: boolean }) {
  return (
    <motion.div
      className="Back_wrap"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : -6 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
    >
      <Link href="/work" scroll={false} className="Back_pill">
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
        <span>Back to projects</span>
      </Link>
    </motion.div>
  );
}

export default BackToProjects;
