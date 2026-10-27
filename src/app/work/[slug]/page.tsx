import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects } from '@/content/projects';
import { siteConfig } from '@/content/siteConfig';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const projectIndex = projects.findIndex((p) => p.slug === params.slug);
  if (projectIndex === -1) {
    notFound();
  }

  const project = projects[projectIndex];
  const nextProject = projects[(projectIndex + 1) % projects.length];

  return (
    <main className="min-h-screen bg-[#E6E1D7] text-[#111111] font-mono selection:bg-[#111111] selection:text-[#E6E1D7]">
      {/* Top Swiss Telemetry Header */}
      <header className="sticky top-0 z-20 bg-[#E6E1D7]/95 backdrop-blur-sm border-b border-[#111111] px-6 md:px-8 py-4 flex justify-between items-center text-xs">
        <Link
          href="/#works"
          className="inline-flex items-center gap-2 hover:underline underline-offset-4 font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>[ RETURN_TO_INDEX ]</span>
        </Link>
        <div className="hidden sm:flex items-center gap-6 text-[#6E6D67]">
          <span>DOSSIER // {project.index}</span>
          <span>{project.category}</span>
        </div>
        <Link href="/" className="font-sans font-bold text-sm">
          {siteConfig.monogram}
        </Link>
      </header>

      <article className="max-w-5xl mx-auto px-6 md:px-8 py-14">
        {/* Title & Metadata Matrix */}
        <div className="border-b border-[#111111] pb-10 mb-12">
          <p className="text-xs text-[#6E6D67] tracking-widest mb-2">
            ARCHIVE_ENTRY // {project.index} — {project.year}
          </p>
          <h1 className="font-sans text-3xl md:text-5xl font-bold tracking-tight mb-3">
            {project.title}
          </h1>
          <p className="font-sans text-lg text-[#6E6D67] mb-8">
            {project.subtitle}
          </p>

          {/* Swiss Specification Table */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-l border-[#111111] text-xs">
            <div className="border-r border-b border-[#111111] p-3.5">
              <p className="text-[#6E6D67] mb-1">CONTEXT</p>
              <p className="font-sans font-medium">{project.clientOrContext}</p>
            </div>
            <div className="border-r border-b border-[#111111] p-3.5">
              <p className="text-[#6E6D67] mb-1">ROLE &amp; ARCHITECTURE</p>
              <p className="font-sans font-medium">{project.role}</p>
            </div>
            <div className="border-r border-b border-[#111111] p-3.5">
              <p className="text-[#6E6D67] mb-1">DURATION</p>
              <p className="font-sans font-medium">{project.duration}</p>
            </div>
          </div>
        </div>

        {/* Hero Visual Frame / Interactive Embed Slot */}
        <div className="border border-[#111111] bg-[#E6E1D7] p-6 md:p-10 mb-14 shadow-[6px_6px_0px_#111111]">
          {project.interactiveEmbedUrl ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-[#6E6D67]">
                <span>LIVE_INTERACTIVE_VIEWPORT</span>
                <a
                  href={project.interactiveEmbedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#111111] underline"
                >
                  <span>FULLSCREEN</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
              <iframe
                src={project.interactiveEmbedUrl}
                title={project.title}
                className="w-full h-[500px] border border-[#111111]"
              />
            </div>
          ) : (
            <div className="relative h-64 md:h-80 w-full border border-[#111111] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(#111111 1.5px, transparent 1.5px), radial-gradient(#111111 1.5px, #E6E1D7 1.5px)',
                  backgroundSize: '10px 10px',
                  backgroundPosition: '0 0, 5px 5px',
                }}
              />
              <div className="relative z-10 max-w-md bg-[#E6E1D7] border border-[#111111] p-4">
                <p className="text-xs font-bold mb-1">
                  MEDIA_SLOT // {project.slug.toUpperCase()}
                </p>
                <p className="font-sans text-xs text-[#6E6D67]">
                  Drop images or videos into <code className="font-mono text-[#111111]">/public/projects/{project.slug}/</code> or set <code className="font-mono text-[#111111]">interactiveEmbedUrl</code> in <code className="font-mono text-[#111111]">src/content/projects.ts</code>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Case Study Sections */}
        <div className="space-y-12">
          {project.sections.map((section, idx) => (
            <section
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 border-b border-[#111111]/20 pb-10"
            >
              <div className="md:col-span-4">
                <h2 className="text-xs font-bold tracking-widest text-[#111111]">
                  {section.heading}
                </h2>
              </div>
              <div className="md:col-span-8 space-y-4">
                <p className="font-sans text-base leading-relaxed text-[#111111]/90">
                  {section.body}
                </p>
                {section.caption && (
                  <p className="text-xs text-[#6E6D67] border-l-2 border-[#111111] pl-3 py-0.5">
                    {section.caption}
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* Next Project Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-[#111111] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-xs text-[#6E6D67]">NEXT_DOSSIER // {nextProject.index}</p>
            <p className="font-sans text-xl font-bold">{nextProject.title}</p>
          </div>
          <Link
            href={`/work/${nextProject.slug}`}
            className="inline-flex items-center gap-2 border border-[#111111] px-4 py-2.5 text-xs font-bold hover:bg-[#111111] hover:text-[#E6E1D7] transition-colors shadow-[3px_3px_0px_#111111]"
          >
            <span>PROCEED_TO_ENTRY</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </article>
    </main>
  );
}
