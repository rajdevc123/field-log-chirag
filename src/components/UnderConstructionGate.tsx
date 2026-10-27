'use client';

import React, { useState, useEffect } from 'react';
import { siteConfig } from '@/content/siteConfig';

export function UnderConstructionGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [bypassed, setBypassed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('preview') === '1' || sessionStorage.getItem('preview_unlocked') === '1') {
      sessionStorage.setItem('preview_unlocked', '1');
      setBypassed(true);
    }

    const onKeyDown = (e: KeyboardEvent) => {
      // Secret creator shortcut: Shift + P toggles preview bypass
      if (e.shiftKey && e.code === 'KeyP') {
        setBypassed((prev) => {
          const next = !prev;
          if (next) sessionStorage.setItem('preview_unlocked', '1');
          else sessionStorage.removeItem('preview_unlocked');
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (!siteConfig.underConstruction || bypassed) {
    return (
      <>
        {siteConfig.underConstruction && bypassed && (
          <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 font-mono text-[10px] bg-[#111111] text-[#f3efe6] px-3 py-1 border border-[#ff380e] flex items-center gap-3 shadow-md">
            <span>PREVIEW MODE ACTIVE (PUBLIC SEES &quot;UNDER PROGRESS&quot; PAGE)</span>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('preview_unlocked');
                setBypassed(false);
              }}
              className="underline text-[#ffdc14] hover:text-[#ff380e]"
            >
              [LOCK]
            </button>
          </div>
        )}
        {children}
      </>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#f4f0e6] text-[#243822] font-mono flex flex-col justify-between p-6 md:p-12 relative overflow-hidden select-none">
      {/* Subtle Risograph Paper Grain & Registration Crop Marks */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(#3ca022 0.85px, transparent 0.85px), radial-gradient(#0c98bd 0.85px, #f4f0e6 0.85px)',
          backgroundSize: '12px 12px',
          backgroundPosition: '0 0, 6px 6px',
        }}
      />

      {/* Top Header Bar */}
      <header className="relative z-10 flex flex-wrap justify-between items-center gap-4 border-b border-[#243822]/25 pb-4 text-xs tracking-widest uppercase">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ff380e] ring-4 ring-[#ffdc14]/50 animate-pulse" />
          <span className="font-bold">FIELD_LOG // EDITION_2026</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/10"
            style={{ background: '#ffdc14' }}
            title="Sunflower Yellow"
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/10"
            style={{ background: '#ff380e' }}
            title="Fluorescent Vermilion"
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/10"
            style={{ background: '#3ca022' }}
            title="Botanical Leaf Green"
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/10"
            style={{ background: '#0c98bd' }}
            title="Registration Cyan"
          />
        </div>
      </header>

      {/* Center Registration Proof Card */}
      <section className="relative z-10 my-auto max-w-2xl mx-auto w-full">
        <div className="bg-[#f4f0e6]/95 border border-[#243822] p-8 md:p-12 shadow-[6px_6px_0px_#ff380e,-6px_-6px_0px_#0c98bd]">
          <div className="flex flex-wrap justify-between items-center gap-2 text-[11px] tracking-widest uppercase text-[#0c98bd] font-bold border-b border-[#243822]/20 pb-3 mb-6">
            <span>STATUS // PORTFOLIO IN PROGRESS</span>
            <span>[ PLATES IN REGISTRATION ]</span>
          </div>

          <h1 className="font-sans text-3xl md:text-5xl font-bold tracking-tight text-[#243822] mb-3">
            {siteConfig.designerName}
          </h1>
          <p className="text-xs md:text-sm tracking-wider uppercase text-[#eb3810] font-bold mb-6">
            {siteConfig.role} — {siteConfig.institution}
          </p>

          <p className="font-sans text-base md:text-lg leading-relaxed text-[#243822]/90 mb-8">
            This portfolio and interactive archive is currently being built and
            calibrated. New interactive WebGL environments, tactile hardware
            instruments, and case studies are being indexed for release.
          </p>

          <div className="pt-5 border-t border-[#243822]/20 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="text-[#243822]/70 uppercase tracking-wider">
              DIRECT_TRANSMISSION:
            </span>
            <div className="flex flex-wrap gap-5 font-bold">
              <a
                href={siteConfig.links.email}
                className="underline underline-offset-4 hover:text-[#ff380e] transition-colors"
              >
                EMAIL
              </a>
              <a
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-[#ff380e] transition-colors"
              >
                LINKEDIN
              </a>
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-[#ff380e] transition-colors"
              >
                GITHUB
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Footer Bar */}
      <footer className="relative z-10 flex flex-wrap justify-between items-center gap-4 border-t border-[#243822]/25 pt-4 text-[11px] tracking-widest uppercase text-[#243822]/75">
        <span>SUBSTRATE: #F4F0E6 │ 4-DRUM RISOGRAPH &amp; E-INK SYSTEMS</span>
        <span className="font-sans font-bold text-sm text-[#243822]">
          {siteConfig.monogram}
        </span>
      </footer>
    </main>
  );
}
