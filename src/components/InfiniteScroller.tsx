'use client';

import React, { useEffect, useRef } from 'react';

interface SectionMetric {
  height: number;
  offset: number;
  y: number;
}

/**
 * Exact replica of Stefan's InfiniteScroller component (module 8644 in _app.js)
 * used on the /about page for seamless bidirectional infinite scrolling.
 */
export function InfiniteScroller({ children }: { children: React.ReactNode }) {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const metricsRef = useRef<SectionMetric[]>([]);
  const totalHeightRef = useRef(0);

  const childArray = React.Children.toArray(children).filter(Boolean);

  useEffect(() => {
    const els = sectionRefs.current.filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;

    const measure = () => {
      const prevMetrics = metricsRef.current;
      const prevTotal = totalHeightRef.current;

      // Temporarily clear transforms to measure natural layout heights
      els.forEach((el) => {
        el.style.transform = '';
      });

      const nextMetrics: SectionMetric[] = [];
      let runningOffset = 0;

      els.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        // Add generous breathing room after the last section so loop wrap has clean spacing
        const extraPad = idx === els.length - 1 ? window.innerHeight * 0.18 : 0;
        const h = rect.height + extraPad;
        nextMetrics.push({
          height: h,
          offset: runningOffset,
          y: 0,
        });
        runningOffset += h;
      });

      totalHeightRef.current = runningOffset;

      nextMetrics.forEach((m, idx) => {
        const oldY = prevMetrics[idx]?.y ?? 0;
        m.y =
          prevTotal > 0 && runningOffset > 0
            ? oldY * (runningOffset / prevTotal)
            : 0;
        const el = els[idx];
        if (el) {
          el.style.transform = `translate3d(0, ${m.y}px, 0)`;
          el.style.visibility = 'visible';
        }
      });

      metricsRef.current = nextMetrics;
    };

    measure();
    const tMeasure = setTimeout(measure, 150);
    window.addEventListener('resize', measure);

    let scrollDelta = 0;
    let smoothedStep = 0;
    let lastTime = performance.now();
    let rafId = 0;

    const onWheel = (e: WheelEvent) => {
      // Accumulate wheel momentum so trackpads and mouse wheels feel responsive and smooth
      const rawDelta =
        e.deltaMode === 1
          ? e.deltaY * 32
          : e.deltaMode === 2
            ? e.deltaY * window.innerHeight * 0.8
            : e.deltaY;
      scrollDelta = Math.max(
        -180,
        Math.min(180, scrollDelta - rawDelta * 0.42)
      );
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const currentY = e.touches[0].clientY;
        const dy = currentY - touchStartY;
        touchStartY = currentY;
        scrollDelta = Math.max(-180, Math.min(180, scrollDelta + dy * 1.4));
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.code === 'Space') {
        scrollDelta = Math.max(-180, scrollDelta - 65);
      } else if (e.key === 'ArrowUp') {
        scrollDelta = Math.min(180, scrollDelta + 65);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Frame-rate independent momentum decay
      scrollDelta *= Math.pow(0.88, dt * 60);
      if (Math.abs(scrollDelta) < 0.001) {
        scrollDelta = 0;
      }

      // Smooth damped lerp with responsive tracking
      const lerpFactor = 1 - Math.pow(1 - 0.16, dt * 60);
      smoothedStep =
        0.99 *
        (smoothedStep + (scrollDelta - smoothedStep) * lerpFactor);

      if (Math.abs(smoothedStep) >= 0.001) {
        const margin = 0.1 * window.innerHeight;
        const totalH = totalHeightRef.current;
        const metrics = metricsRef.current;

        for (let i = 0; i < metrics.length; i++) {
          const m = metrics[i];
          const el = els[i];
          if (!m || !el) continue;

          m.y += smoothedStep;

          if (
            m.offset + m.height + m.y > -margin &&
            m.offset + m.y < window.innerHeight + margin
          ) {
            el.style.visibility = 'visible';
            el.style.transform = `translate3d(0, ${m.y}px, 0)`;
          } else {
            el.style.visibility = 'hidden';
          }

          if (m.offset + m.height + m.y < -margin) {
            m.y += Math.max(totalH, m.height + margin);
          } else if (m.offset + m.y > window.innerHeight + margin) {
            m.y -= Math.max(totalH, m.height + margin);
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      clearTimeout(tMeasure);
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', measure);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [childArray.length]);

  return (
    <div className="InfiniteScroller_scrollWrapper">
      {childArray.map((child, idx) => (
        <section
          key={idx}
          ref={(el) => {
            sectionRefs.current[idx] = el;
          }}
          className="InfiniteScroller_scrollItem"
          data-id={idx}
        >
          {child}
        </section>
      ))}
    </div>
  );
}

export default InfiniteScroller;
