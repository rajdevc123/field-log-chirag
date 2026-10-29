'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { PlaygroundItem } from '@/content/getPlayground';
import { easeOutExpo } from './easings';
import { BodyCopyLarge, BodyCopyMedium, BodyCopySmall } from './Text';
import { RevealMask } from './RevealMask';

interface PlaygroundOverlayProps {
  item: PlaygroundItem | null;
  onClose: () => void;
}

export function PlaygroundOverlay({ item, onClose }: PlaygroundOverlayProps) {
  useEffect(() => {
    if (!item) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key={item.slug}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(37, 37, 38, 0.92)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          className="p-0 md:p-[var(--indent)]"
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
        >
          {/* Main Experiment Stage */}
          <motion.div
            initial={{ y: '6%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '4%', opacity: 0 }}
            transition={{ duration: 0.65, ease: easeOutExpo }}
            style={{
              flex: '1 1 auto',
              position: 'relative',
              backgroundColor: '#252526',
              overflow: 'hidden',
              border: '1px solid rgba(241, 239, 235, 0.15)',
            }}
          >
            {item.embed ? (
              <iframe
                src={item.embed}
                title={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 0,
                  display: 'block',
                }}
                allow="accelerometer; autoplay; fullscreen; gyroscope"
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f1efeb',
                }}
              >
                <BodyCopyLarge>{item.title}</BodyCopyLarge>
              </div>
            )}
          </motion.div>

          {/* Bottom Context Strip */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.55, ease: easeOutExpo, delay: 0.05 }}
            style={{
              backgroundColor: 'var(--color-aux)',
              color: 'var(--color-default)',
              padding: 'var(--indent)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--indent)',
              borderTop: '1px solid rgba(37, 37, 38, 0.15)',
            }}
          >
            <div style={{ flex: '1 1 280px' }}>
              <BodyCopyLarge>
                <RevealMask show={true} delay={0.1}>
                  {item.displayNumber}. {item.title} ({item.year})
                </RevealMask>
              </BodyCopyLarge>
              <BodyCopyMedium style={{ marginTop: '0.25rem', opacity: 0.85 }}>
                <RevealMask show={true} delay={0.18}>
                  {item.note || item.content}
                </RevealMask>
              </BodyCopyMedium>
            </div>

            <div style={{ flex: '0 1 auto' }}>
              <BodyCopySmall style={{ color: 'var(--color-accent)' }}>
                <RevealMask show={true} delay={0.22}>
                  Built in {item.tech.join(' + ')}
                </RevealMask>
              </BodyCopySmall>
            </div>

            <div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.5em 1em',
                  backgroundColor: 'var(--color-default)',
                  color: 'var(--color-aux)',
                }}
              >
                <BodyCopyMedium as="span">Close [ESC]</BodyCopyMedium>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PlaygroundOverlay;
