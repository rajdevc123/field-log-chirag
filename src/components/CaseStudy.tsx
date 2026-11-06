'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { ProjectEntry } from '@/content/getProjects';
import { siteConfig } from '@/content/site';
import { BodyCopyLarge, BodyCopyMedium, Title } from './Text';
import { RevealMask } from './RevealMask';
import { PageTitle } from './MarqueeHeading';
import { SiteFooter } from './SiteFooter';

function isVideoSrc(src: string) {
  return /\.(mp4|webm|mov)$/i.test(src);
}

function isYouTubeSrc(src: string) {
  return /youtube\.com|youtu\.be/i.test(src);
}

function getYouTubeEmbedUrl(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_\-]+)/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function ListSection({
  title,
  items,
  delay = 0,
  className = '',
}: {
  title?: string;
  items: (string | { label: string; url: string; internal?: boolean })[];
  delay?: number;
  className?: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`List_listWrapper ${className}`.trim()}>
      {title && (
        <BodyCopyLarge className="List_listTitle">
          <RevealMask show={true} delay={delay}>
            {title}
          </RevealMask>
        </BodyCopyLarge>
      )}
      <ul>
        {items.map((item, idx) => (
          <li key={idx} className="List_listItem">
            {typeof item === 'string' ? (
              <BodyCopyMedium>
                <RevealMask show={true} delay={delay + (idx + 1) * 0.08}>
                  {item}
                </RevealMask>
              </BodyCopyMedium>
            ) : item.internal ? (
              <Link className="List_link" href={item.url} scroll={false}>
                <BodyCopyMedium>
                  <RevealMask
                    show={true}
                    delay={delay + 0.1}
                    className="List_label"
                  >
                    {item.label}
                  </RevealMask>
                </BodyCopyMedium>
              </Link>
            ) : (
              <a
                className="List_link"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BodyCopyMedium>
                  <RevealMask
                    show={true}
                    delay={delay + 0.1}
                    className="List_label"
                  >
                    {item.label}
                  </RevealMask>
                </BodyCopyMedium>
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileMediaStack({
  media,
  colors = [],
  className = '',
}: {
  media: string[];
  colors?: string[];
  className?: string;
}) {
  const total = String(media.length).padStart(2, '0');

  return (
    <ul className={`MediaGrid_mediaGrid ${className}`.trim()}>
      {media.map((src, i) => {
        const indexStr = String(i + 1).padStart(2, '0');
        return (
          <li key={i} className="MediaGrid_mediaItem">
            <div className="MediaGrid_mediaTop">
              <div className="MediaGrid_index">
                <BodyCopyLarge as="span">{indexStr}</BodyCopyLarge>
              </div>
              <div className="MediaGrid_total">
                <BodyCopyLarge as="span">/ {total}</BodyCopyLarge>
              </div>
            </div>
            <div
              className="MediaGrid_mediaContent"
              style={{
                backgroundColor: colors[i] || 'var(--color-default)',
              }}
            >
              {isYouTubeSrc(src) ? (
                <iframe
                  src={getYouTubeEmbedUrl(src)}
                  title={`Video ${indexStr}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 0,
                    display: 'block',
                  }}
                />
              ) : isVideoSrc(src) ? (
                <video src={src} autoPlay muted loop playsInline controls />
              ) : (
                <img src={src} alt="" />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function BannerOnly({
  project,
  mdxContent,
}: {
  project: ProjectEntry;
  mdxContent?: React.ReactNode;
}) {
  const router = useRouter();
  const overview = project.overview || [];

  useEffect(() => {
    document.body.classList.add('Banner_page');
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push('/work');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('Banner_page');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [router]);

  return (
    <div id="project" className="Project_project">
      <div className="Banner_hero">
        <img className="Banner_image" src={project.banner} alt={project.title} />

        <Link href="/work" scroll={false} className="Banner_back">
          <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          <span>Back to projects</span>
        </Link>

        {overview.length > 0 && (
          <motion.dl
            className="Meta_bar"
            aria-label="Project overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
          >
            {overview.map((row) => (
              <div className="Meta_group" key={row.label}>
                <dt className="Meta_groupLabel">{row.label}</dt>
                <dd className="Meta_tags">
                  {row.value.split(' · ').map((tag) => (
                    <span key={tag} className="Meta_tag">
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </motion.dl>
        )}
      </div>

      {mdxContent}
    </div>
  );
}

export function CaseStudy({
  project,
  mdxContent,
}: {
  project: ProjectEntry;
  mdxContent?: React.ReactNode;
}) {
  const router = useRouter();
  const [showNextCta, setShowNextCta] = useState(false);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targetYRef = useRef(0);
  const currentYRef = useRef(0);
  const maxScrollRef = useRef(0);
  const overscrollUpRef = useRef(0);
  const navigatedRef = useRef(false);

  // Escape key returns to /work (matches Stefan's project-id.js)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/work');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [router]);

  // Smooth lerp scroll for the right-hand media stack (matches Stefan's chunk-892.js)
  useEffect(() => {
    targetYRef.current = 0;
    currentYRef.current = 0;
    overscrollUpRef.current = 0;
    navigatedRef.current = false;

    const measure = () => {
      const trackEl = trackRef.current;
      if (!trackEl) return;
      const totalH = trackEl.scrollHeight;
      maxScrollRef.current = Math.max(0, totalH - window.innerHeight * 0.85);
      targetYRef.current = Math.max(
        0,
        Math.min(maxScrollRef.current, targetYRef.current)
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);

    let rafId = 0;
    let lastTime = performance.now();
    const mountTime = Date.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Decay overscroll up momentum
      if (overscrollUpRef.current > 0) {
        overscrollUpRef.current *= Math.pow(0.85, dt * 60);
        if (overscrollUpRef.current < 0.5) overscrollUpRef.current = 0;
      }

      const diff = targetYRef.current - currentYRef.current;
      const lerp = 1 - Math.pow(1 - 0.08, dt * 60);
      currentYRef.current += diff * lerp;
      const velocity = diff * lerp;

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(0, ${-currentYRef.current}px, 0)`;
      }

      // Subtle parallax distortion on frames while scrolling
      for (let i = 0; i < frameRefs.current.length; i++) {
        const frame = frameRefs.current[i];
        if (!frame) continue;
        const skew = Math.max(-2.5, Math.min(2.5, velocity * 0.04));
        frame.style.transform = `skewY(${skew}deg)`;
      }

      const progress =
        maxScrollRef.current > 0
          ? currentYRef.current / maxScrollRef.current
          : 1;
      setShowNextCta(progress > 0.65 || maxScrollRef.current <= 10);

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      const isDesktop = window.matchMedia('(min-width: 900px)').matches;
      if (!isDesktop) return;

      // Ignore spillover momentum from navigation transition for 450ms
      if (Date.now() - mountTime < 450) return;

      measure();
      const maxS = maxScrollRef.current;
      const atTop = targetYRef.current <= 2;

      const normalizedDelta =
        e.deltaMode === 1
          ? e.deltaY * 20
          : e.deltaMode === 2
            ? e.deltaY * 100
            : e.deltaY;

      // Scroll up at top returns to /work (matches Stefan's chunk-764.js)
      if (normalizedDelta < 0 && atTop) {
        overscrollUpRef.current += Math.abs(normalizedDelta);
        if (overscrollUpRef.current > 380 && !navigatedRef.current) {
          navigatedRef.current = true;
          router.push('/work');
        }
        return;
      }

      overscrollUpRef.current = 0;
      const step = Math.max(-140, Math.min(140, normalizedDelta * 0.35));
      targetYRef.current = Math.max(
        0,
        Math.min(maxS, targetYRef.current + step)
      );
    };

    window.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('wheel', onWheel);
    };
  }, [project.slug, router]);

  const contextMeta = siteConfig.contexts.find((c) => c.id === project.context);
  const contextLine = contextMeta
    ? `${contextMeta.fullName} (${project.year})`
    : String(project.year);

  // Matches Stefan's "Role" section: role line + tools/mediums line
  const roleItems = [
    project.role,
    ...(project.tools && project.tools.length > 0
      ? [project.tools.join(' / ')]
      : []),
  ];

  // Matches Stefan's "Awards & Recognitions" section: context + collaborators
  const contextItems = [
    contextLine,
    ...(project.collaborators && project.collaborators.length > 0
      ? project.collaborators
      : []),
  ];

  const mediaList =
    project.media && project.media.length > 0
      ? project.media
      : [project.thumbnail];

  if (project.banner) {
    return <BannerOnly project={project} mdxContent={mdxContent} />;
  }

  return (
    <div id="project" className="Project_project">
      <div className="Spacer_spacer" />

      {/* Mobile Top Back Link (< 900px) */}
      <div className="MobileBackNav">
        <Link href="/work" scroll={false} className="MobileBackNav_link">
          <BodyCopyMedium as="span">← Back to projects</BodyCopyMedium>
        </Link>
      </div>

      <PageTitle
        title={project.titleParts || [project.title]}
        titleOffset={project.titleOffset || ['35%', '42%']}
        show={true}
      />

      {/* Left Column Content (exact Stefan Project_content layout; on mobile sits cleanly above media stack) */}
      <div className="Project_content">
        <ListSection
          title="Role"
          items={roleItems}
          delay={0.1}
          className="Project_role"
        />

        <ListSection
          title="Context & Scope"
          items={contextItems}
          delay={0.2}
          className="Project_recognitions"
        />

        {project.summary && project.summary.length > 0 && (
          <ListSection
            title="Summary"
            items={project.summary}
            delay={0.3}
            className="Project_summary"
          />
        )}

        <ListSection
          items={
            project.externalUrl
              ? [{ label: 'Visit website', url: project.externalUrl }]
              : [{ label: 'Back to projects', url: '/work', internal: true }]
          }
          delay={0.55}
          className="Project_link"
        />
      </div>

      {/* Mobile/Tablet MediaGrid (< 900px) */}
      <MobileMediaStack
        media={mediaList}
        colors={project.colors}
        className="MediaGrid_mobileOnly"
      />

      {/* Desktop Right-Column Media Stack (exact Stefan columns 7-12, pure 16:9 frames) */}
      <div
        className="hidden min-[900px]:block"
        style={{
          position: 'fixed',
          top: 0,
          left: 'calc(var(--col) * 6 + var(--indent) * 5)',
          width: 'calc(var(--col) * 5 + var(--indent) * 6)',
          height: '100vh',
          overflow: 'hidden',
          zIndex: 15,
        }}
      >
        <div
          ref={trackRef}
          style={{
            paddingTop: 'var(--indent)',
            paddingBottom: 'calc(var(--indent) * 8)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'calc(var(--indent) * 2)',
            willChange: 'transform',
          }}
        >
          {mediaList.map((src, i) => (
            <div
              key={i}
              ref={(el) => {
                frameRefs.current[i] = el;
              }}
              className="MediaGrid_mediaContent"
              style={{
                backgroundColor:
                  project.colors?.[i % (project.colors?.length || 1)] ||
                  '#252526',
                willChange: 'transform',
              }}
            >
              {isYouTubeSrc(src) ? (
                <iframe
                  src={getYouTubeEmbedUrl(src)}
                  title={`${project.title} video ${i + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    border: 0,
                    display: 'block',
                    zIndex: 2,
                  }}
                />
              ) : isVideoSrc(src) ? (
                <video src={src} autoPlay muted loop playsInline />
              ) : (
                <img src={src} alt={project.title} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Next Project Footer (exact Stefan Project_footer) */}
      <footer
        className={`Project_footer ${
          showNextCta ? 'Project_show' : 'Project_hide'
        }`}
      >
        <div className="Project_footerLinkWrapper">
          <Link
            className="Project_nextLink"
            href={`/work/${project.nextSlug}`}
            scroll={false}
            aria-label={`Next Project: ${project.nextTitle}`}
          />
          <Title className="Project_nextLinkLabel">
            <RevealMask show={showNextCta} delay={0.1}>
              Next Project
            </RevealMask>
          </Title>
        </div>
      </footer>
    </div>
  );
}

export default CaseStudy;
