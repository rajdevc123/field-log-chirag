'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// A thin line across the top of the screen that fills as you read.
// Portalled to <body> so no transformed ancestor can break `position: fixed`.
export function ReadingProgress() {
  const [mounted, setMounted] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // Images and the viewer load late and change the page height.
    const ro = new ResizeObserver(onScroll);
    ro.observe(document.body);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div className="Progress_track" aria-hidden="true">
      <div ref={barRef} className="Progress_bar" />
    </div>,
    document.body,
  );
}

export default ReadingProgress;
