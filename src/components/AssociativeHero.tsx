'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { siteConfig } from '@/content/site';
import { easeOutExpo } from './easings';

export interface AssociativeRelationship {
  index: number;
  word1: string;
  word2: string;
  word1Id: number;
  word2Id: number;
}

export interface AssociativeHeroConfig {
  /** Duration each relationship stays on screen before advancing (ms) */
  cycleIntervalMs?: number;
  /** Time to wait after manual click/keyboard interaction before resuming auto-cycle (ms) */
  inactivityResumeMs?: number;
  /** Duration of the word relay transition (ms) */
  transitionDurationMs?: number;
  /** Target downsampling ratio for 8-bit pixelation (e.g. 0.21 = subtle crisp square steps) */
  pixelationTargetScale?: number;
  /** Enter/leave transition duration between vector and pixel state (ms) */
  pixelTransitionMs?: number;
  /** Speed of the continuous sub-pixel sampling loop while hovered (Hz) */
  pixelJitterSpeed?: number;
  /** Amplitude of the sub-pixel sampling offset in low-res grid units (0..0.5) */
  pixelJitterAmplitude?: number;
}

/**
 * Generates the circular associative chain of relationships from an array of words:
 * [W0, W1], [W1, W2], ..., [Wn-1, W0]
 */
export function buildAssociativeSequence(
  words: string[]
): AssociativeRelationship[] {
  return words.map((word, idx) => {
    const nextIdx = (idx + 1) % words.length;
    return {
      index: idx,
      word1: word,
      word2: words[nextIdx],
      word1Id: idx,
      word2Id: nextIdx,
    };
  });
}

interface PixelatableWordProps {
  text: string;
  targetScale: number;
  transitionMs: number;
  jitterSpeed: number;
  jitterAmplitude: number;
  isTransitioning: boolean;
  reducedMotion: boolean;
  onHoverChange?: (hovered: boolean) => void;
}

/**
 * Renders a word in clean vector typography by default, and seamlessly transforms
 * it in-place into a sharp, hard-edged 8-bit nearest-neighbour pixelated rendering
 * on hover (or tap on touch devices), with a subtle continuous sub-pixel sampling loop.
 */
function PixelatableWord({
  text,
  targetScale,
  transitionMs,
  jitterSpeed,
  jitterAmplitude,
  isTransitioning,
  reducedMotion,
  onHoverChange,
}: PixelatableWordProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bufferCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const isHoveredRef = useRef(false);
  const progressRef = useRef(0); // 0 = pure vector, 1 = full target pixelation
  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const [canvasActive, setCanvasActive] = useState(false);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const renderFrame = useCallback(
    (now: number) => {
      const container = containerRef.current;
      const textEl = textRef.current;
      const canvas = canvasRef.current;
      if (!container || !textEl || !canvas) {
        stopLoop();
        return;
      }

      const dt = lastFrameTimeRef.current
        ? Math.min((now - lastFrameTimeRef.current) / 1000, 0.1)
        : 1 / 60;
      lastFrameTimeRef.current = now;

      const step = (dt * 1000) / Math.max(transitionMs, 60);
      const wantsPixel = isHoveredRef.current && !isTransitioning;

      if (wantsPixel) {
        progressRef.current = Math.min(1, progressRef.current + step);
      } else {
        progressRef.current = Math.max(0, progressRef.current - step);
      }

      const p = progressRef.current;
      if (p <= 0.001 && !wantsPixel) {
        progressRef.current = 0;
        setCanvasActive(false);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        stopLoop();
        return;
      }

      setCanvasActive(true);

      const rect = textEl.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) {
        rafRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const padX = Math.ceil(rect.height * 0.12);
      const padY = Math.ceil(rect.height * 0.22);
      const fullW = Math.ceil(rect.width + padX * 2);
      const fullH = Math.ceil(rect.height + padY * 2);

      const displayW = Math.round(fullW * dpr);
      const displayH = Math.round(fullH * dpr);

      if (canvas.width !== displayW || canvas.height !== displayH) {
        canvas.width = displayW;
        canvas.height = displayH;
        canvas.style.width = `${fullW}px`;
        canvas.style.height = `${fullH}px`;
        canvas.style.left = `${-padX}px`;
        canvas.style.top = `${-padY}px`;
      }

      const computed = window.getComputedStyle(textEl);
      const fontSizePx = parseFloat(computed.fontSize) || 64;
      const fontFamily =
        computed.fontFamily || "'HelveticaNowDisplay-Bold', sans-serif";
      const fontWeight = computed.fontWeight || '400';
      const letterSpacing = computed.letterSpacing || '-0.04em';
      const color = computed.color || '#066bbd';

      // Quantized discrete resolution steps during enter/leave so it steps like a digital instrument
      const easedP = 1 - Math.pow(1 - p, 2.2);
      // Scale factor transitions from 0.65 (fine initial grid) down to targetScale (subtle 8-bit blocks)
      const rawScale = 0.65 + (targetScale - 0.65) * easedP;
      const quantizedScale =
        Math.round(rawScale * 64) / 64 || targetScale;

      const lowW = Math.max(16, Math.round(fullW * quantizedScale));
      const lowH = Math.max(10, Math.round(fullH * quantizedScale));

      if (!bufferCanvasRef.current) {
        bufferCanvasRef.current = document.createElement('canvas');
      }
      const buf = bufferCanvasRef.current;
      if (buf.width !== lowW || buf.height !== lowH) {
        buf.width = lowW;
        buf.height = lowH;
      }

      const bCtx = buf.getContext('2d');
      const ctx = canvas.getContext('2d');
      if (!bCtx || !ctx) return;

      bCtx.clearRect(0, 0, lowW, lowH);
      bCtx.save();

      // Subtle living pixel-grid phase variation while hovered (respects reduced motion)
      let phaseX = 0;
      let phaseY = 0;
      if (!reducedMotion && p > 0.35) {
        const t = now * 0.001 * jitterSpeed * Math.PI * 2;
        // Stepped/quantized sub-pixel shift so aliasing edges subtly recalculate without drifting
        phaseX =
          (Math.round(Math.sin(t) * 2) / 2) *
          jitterAmplitude *
          p;
        phaseY =
          (Math.round(Math.cos(t * 0.85) * 2) / 2) *
          jitterAmplitude *
          p;
      }

      const scaleX = lowW / fullW;
      const scaleY = lowH / fullH;

      bCtx.translate(phaseX, phaseY);
      bCtx.scale(scaleX, scaleY);

      bCtx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;
      if ('letterSpacing' in bCtx) {
        (bCtx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          letterSpacing;
      }
      bCtx.fillStyle = color;
      bCtx.textBaseline = 'alphabetic';

      // Match DOM text baseline inside the padded box
      const metrics = bCtx.measureText(text);
      const ascent =
        metrics.actualBoundingBoxAscent || fontSizePx * 0.76;
      const descent =
        metrics.actualBoundingBoxDescent || fontSizePx * 0.18;
      const glyphHeight = ascent + descent;
      const drawY = padY + (rect.height - glyphHeight) * 0.5 + ascent;

      bCtx.fillText(text, padX, drawY);
      bCtx.restore();

      // Hard-edge threshold pass on the alpha channel so every pixel block is 100% crisp 8-bit square
      // with zero soft anti-aliased fringes
      const imgData = bCtx.getImageData(0, 0, lowW, lowH);
      const data = imgData.data;
      // Parse RGB from computed color (fallback to #066bbd = 6, 107, 189)
      let rCol = 6;
      let gCol = 107;
      let bCol = 189;
      const rgbMatch = color.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (rgbMatch) {
        rCol = parseInt(rgbMatch[1], 10);
        gCol = parseInt(rgbMatch[2], 10);
        bCol = parseInt(rgbMatch[3], 10);
      }

      const alphaCutoff = 116;
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a >= alphaCutoff) {
          data[i] = rCol;
          data[i + 1] = gCol;
          data[i + 2] = bCol;
          data[i + 3] = 255;
        } else {
          data[i + 3] = 0;
        }
      }
      bCtx.putImageData(imgData, 0, 0);

      // Nearest-neighbour upscale onto the high-DPI display canvas
      ctx.clearRect(0, 0, displayW, displayH);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        buf,
        -phaseX * (displayW / lowW),
        -phaseY * (displayH / lowH),
        displayW,
        displayH
      );
      ctx.restore();

      rafRef.current = requestAnimationFrame(renderFrame);
    },
    [
      isTransitioning,
      jitterAmplitude,
      jitterSpeed,
      reducedMotion,
      stopLoop,
      targetScale,
      text,
      transitionMs,
    ]
  );

  const startLoop = useCallback(() => {
    if (rafRef.current === null) {
      lastFrameTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(renderFrame);
    }
  }, [renderFrame]);

  // If a relationship transition begins while pixelated, smoothly resolve back to clean vector
  useEffect(() => {
    if (isTransitioning && (isHoveredRef.current || progressRef.current > 0)) {
      isHoveredRef.current = false;
      startLoop();
    }
  }, [isTransitioning, startLoop]);

  useEffect(() => {
    return () => {
      stopLoop();
    };
  }, [stopLoop]);

  const handlePointerEnter = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (e.pointerType === 'touch') return;
    isHoveredRef.current = true;
    onHoverChange?.(true);
    startLoop();
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (e.pointerType === 'touch') return;
    isHoveredRef.current = false;
    onHoverChange?.(false);
    startLoop();
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLSpanElement>) => {
    // On mobile/touch devices, tapping a dynamic word toggles its 8-bit pixelation state
    // without interfering with page scrolling
    e.stopPropagation();
    const next = !isHoveredRef.current;
    isHoveredRef.current = next;
    onHoverChange?.(next);
    startLoop();
  };

  return (
    <span
      ref={containerRef}
      className="AssocHero_dynamicWord"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onTouchEnd={handleTouchEnd}
    >
      {/* Accessible vector text remains in the DOM at all times */}
      <span
        ref={textRef}
        className="AssocHero_vectorText"
        style={{
          opacity: canvasActive ? 0 : 1,
        }}
      >
        {text}
      </span>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="AssocHero_pixelCanvas"
        style={{
          opacity: canvasActive ? 1 : 0,
        }}
      />
    </span>
  );
}

interface ActiveSlotWord {
  uid: number;
  wordIndex: number;
  text: string;
}

export function AssociativeHero({
  words = siteConfig.about.associativeWords,
  config,
}: {
  words?: string[];
  config?: AssociativeHeroConfig;
}) {
  const defaultCfg = siteConfig.about.associativeConfig;
  const cycleIntervalMs =
    config?.cycleIntervalMs ?? defaultCfg.cycleIntervalMs;
  const inactivityResumeMs =
    config?.inactivityResumeMs ?? defaultCfg.inactivityResumeMs;
  const transitionDurationMs =
    config?.transitionDurationMs ?? defaultCfg.transitionDurationMs;
  const pixelationTargetScale =
    config?.pixelationTargetScale ?? defaultCfg.pixelationTargetScale;
  const pixelTransitionMs =
    config?.pixelTransitionMs ?? defaultCfg.pixelTransitionMs;
  const pixelJitterSpeed =
    config?.pixelJitterSpeed ?? defaultCfg.pixelJitterSpeed;
  const pixelJitterAmplitude =
    config?.pixelJitterAmplitude ?? defaultCfg.pixelJitterAmplitude;

  const prefersReducedMotion = useReducedMotion() ?? false;
  const sequence = useMemo(() => buildAssociativeSequence(words), [words]);

  // Single atomic state for the active pair + exiting word so relay transitions are 100% synchronous
  const [state, setState] = useState<{
    relIndex: number;
    slot1: ActiveSlotWord;
    slot2: ActiveSlotWord;
    exitingWord: {
      uid: number;
      text: string;
      fromSlot: 1 | 2;
      direction: 1 | -1;
    } | null;
  }>(() => ({
    relIndex: 0,
    slot1: {
      uid: 1,
      wordIndex: 0,
      text: words[0],
    },
    slot2: {
      uid: 2,
      wordIndex: 1 % words.length,
      text: words[1 % words.length],
    },
    exitingWord: null,
  }));

  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextUidRef = useRef(3);
  const hoveredCountRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const lastManualInteractionRef = useRef<number>(0);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [mobileWordSizes, setMobileWordSizes] = useState<Record<string, string>>({});

  // Measure and compute per-word font sizes on mobile (< 768px) so every word spans the full phone width
  useEffect(() => {
    const computeMobileSizes = () => {
      const isPhone = window.matchMedia('(max-width: 767px)').matches;
      if (!isPhone || !stageRef.current) {
        setMobileWordSizes({});
        return;
      }

      const stageW = stageRef.current.clientWidth;
      if (stageW < 50) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const testPx = 100;
      ctx.font = `400 ${testPx}px 'HelveticaNowDisplay-Bold', sans-serif`;
      if ('letterSpacing' in ctx) {
        (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          '-0.04em';
      }

      const allWords = Array.from(new Set(['BETWEEN', 'AND', ...words]));
      const nextSizes: Record<string, string> = {};

      for (const w of allWords) {
        const metrics = ctx.measureText(w);
        const measuredW = Math.max(metrics.width, 10);
        // Scale so the word fills 99% of the available phone width
        const fittedPx = (stageW * 0.99 / measuredW) * testPx;
        nextSizes[w] = `${fittedPx.toFixed(1)}px`;
      }

      setMobileWordSizes(nextSizes);
    };

    computeMobileSizes();
    const t = setTimeout(computeMobileSizes, 120);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(computeMobileSizes).catch(() => {});
    }
    window.addEventListener('resize', computeMobileSizes);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', computeMobileSizes);
    };
  }, [words]);

  const stepRelationship = useCallback(
    (direction: 1 | -1, isManual: boolean) => {
      if (isManual) {
        lastManualInteractionRef.current = Date.now();
      }

      setIsTransitioning(true);
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setState((prev) => ({ ...prev, exitingWord: null }));
      }, transitionDurationMs);

      setState((prev) => {
        const nextIdx =
          (prev.relIndex + direction + sequence.length) % sequence.length;
        const nextRel = sequence[nextIdx];
        const freshUid = nextUidRef.current++;

        if (direction === 1) {
          // Forward step:
          // 1. prev.slot1 (e.g. BODIES) exits from Slot 1
          // 2. prev.slot2 (e.g. MACHINES) moves from Slot 2 into Slot 1 with its exact UID preserved
          // 3. nextRel.word2 (e.g. NATURE) enters Slot 2 with a fresh UID
          return {
            relIndex: nextIdx,
            slot1: {
              uid: prev.slot2.uid,
              wordIndex: nextRel.word1Id,
              text: nextRel.word1,
            },
            slot2: {
              uid: freshUid,
              wordIndex: nextRel.word2Id,
              text: nextRel.word2,
            },
            exitingWord: {
              uid: prev.slot1.uid,
              text: prev.slot1.text,
              fromSlot: 1,
              direction: 1,
            },
          };
        } else {
          // Backward step:
          // 1. prev.slot2 exits from Slot 2
          // 2. prev.slot1 moves from Slot 1 into Slot 2 with its exact UID preserved
          // 3. nextRel.word1 enters Slot 1 with a fresh UID
          return {
            relIndex: nextIdx,
            slot1: {
              uid: freshUid,
              wordIndex: nextRel.word1Id,
              text: nextRel.word1,
            },
            slot2: {
              uid: prev.slot1.uid,
              wordIndex: nextRel.word2Id,
              text: nextRel.word2,
            },
            exitingWord: {
              uid: prev.slot2.uid,
              text: prev.slot2.text,
              fromSlot: 2,
              direction: -1,
            },
          };
        }
      });
    },
    [sequence, transitionDurationMs]
  );

  // Automatic cycling timer: pauses while hovered or recently interacted with
  useEffect(() => {
    const checkTick = () => {
      if (hoveredCountRef.current > 0 || isHovered) return;
      const elapsedSinceManual =
        Date.now() - lastManualInteractionRef.current;
      if (elapsedSinceManual < inactivityResumeMs) return;
      stepRelationship(1, false);
    };

    const interval = setInterval(checkTick, cycleIntervalMs);
    return () => clearInterval(interval);
  }, [cycleIntervalMs, inactivityResumeMs, isHovered, stepRelationship]);

  // Keyboard Left / Right arrow navigation for previous and next relationships
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepRelationship(1, true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepRelationship(-1, true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [stepRelationship]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const handleWordHoverChange = useCallback((hovered: boolean) => {
    hoveredCountRef.current = Math.max(
      0,
      hoveredCountRef.current + (hovered ? 1 : -1)
    );
    setIsHovered(hoveredCountRef.current > 0);
  }, []);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Clicking anywhere on the typographic instrument advances to the next association
    const target = e.target as HTMLElement;
    if (target.closest('a, button')) return;
    stepRelationship(1, true);
  };

  const { relIndex, slot1, slot2, exitingWord } = state;

  const durationSec = prefersReducedMotion
    ? 0.01
    : transitionDurationMs / 1000;

  return (
    <div
      className="AssocHero_root"
      onClick={handleContainerClick}
      role="region"
      aria-label="Associative Typography: Interactive Concept Chain"
    >
      {/* Screen-reader live summary of the current relationship */}
      <div className="AssocHero_srOnly" aria-live="polite" aria-atomic="true">
        {`Between ${slot1.text} and ${slot2.text} (${relIndex + 1} of ${sequence.length})`}
      </div>

      <div className="AssocHero_stage" ref={stageRef}>
        {/* Line 1: Fixed structural word BETWEEN */}
        <div
          className="AssocHero_line AssocHero_lineBetween"
          style={
            mobileWordSizes['BETWEEN']
              ? { fontSize: mobileWordSizes['BETWEEN'] }
              : undefined
          }
        >
          <span className="AssocHero_fixedWord">BETWEEN</span>
        </div>

        {/* Line 2: Dynamic Word 1 (carries over from Word 2 on forward step) */}
        <div
          className="AssocHero_line AssocHero_lineWord1"
          style={
            mobileWordSizes[slot1.text]
              ? { fontSize: mobileWordSizes[slot1.text] }
              : undefined
          }
        >
          {exitingWord && exitingWord.fromSlot === 1 && (
            <motion.div
              key={`exit-${exitingWord.uid}`}
              className="AssocHero_wordExitOverlay"
              style={
                mobileWordSizes[exitingWord.text]
                  ? { fontSize: mobileWordSizes[exitingWord.text] }
                  : undefined
              }
              initial={{ opacity: 1, y: '0%', x: '0%' }}
              animate={{
                opacity: 0,
                y: prefersReducedMotion ? '0%' : '-58%',
                x: prefersReducedMotion ? '0%' : '-2%',
              }}
              transition={{
                duration: durationSec * 0.82,
                ease: easeOutExpo,
              }}
              aria-hidden="true"
            >
              <span className="AssocHero_vectorText">{exitingWord.text}</span>
            </motion.div>
          )}

          <motion.div
            key={slot1.uid}
            layoutId={
              prefersReducedMotion
                ? undefined
                : `assoc-word-${slot1.uid}`
            }
            className="AssocHero_wordCarrier"
            initial={
              exitingWord?.direction === -1
                ? {
                    opacity: 0,
                    y: prefersReducedMotion ? '0%' : '-55%',
                  }
                : false
            }
            animate={{ opacity: 1, y: '0%', x: '0%' }}
            transition={{
              layout: {
                duration: durationSec,
                ease: [0.19, 1, 0.22, 1],
              },
              opacity: {
                duration: durationSec * 0.7,
                ease: easeOutExpo,
              },
              y: {
                duration: durationSec,
                ease: easeOutExpo,
              },
            }}
          >
            <PixelatableWord
              text={slot1.text}
              targetScale={pixelationTargetScale}
              transitionMs={pixelTransitionMs}
              jitterSpeed={pixelJitterSpeed}
              jitterAmplitude={pixelJitterAmplitude}
              isTransitioning={isTransitioning}
              reducedMotion={prefersReducedMotion}
              onHoverChange={handleWordHoverChange}
            />
          </motion.div>
        </div>

        {/* Line 3: Fixed structural word AND */}
        <div
          className="AssocHero_line AssocHero_lineAnd"
          style={
            mobileWordSizes['AND']
              ? { fontSize: mobileWordSizes['AND'] }
              : undefined
          }
        >
          <span className="AssocHero_fixedWord AssocHero_andToken">AND</span>
        </div>

        {/* Line 4: Dynamic Word 2 */}
        <div
          className="AssocHero_line AssocHero_lineWord2"
          style={
            mobileWordSizes[slot2.text]
              ? { fontSize: mobileWordSizes[slot2.text] }
              : undefined
          }
        >
          <div className="AssocHero_slot2Container">
            {exitingWord && exitingWord.fromSlot === 2 && (
              <motion.div
                key={`exit-${exitingWord.uid}`}
                className="AssocHero_wordExitOverlay"
                style={
                  mobileWordSizes[exitingWord.text]
                    ? { fontSize: mobileWordSizes[exitingWord.text] }
                    : undefined
                }
                initial={{ opacity: 1, y: '0%', x: '0%' }}
                animate={{
                  opacity: 0,
                  y: prefersReducedMotion ? '0%' : '58%',
                  x: prefersReducedMotion ? '0%' : '2%',
                }}
                transition={{
                  duration: durationSec * 0.82,
                  ease: easeOutExpo,
                }}
                aria-hidden="true"
              >
                <span className="AssocHero_vectorText">{exitingWord.text}</span>
              </motion.div>
            )}

            <motion.div
              key={slot2.uid}
              layoutId={
                prefersReducedMotion
                  ? undefined
                  : `assoc-word-${slot2.uid}`
              }
              className="AssocHero_wordCarrier"
              initial={
                exitingWord?.direction === -1
                  ? false
                  : {
                      opacity: 0,
                      y: prefersReducedMotion ? '0%' : '58%',
                    }
              }
              animate={{ opacity: 1, y: '0%', x: '0%' }}
              transition={{
                layout: {
                  duration: durationSec,
                  ease: [0.19, 1, 0.22, 1],
                },
                opacity: {
                  duration: durationSec * 0.75,
                  delay: durationSec * 0.08,
                  ease: easeOutExpo,
                },
                y: {
                  duration: durationSec,
                  ease: easeOutExpo,
                },
              }}
            >
              <PixelatableWord
                text={slot2.text}
                targetScale={pixelationTargetScale}
                transitionMs={pixelTransitionMs}
                jitterSpeed={pixelJitterSpeed}
                jitterAmplitude={pixelJitterAmplitude}
                isTransitioning={isTransitioning}
                reducedMotion={prefersReducedMotion}
                onHoverChange={handleWordHoverChange}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssociativeHero;
