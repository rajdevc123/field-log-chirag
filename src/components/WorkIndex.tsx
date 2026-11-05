'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { ProjectContextGroup, ProjectEntry } from '@/content/getProjects';
import { easeOutExpo } from './easings';
import { BodyCopyLarge, BodyCopyMedium, BodyCopySmall, Title } from './Text';
import { RevealMask } from './RevealMask';
import { PageTitle } from './MarqueeHeading';
import { SiteFooter } from './SiteFooter';

interface WorkIndexProps {
  groups: ProjectContextGroup[];
  allProjects: ProjectEntry[];
}

function isVideoSrc(src: string) {
  return /\.(mp4|webm|mov)$/i.test(src);
}

export function WorkIndex({ groups, allProjects }: WorkIndexProps) {
  const router = useRouter();

  // Ordered projects matching the context groups (Dr. Reddy's Labs -> Future East Film)
  const orderedProjects = React.useMemo(() => {
    const flat: ProjectEntry[] = [];
    for (const g of groups) {
      for (const p of g.projects) {
        flat.push(p);
      }
    }
    return flat.length > 0 ? flat : allProjects;
  }, [groups, allProjects]);

  const [hoveredSlug, setHoveredSlug] = useState<string>(
    orderedProjects[0]?.slug || ''
  );
  const [hasHoveredLink, setHasHoveredLink] = useState(false);

  const activeProject =
    orderedProjects.find((p) => p.slug === hoveredSlug) || orderedProjects[0];

  const activeIndex = Math.max(
    0,
    orderedProjects.findIndex((p) => p.slug === activeProject?.slug)
  );
  const totalCount = String(orderedProjects.length).padStart(2, '0');
  const currentNum = String(activeIndex + 1).padStart(2, '0');

  // Refs for smooth lerp parallax scrolling of the right-hand project stack
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targetYRef = useRef(0);
  const currentYRef = useRef(0);
  const maxScrollRef = useRef(0);
  const isManualHoverRef = useRef(false);
  const manualHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const overscrollUpRef = useRef(0);
  const overscrollDownRef = useRef(0);
  const navigatedRef = useRef(false);
  const mountTimeRef = useRef(0);

  const scrollToProjectIndex = (idx: number) => {
    const itemEl = itemRefs.current[idx];
    const trackEl = trackRef.current;
    if (!itemEl || !trackEl) return;
    const offset = itemEl.offsetTop - window.innerHeight * 0.16;
    targetYRef.current = Math.max(
      0,
      Math.min(maxScrollRef.current, offset)
    );
  };

  // Measure right-column track & run 60fps lerp + parallax loop
  useEffect(() => {
    navigatedRef.current = false;
    overscrollUpRef.current = 0;
    overscrollDownRef.current = 0;
    mountTimeRef.current = Date.now();

    const measure = () => {
      const trackEl = trackRef.current;
      if (!trackEl) return;
      const totalH = trackEl.scrollHeight;
      maxScrollRef.current = Math.max(0, totalH - window.innerHeight * 0.72);
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

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Decay overscroll up momentum
      if (overscrollUpRef.current > 0) {
        overscrollUpRef.current *= Math.pow(0.85, dt * 60);
        if (overscrollUpRef.current < 0.5) overscrollUpRef.current = 0;
      }

      const diff = targetYRef.current - currentYRef.current;
      // Smooth damped lerp factor
      const lerp = 1 - Math.pow(1 - 0.08, dt * 60);
      currentYRef.current += diff * lerp;
      const velocity = diff * lerp;

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(0, ${-currentYRef.current}px, 0)`;
      }

      // Apply subtle parallax shift & velocity skew to each project's media card
      const viewportCenter = window.innerHeight * 0.45;
      let closestIdx = 0;
      let closestDist = Infinity;

      for (let i = 0; i < itemRefs.current.length; i++) {
        const el = itemRefs.current[i];
        const mediaEl = mediaRefs.current[i];
        if (!el) continue;

        const itemTopInView = el.offsetTop - currentYRef.current;
        const itemCenterInView = itemTopInView + el.offsetHeight * 0.5;
        const distFromCenter = itemCenterInView - viewportCenter;

        if (Math.abs(distFromCenter) < closestDist) {
          closestDist = Math.abs(distFromCenter);
          closestIdx = i;
        }

        if (mediaEl) {
          const parallaxY = distFromCenter * -0.08;
          const clampVel = Math.max(-6, Math.min(6, velocity * 0.08));
          mediaEl.style.transform = `translate3d(0, ${parallaxY}px, 0) skewY(${clampVel * 0.18}deg)`;
        }
      }

      if (!isManualHoverRef.current && orderedProjects[closestIdx]) {
        const nextSlug = orderedProjects[closestIdx].slug;
        setHoveredSlug((prev) => (prev !== nextSlug ? nextSlug : prev));
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      const isDesktop = window.matchMedia('(min-width: 900px)').matches;
      if (!isDesktop) return;

      // Ignore spillover momentum from homepage scroll transition for 500ms
      if (Date.now() - mountTimeRef.current < 500) return;

      measure();
      const maxS = maxScrollRef.current;
      const atTop = targetYRef.current <= 2;

      const normalizedDelta =
        e.deltaMode === 1
          ? e.deltaY * 20
          : e.deltaMode === 2
            ? e.deltaY * 100
            : e.deltaY;

      // Scroll up at top returns to home with deliberate threshold
      if (normalizedDelta < 0 && atTop) {
        overscrollUpRef.current += Math.abs(normalizedDelta);
        if (overscrollUpRef.current > 380 && !navigatedRef.current) {
          navigatedRef.current = true;
          router.push('/');
        }
        return;
      }

      overscrollUpRef.current = 0;
      isManualHoverRef.current = false;

      // Smooth, controlled scroll scaling: clamp step so one wheel flick doesn't blast past multiple projects
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
  }, [orderedProjects, router]);

  // Stefan's keyboard navigation on /projects (Escape -> /, Enter -> active project, Up/Down -> cycle)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        router.push('/');
      } else if (e.key === 'Enter' && activeProject) {
        e.preventDefault();
        router.push(`/work/${activeProject.slug}`);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const idx = orderedProjects.findIndex((p) => p.slug === hoveredSlug);
        if (idx !== -1) {
          const nextIdx =
            e.key === 'ArrowDown'
              ? Math.min(orderedProjects.length - 1, idx + 1)
              : Math.max(0, idx - 1);
          setHoveredSlug(orderedProjects[nextIdx].slug);
          scrollToProjectIndex(nextIdx);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeProject, orderedProjects, hoveredSlug, router]);

  // Mobile/Tablet top preview videos/thumbs (Stefan's VideosGrid)
  const mobilePreviews = orderedProjects.slice(0, 6).map((p) => p.thumbnail);

  let globalRowIndex = 0;

  return (
    <div id="projects" className="Projects_projects">
      <div className="Spacer_spacer" />

      {/* Mobile/Tablet VideosGrid (matches Stefan's VideosGrid_videosGridWrapper) */}
      <div className="VideosGrid_videosGridWrapper" aria-hidden="true">
        <div className="VideosGrid_videosGrid">
          {mobilePreviews.slice(0, 3).map((src, i) => (
            <motion.div
              key={i}
              className="VideosGrid_videoWrapper"
              initial={{ y: '-100%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.5, delay: 0.15 * i + 0.1, ease: easeOutExpo }}
            >
              {src && (
                <motion.img
                  src={src}
                  alt=""
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{
                    duration: 1.5,
                    delay: 0.15 * i + 0.1,
                    ease: easeOutExpo,
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </motion.div>
          ))}
        </div>
        <div className="VideosGrid_videosGrid">
          {mobilePreviews.slice(3, 6).map((src, i) => (
            <motion.div
              key={i}
              className="VideosGrid_videoWrapper"
              initial={{ y: '-100%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.5, delay: 0.15 * i + 0.25, ease: easeOutExpo }}
            >
              {src && (
                <motion.img
                  src={src}
                  alt=""
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{
                    duration: 1.5,
                    delay: 0.15 * i + 0.25,
                    ease: easeOutExpo,
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Page Title: always "Select projects" on /work */}
      <PageTitle
        title={['Select projects']}
        titleOffset={['50%']}
        show={true}
      />

      {/* Top-Right Progress Counter: e.g. 01 / 06 */}
      <div className="ProjectsList_progressWrapper">
        <div className="ProjectsList_current">
          <RevealMask show={true}>
            <Title as="span" className="ProjectsList_currentLabel">
              {currentNum}
            </Title>
          </RevealMask>
        </div>
        <div className="ProjectsList_rest">
          <RevealMask show={true} delay={0.1}>
            <Title as="span" className="ProjectsList_sep">
              /
            </Title>
          </RevealMask>
          <RevealMask show={true} delay={0.2}>
            <Title as="span" className="ProjectsList_totalLabel">
              {totalCount}
            </Title>
          </RevealMask>
        </div>
      </div>

      {/* Context-Grouped Work List (Sticky on Left: Dr. Reddy's Labs & Future East Film) */}
      <section
        className={`ProjectsList_projectsListWrapper ${
          hasHoveredLink ? 'ProjectsList_hasHoveredLink' : ''
        }`.trim()}
      >
        {groups.map((group, groupIdx) => (
          <div key={group.context.id} className="WorkContext_group">
            {/* Left Column: Context Label + Years */}
            <div className="WorkContext_meta">
              <BodyCopyMedium>
                <RevealMask show={true} delay={0.08 * groupIdx}>
                  {group.context.label}
                </RevealMask>
              </BodyCopyMedium>
              <BodyCopySmall style={{ opacity: 0.65, marginTop: '0.2em' }}>
                <RevealMask show={true} delay={0.08 * groupIdx + 0.05}>
                  ({group.context.years})
                </RevealMask>
              </BodyCopySmall>
            </div>

            {/* Middle Column: Numbered Project Links */}
            <ul className="WorkContext_rows">
              {group.projects.map((project) => {
                const rowIdx = globalRowIndex++;
                const isFocused = activeProject?.slug === project.slug;
                const numLabel = String(rowIdx + 1).padStart(2, '0');

                return (
                  <li
                    key={project.slug}
                    className="ProjectsList_projectItem"
                    onMouseEnter={() => {
                      isManualHoverRef.current = true;
                      if (manualHoverTimeoutRef.current) {
                        clearTimeout(manualHoverTimeoutRef.current);
                      }
                      setHoveredSlug(project.slug);
                      setHasHoveredLink(true);
                      scrollToProjectIndex(rowIdx);
                    }}
                    onMouseLeave={() => {
                      setHasHoveredLink(false);
                      manualHoverTimeoutRef.current = setTimeout(() => {
                        isManualHoverRef.current = false;
                      }, 600);
                    }}
                  >
                    <RevealMask show={true} delay={0.03 * rowIdx}>
                      <BodyCopyLarge as="h2">
                        <Link
                          href={`/work/${project.slug}`}
                          scroll={false}
                          className={`ProjectsList_link ${
                            isFocused ? 'ProjectsList_hovered' : ''
                          }`.trim()}
                        >
                          <span className="WorkMobile_cardMedia" aria-hidden="true">
                            <span
                              className="MediaGrid_mediaContent WorkMobile_cardFrame"
                              style={{
                                backgroundColor:
                                  project.colors?.[0] || 'var(--color-default)',
                              }}
                            >
                              {isVideoSrc(project.heroMedia || project.thumbnail) ? (
                                <video
                                  src={project.heroMedia || project.thumbnail}
                                  autoPlay
                                  muted
                                  loop
                                  playsInline
                                />
                              ) : (
                                <img
                                  src={project.heroMedia || project.thumbnail}
                                  alt=""
                                />
                              )}
                            </span>
                          </span>
                          <span className="WorkMobile_cardTitle">
                            {numLabel}. {project.title}
                          </span>
                        </Link>
                      </BodyCopyLarge>
                    </RevealMask>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      {/* Right Column (Desktop >= 900px): Sticky-Scroll Parallax Stage of All 6 Projects */}
      <div
        className="WorkPreview_stage"
        style={{ overflow: 'hidden' }}
      >
        <div
          ref={trackRef}
          style={{
            paddingTop: 'calc(15vh + 0.75vw)',
            paddingBottom: '35vh',
            display: 'flex',
            flexDirection: 'column',
            gap: 'calc(var(--indent) * 4)',
            willChange: 'transform',
          }}
        >
          {orderedProjects.map((project, idx) => {
            const isActive = activeProject?.slug === project.slug;
            const firstVideo = project.media?.find((m) => isVideoSrc(m));
            const previewItems = firstVideo
              ? [project.heroMedia || project.thumbnail, firstVideo]
              : (project.media && project.media.length > 0
                  ? project.media.slice(0, 2)
                  : [project.thumbnail]);

            return (
              <div
                key={project.slug}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                style={{
                  opacity: isActive ? 1 : 0.42,
                  transition: 'opacity 0.4s ease',
                }}
              >
                <div
                  ref={(el) => {
                    mediaRefs.current[idx] = el;
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'calc(var(--indent) * 1.5)',
                    willChange: 'transform',
                  }}
                >
                  {previewItems.map((mediaSrc, mIdx) => (
                    <Link
                      key={`${project.slug}-${mIdx}`}
                      href={`/work/${project.slug}`}
                      scroll={false}
                      style={{ display: 'block', textDecoration: 'none' }}
                    >
                      <div
                        className="MediaGrid_mediaContent"
                        style={{
                          backgroundColor:
                            project.colors?.[mIdx] || 'var(--color-default)',
                        }}
                      >
                        {isVideoSrc(mediaSrc) ? (
                          <video
                            src={mediaSrc}
                            autoPlay
                            muted
                            loop
                            playsInline
                          />
                        ) : (
                          <img src={mediaSrc} alt={project.title} />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WorkIndex;
