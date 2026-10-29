'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { easeOutExpo } from './easings';
import { Title } from './Text';

interface SliceIterationProps {
  index: number;
  text: string;
  total: number;
  from: string;
  show: boolean;
  delay?: number;
  repeat?: boolean;
}

function SliceIteration({
  index,
  text,
  total,
  from,
  show,
  delay = 0,
  repeat = false,
}: SliceIterationProps) {
  return (
    <span
      className="SlicedText_iteration"
      aria-hidden="true"
      style={{
        left: `${(index / total) * 100}%`,
        width: `${100 / total + 0.01}%`,
      }}
    >
      <motion.span
        className="SlicedText_text"
        initial={{ x: from }}
        animate={show ? { x: `-${100 * index}%` } : { x: from }}
        transition={{
          duration: 1.25 + 0.025 * index,
          delay: delay + 0.025 * index,
          ease: easeOutExpo,
          ...(repeat
            ? {
                repeat: 2,
                repeatDelay: 2,
                repeatType: 'mirror' as const,
              }
            : {}),
        }}
      >
        {text}
      </motion.span>
    </span>
  );
}

export interface SlicedTextProps {
  text: string;
  iterations?: number;
  from?: string;
  show?: boolean;
  delay?: number;
  repeat?: boolean;
}

/**
 * Exact replica of Stefan's SlicedText component (module 429).
 * Splits display headings into N vertical slice columns that slide into alignment.
 */
export const SlicedText = memo(function SlicedText({
  text,
  iterations = 4,
  from = '50%',
  show = true,
  delay = 0,
  repeat = false,
}: SlicedTextProps) {
  const indices = Array.from({ length: iterations }, (_, i) => i);

  return (
    <span className="SlicedText_slicedText" aria-hidden="true">
      {indices.map((i) => (
        <SliceIteration
          key={i}
          index={i}
          text={text}
          total={iterations}
          from={from}
          show={show}
          delay={delay}
          repeat={repeat}
        />
      ))}
      <span className="SlicedText_textHolder" aria-hidden="true">
        {text}
      </span>
    </span>
  );
});

/**
 * Exact replica of Stefan's diagonal separator SVG (module 6839).
 */
export function Sep() {
  return (
    <span className="Sep_sep">
      <span className="Sep_line">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="50"
          viewBox="0 0 22 50"
          fill="none"
        >
          <path
            d="M20.4838 1L1 49.0985"
            stroke="currentColor"
            strokeWidth="1.21599"
          />
        </svg>
      </span>
    </span>
  );
}

/**
 * Exact replica of Stefan's PageTitle component (module 3024).
 */
export function PageTitle({
  title,
  titleOffset = ['50%', '50%'],
  show = true,
}: {
  title: string[];
  titleOffset?: string[];
  show?: boolean;
}) {
  return (
    <div className="PageTitle_pageTitle">
      <Title aria-label={title.join(' ')}>
        {title.map((line, idx) => (
          <div
            key={idx}
            className="PageTitle_titlePart"
            style={{ marginTop: idx > 0 ? '-0.4em' : '0' }}
            aria-hidden="true"
          >
            <SlicedText
              text={line}
              show={show}
              iterations={6}
              from={titleOffset[idx] || '50%'}
            />
          </div>
        ))}
      </Title>
    </div>
  );
}

export default SlicedText;
