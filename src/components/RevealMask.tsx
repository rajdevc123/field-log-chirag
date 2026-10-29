'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { easeOutExpo } from './easings';

interface RevealMaskProps {
  show?: boolean;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

/**
 * Exact replica of Stefan's Reveal component (module 2058):
 * Animates y from "-110%" to "0%" and opacity 0 -> 1 inside an overflow-hidden inline-block span.
 */
export function RevealMask({
  show = true,
  delay = 0,
  className = '',
  children,
}: RevealMaskProps) {
  const prefersReducedMotion = useReducedMotion();

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : {
        opacity: { duration: 0.2, delay },
        y: {
          duration: show ? 1.5 + 0.1 * delay : 0.75,
          delay: show ? delay : 0,
          ease: easeOutExpo,
        },
      };

  return (
    <span className="Reveal_mask">
      <motion.span
        className={`Reveal_item ${className}`.trim()}
        initial={{ opacity: 0, y: '-110%' }}
        animate={
          prefersReducedMotion
            ? { opacity: 1, y: '0%' }
            : { opacity: show ? 1 : 0, y: show ? '0%' : '-110%' }
        }
        transition={transition}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default RevealMask;
