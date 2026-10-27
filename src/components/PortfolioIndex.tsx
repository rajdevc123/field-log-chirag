'use client';

import React from 'react';
import Link from 'next/link';
import { projects } from '@/content/projects';
import { siteConfig } from '@/content/siteConfig';
import { ArrowUpRight, Plus, Terminal } from 'lucide-react';

export function PortfolioIndex() {
  return (
    <div className="bg-[#E6E1D7] text-[#111111] font-mono">
      {/* ================= SELECTED WORKS SECTION ================= */}
      <section
        id="works"
        className="max-w-7xl mx-auto px-6 md:px-8 py-20 border-b border-[#111111]/25"
      >
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#111111] pb-4 mb-12">
          <div>
            <p className="text-xs text-[#6E6D67] tracking-widest mb-1">
              FIELD_ARCHIVE // SELECTED_WORKS
            </p>
            <h2 className="font-sans text-2xl md:text-4xl font-bold tracking-tight">
              INDEX OF INSTRUMENTS &amp; SYSTEMS
            </h2>
          </div>
          <p className="text-xs text-[#6E6D67]">
            [ TOTAL_ENTRIES: 0{projects.length} │ EDIT IN src/content/projects.ts ]
          </p>
        </div>

        {/* Swiss Grid Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/work/${project.slug}`}
              className="group flex flex-col justify-between border border-[#111111] bg-[#E6E1D7] p-6 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#111111]"
            >
              <div>
                {/* Top Metadata Row */}
                <div className="flex justify-between items-center text-xs border-b border-[#111111]/20 pb-3 mb-5">
                  <span className="font-bold">INDEX // {project.index}</span>
                  <span className="text-[#6E6D67]">{project.year}</span>
                </div>

                {/* 1-Bit Dithered Halftone Thumbnail Pattern */}
                <div className="relative h-40 w-full border border-[#111111] mb-5 overflow-hidden bg-[#E6E1D7] flex items-center justify-center">
                  <div
                    className="absolute inset-0 opacity-25 group-hover:opacity-45 transition-opacity"
                    style={{
                      backgroundImage:
                        'radial-gradient(#111111 1.25px, transparent 1.25px), radial-gradient(#111111 1.25px, #E6E1D7 1.25px)',
                      backgroundSize: '8px 8px',
                      backgroundPosition: '0 0, 4px 4px',
                    }}
                  />
                  <div className="relative z-10 border border-[#111111] bg-[#E6E1D7] px-3 py-1.5 text-[11px] tracking-widest font-bold">
                    {project.category}
                  </div>
                </div>

                {/* Title & Summary */}
                <h3 className="font-sans text-xl font-bold tracking-tight mb-1 group-hover:underline underline-offset-4">
                  {project.title}
                </h3>
                <p className="text-xs text-[#6E6D67] mb-4">{project.subtitle}</p>
                <p className="font-sans text-sm leading-relaxed text-[#111111]/90 mb-6">
                  {project.summary}
                </p>
              </div>

              {/* Tags + Inspect Action */}
              <div className="pt-4 border-t border-[#111111]/20 space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] border border-[#111111]/40 px-2 py-0.5 text-[#111111]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-xs font-bold pt-1">
                  <span>OPEN_DOSSIER</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Authoring Guide Callout Box */}
        <div className="mt-12 border border-dashed border-[#111111]/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#E6E1D7]">
          <div className="flex items-start gap-3">
            <Terminal className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-bold">HOW TO ADD OR EDIT PROJECTS</p>
              <p className="text-[#6E6D67] font-sans">
                Open <code className="font-mono text-[#111111] bg-[#111111]/10 px-1.5 py-0.5">src/content/projects.ts</code> to edit titles, descriptions, or add new project objects. Each item automatically generates its own case study route at <code className="font-mono text-[#111111] bg-[#111111]/10 px-1.5 py-0.5">/work/[slug]</code>.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs border border-[#111111] px-3 py-1.5 shrink-0">
            <Plus className="w-3.5 h-3.5" />
            <span>MODULAR_SHELL_READY</span>
          </span>
        </div>
      </section>

      {/* ================= ABOUT / SYSTEM INFO SECTION ================= */}
      <section
        id="about"
        className="max-w-7xl mx-auto px-6 md:px-8 py-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Left Column: Label & Identity */}
          <div className="md:col-span-4 space-y-4">
            <p className="text-xs text-[#6E6D67] tracking-widest">
              SYSTEM_INFO // 02
            </p>
            <h2 className="font-sans text-2xl font-bold tracking-tight">
              {siteConfig.designerName}
            </h2>
            <p className="text-xs text-[#6E6D67] leading-relaxed">
              {siteConfig.role}
              <br />
              {siteConfig.institution}
            </p>
            <div className="pt-4 space-y-2 text-xs">
              <p className="font-bold border-b border-[#111111]/20 pb-1">
                TRANSMISSION_LINKS
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                <a
                  href={siteConfig.links.email}
                  className="underline underline-offset-4 hover:text-[#6E6D67]"
                >
                  EMAIL
                </a>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-[#6E6D67]"
                >
                  GITHUB
                </a>
                <a
                  href={siteConfig.links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-[#6E6D67]"
                >
                  LINKEDIN
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Bio & Capabilities */}
          <div className="md:col-span-8 space-y-8">
            <p className="font-sans text-xl md:text-2xl font-medium leading-snug">
              {siteConfig.about.headline}
            </p>

            <div className="space-y-4 font-sans text-sm md:text-base text-[#111111]/85 leading-relaxed">
              {siteConfig.about.bioParagraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div className="border-t border-[#111111]/25 pt-6">
              <p className="text-xs text-[#6E6D67] tracking-widest mb-4">
                CORE_DISCIPLINES
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {siteConfig.about.capabilities.map((cap, idx) => (
                  <div
                    key={cap}
                    className="border border-[#111111] p-3 text-xs flex items-center gap-2.5"
                  >
                    <span className="text-[#6E6D67]">0{idx + 1}</span>
                    <span className="font-sans font-medium">{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Colophon */}
        <div className="mt-20 pt-6 border-t border-[#111111]/25 flex flex-wrap justify-between items-center gap-4 text-xs text-[#6E6D67]">
          <p>SUBSTRATE: #E6E1D7 │ INK: #111111 │ SHADER: 4x4_ORDERED_BAYER</p>
          <a
            href="#index"
            className="text-[#111111] hover:underline underline-offset-4"
          >
            [ ↑ RETURN_TO_SAVANNAH_VIEWPORT ]
          </a>
        </div>
      </section>
    </div>
  );
}
