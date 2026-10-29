'use client';

import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { ElephantModel, HullData } from '@/components/ElephantModel';
import { TerrainEnvironment } from '@/components/Environment';
import { siteConfig } from '@/content/siteConfig';
import { ArrowDown } from 'lucide-react';

export function ElephantHero() {
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [cursorTelemetry, setCursorTelemetry] = useState({ x: '0.00', y: '0.00' });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollOffsetRef = useRef(0.0);

  // Direct DOM refs for 60fps zero-re-render CV Convex Hull & cobalt-blue tracking badges
  const motherPolyRef = useRef<SVGPolygonElement>(null);
  const motherBadgeRef = useRef<HTMLDivElement>(null);
  const calfPolyRef = useRef<SVGPolygonElement>(null);
  const calfBadgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      setCursorTelemetry({ x: nx.toFixed(2), y: ny.toFixed(2) });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleWalkDelta = useCallback((deltaScroll: number) => {
    scrollOffsetRef.current += deltaScroll;
  }, []);

  const handleMotherHull = useCallback((hull: HullData) => {
    if (motherPolyRef.current) {
      motherPolyRef.current.setAttribute('points', hull.points);
    }
    if (motherBadgeRef.current) {
      motherBadgeRef.current.style.transform = `translate3d(${hull.topVertex.x - 10}px, ${
        hull.topVertex.y - 26
      }px, 0)`;
      motherBadgeRef.current.style.opacity = '1';
    }
  }, []);

  const handleCalfHull = useCallback((hull: HullData) => {
    if (calfPolyRef.current) {
      calfPolyRef.current.setAttribute('points', hull.points);
    }
    if (calfBadgeRef.current) {
      calfBadgeRef.current.style.transform = `translate3d(${hull.topVertex.x - 10}px, ${
        hull.topVertex.y - 24
      }px, 0)`;
      calfBadgeRef.current.style.opacity = '1';
    }
  }, []);

  return (
    <section
      ref={containerRef}
      id="index"
      className={`relative w-full h-screen bg-[#ECE7DC] overflow-hidden select-none font-mono border-b border-[#141311]/25 ${
        isHovered ? 'cursor-pointer' : 'cursor-crosshair'
      }`}
    >
      {/* ================= LAYER 1: 3D WEBGL CANVAS (STIPPLE SKY, WAVE GROUND & WALKING ELEPHANTS) ================= */}
      <Canvas
        orthographic
        frameloop={isInView ? 'always' : 'never'}
        dpr={[1, 2]}
        camera={{ zoom: 105, position: [0, 0.35, 15], near: -50, far: 100 }}
        className="absolute inset-0 z-0"
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[-5, 9, 6]} intensity={1.2} />

        {/* Full-Screen 1-Bit Stipple Sky & Scrolling Turing Wave-Dithered Ground */}
        <TerrainEnvironment scrollOffsetRef={scrollOffsetRef} />

        <Suspense fallback={null}>
          {/* Mother Elephant (Side-profile walk cycle; turns head to look at user on hover) */}
          <ElephantModel
            position={[0.55, -1.62, 0]}
            isHovered={isHovered}
            onHoverChange={setIsHovered}
            onHullUpdate={handleMotherHull}
            onWalkDelta={handleWalkDelta}
          />

          {/* Calf Elephant (Walks alongside mother; also pauses & looks at user on hover) */}
          <ElephantModel
            position={[-2.05, -1.58, 0.85]}
            isCalf
            isHovered={isHovered}
            onHoverChange={setIsHovered}
            onHullUpdate={handleCalfHull}
          />
        </Suspense>
      </Canvas>

      {/* ================= LAYER 2: REAL-TIME COMPUTER-VISION CONVEX HULL & COBALT-BLUE BADGES ================= */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <svg className="w-full h-full">
          {/* Mother Elephant Live Convex Hull Polygon */}
          <polygon
            ref={motherPolyRef}
            fill="none"
            stroke="#8A88A8"
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
          {/* Calf Elephant Live Convex Hull Polygon */}
          <polygon
            ref={calfPolyRef}
            fill="none"
            stroke="#8A88A8"
            strokeWidth="1.15"
            strokeLinejoin="round"
            strokeDasharray="none"
          />
        </svg>

        {/* Cobalt-Blue Micro Tracking Tag [037] anchored to Mother's top hull vertex */}
        <div
          ref={motherBadgeRef}
          style={{ opacity: 0 }}
          className="absolute top-0 left-0 bg-[#3B49DF] text-[#ECE7DC] text-[9px] leading-none font-mono font-bold px-1.5 py-[3px] tracking-tighter shadow-sm transition-opacity duration-150"
        >
          037
        </div>

        {/* Cobalt-Blue Micro Tracking Tag [038] anchored to Calf's top hull vertex */}
        <div
          ref={calfBadgeRef}
          style={{ opacity: 0 }}
          className="absolute top-0 left-0 bg-[#3B49DF] text-[#ECE7DC] text-[9px] leading-none font-mono font-bold px-1.5 py-[3px] tracking-tighter shadow-sm transition-opacity duration-150"
        >
          038
        </div>

        {/* Left Margin Secondary Blue Telemetry Tick (Matches reference bottom-left blue edge tag) */}
        <div className="absolute left-0 bottom-[19.5%] bg-[#3B49DF] text-[#ECE7DC] text-[9px] leading-none font-mono font-bold px-1 py-[2px]">
          5
        </div>
      </div>

      {/* ================= LAYER 3: SWISS TELEMETRY HUD OVERLAY ================= */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 md:p-8 text-[#141311]">
        {/* Header Bar */}
        <header className="flex flex-wrap justify-between items-start gap-4 text-xs tracking-widest border-b border-[#141311]/25 pb-3 bg-[#ECE7DC]/70 backdrop-blur-[2px] px-3 py-2">
          <div className="space-y-1">
            <p className="font-bold">{siteConfig.telemetry.sectorCode}</p>
            <div className="flex items-center gap-3 text-[#5A5852]">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`inline-block w-2 h-2 border border-[#141311] ${
                    isHovered ? 'bg-[#3B49DF] border-[#3B49DF]' : 'bg-[#141311]'
                  }`}
                />
                STATUS: {isHovered ? 'OBSERVING_USER [HALTED]' : 'TRAVERSING_SAVANNA [WALK]'}
              </span>
              <span className="hidden sm:inline">│</span>
              <span className="hidden sm:inline">
                VEC: [{cursorTelemetry.x}, {cursorTelemetry.y}]
              </span>
            </div>
          </div>

          {/* Navigation + Telemetry Right */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-5 pointer-events-auto">
            <nav className="flex items-center gap-4 text-xs font-bold">
              <a
                href="#works"
                className="hover:text-[#3B49DF] transition-colors"
              >
                [ 01 : WORKS ]
              </a>
              <a
                href="#about"
                className="hover:text-[#3B49DF] transition-colors"
              >
                [ 02 : SYSTEM_INFO ]
              </a>
            </nav>
            <p className="text-[11px] text-[#5A5852]">
              {siteConfig.telemetry.coordinates}
            </p>
          </div>
        </header>

        {/* Bottom HUD Row: Thought Unfold Card + Scroll Prompt + Footer */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            {/* Thought Unfold (Unfolds when hovering on the elephants) */}
            <AnimatePresence mode="wait">
              {isHovered ? (
                <motion.div
                  key="hover-thought"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="pointer-events-auto max-w-md bg-[#ECE7DC]/95 border border-[#141311] p-4 shadow-[4px_4px_0px_#141311]"
                >
                  <div className="flex justify-between items-center text-[11px] text-[#5A5852] mb-1.5 border-b border-[#141311]/20 pb-1">
                    <span className="font-bold text-[#141311]">
                      {siteConfig.telemetry.horizonLogTitle}
                    </span>
                    <span className="bg-[#3B49DF] text-[#ECE7DC] px-1.5 py-0.5 text-[9px] font-bold">
                      OBJ_ID // 037_038
                    </span>
                  </div>
                  <p className="text-sm font-sans font-medium leading-relaxed text-[#141311]">
                    {siteConfig.telemetry.horizonLogQuote}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="walk-prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-auto border border-[#141311]/50 bg-[#ECE7DC]/90 px-3.5 py-2 text-xs text-[#141311]"
                >
                  [ HOVER ON ELEPHANTS TO HALT WALK &amp; ENGAGE GAZE TRACKING ]
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scroll Down to Portfolio Index Button */}
            <a
              href="#works"
              className="pointer-events-auto inline-flex items-center gap-2 border border-[#141311] bg-[#ECE7DC]/95 px-3.5 py-2 text-xs font-bold tracking-wider hover:bg-[#141311] hover:text-[#ECE7DC] transition-colors shadow-[3px_3px_0px_#141311]"
            >
              <span>ARCHIVE_INDEX</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Footer Bar */}
          <footer className="flex justify-between items-end border-t border-[#141311]/25 pt-2.5 text-xs bg-[#ECE7DC]/70 backdrop-blur-[2px] px-3 py-1.5">
            <p>{siteConfig.telemetry.sectorCounter}</p>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-[#5A5852] text-[11px]">
                {siteConfig.designerName}
              </span>
              <p className="font-sans font-bold text-sm tracking-tight">
                {siteConfig.monogram}
              </p>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
