'use client';

import React, { useState, useRef } from 'react';
import { ElephantHero } from '@/components/ElephantHero';
import { PortfolioIndex } from '@/components/PortfolioIndex';
import { siteConfig } from '@/content/siteConfig';
import { ArrowDown } from 'lucide-react';

export default function PortfolioHomePage() {
  const [heroMode, setHeroMode] = useState<'riso' | 'eink'>('riso');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <main className="min-h-screen w-full bg-[#E6E1D7] text-[#111111] selection:bg-[#111111] selection:text-[#E6E1D7]">
      {heroMode === 'riso' ? (
        <section
          id="index"
          className="relative w-full h-screen bg-[#f3efe6] overflow-hidden border-b border-[#141311]/25 font-mono"
        >
          {/* Full-Viewport 4-Drum Risograph Botanical Wilderness ("The Last Inkwell") */}
          <iframe
            ref={iframeRef}
            src="/elephant-walk/index.html"
            title="The Last Inkwell — 4-Drum Risograph Botanical Wilderness"
            className="w-full h-full border-0 block"
            onLoad={() => iframeRef.current?.contentWindow?.focus()}
          />

          {/* Top-Center Editorial Field Log Navigation Bar */}
          <div className="pointer-events-none absolute top-5 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-3">
            <div className="pointer-events-auto flex items-center gap-4 bg-[#f3efe6]/92 border border-[#388c26]/35 px-3.5 py-2 text-[11px] tracking-widest uppercase text-[#243822] shadow-[2px_2px_0_rgba(255,62,20,0.20),-2px_-2px_0_rgba(12,152,186,0.16)]">
              <span className="font-bold text-[#eb3810]">
                {siteConfig.designerName} // FIELD LOG
              </span>
              <span className="text-[#243822]/40">│</span>
              <a
                href="#works"
                className="font-bold hover:text-[#eb3810] transition-colors"
              >
                [ 01 : WORKS ]
              </a>
              <a
                href="#about"
                className="font-bold hover:text-[#eb3810] transition-colors"
              >
                [ 02 : SYSTEM_INFO ]
              </a>
              <span className="text-[#243822]/40">│</span>
              <button
                type="button"
                onClick={() => setHeroMode('eink')}
                className="text-[10px] border border-[#243822]/35 px-2 py-0.5 hover:bg-[#243822] hover:text-[#f3efe6] transition-colors"
                title="Switch to 1-Bit E-Ink Savannah Viewport"
              >
                SWITCH TO 1-BIT E-INK
              </button>
            </div>
          </div>

          {/* Bottom-Right Scroll to Portfolio Archive Button */}
          <div className="pointer-events-none absolute bottom-20 right-5 z-20">
            <a
              href="#works"
              className="pointer-events-auto inline-flex items-center gap-2 bg-[#f3efe6]/95 border border-[#ff380e] px-3.5 py-2 text-[11px] font-bold tracking-wider uppercase text-[#243822] hover:bg-[#ff380e] hover:text-[#f3efe6] transition-colors shadow-[2px_2px_0_#ffdc14,-2px_-2px_0_#0c98bd]"
            >
              <span>FIELD_ARCHIVE // WORKS</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      ) : (
        <div className="relative">
          <ElephantHero />
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-30 font-mono">
            <button
              type="button"
              onClick={() => setHeroMode('riso')}
              className="bg-[#ECE7DC]/95 border border-[#141311] px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase text-[#141311] hover:bg-[#141311] hover:text-[#ECE7DC] transition-colors shadow-[2px_2px_0_#141311]"
            >
              [ SWITCH TO 4-DRUM RISOGRAPH WILDERNESS ]
            </button>
          </div>
        </div>
      )}

      {/* Modular Portfolio Index & System Info Shell Below the Fold */}
      <PortfolioIndex />
    </main>
  );
}
