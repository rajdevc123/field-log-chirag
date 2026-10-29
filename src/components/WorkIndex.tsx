'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
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
  const [hoveredSlug, setHoveredSlug] = useState<string>(
    allProjects[0]?.slug || ''
  );
  const [hasHoveredLink, setHasHoveredLink] = useState(false);

  const activeProject =
    allProjects.find((p) => p.slug === hoveredSlug) || allProjects[0];

  const totalCount = String(allProjects.length).padStart(2, '0');
  const currentNum = activeProject ? activeProject.displayNumber : '01';

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
        const idx = allProjects.findIndex((p) => p.slug === hoveredSlug);
        if (idx !== -1) {
          const nextIdx =
            e.key === 'ArrowDown'
              ? (idx + 1) % allProjects.length
              : (idx - 1 + allProjects.length) % allProjects.length;
          setHoveredSlug(allProjects[nextIdx].slug);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeProject, allProjects, hoveredSlug, router]);

  // Mobile/Tablet top preview videos/thumbs (Stefan's VideosGrid)
  const mobilePreviews = allProjects.slice(0, 6).map((p) => p.thumbnail);

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

      {/* Page Title */}
      <PageTitle title={['Select works']} titleOffset={['50%']} show={true} />

      {/* Top-Right Progress Counter: e.g. 07 / 07 */}
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

      {/* Left + Middle Column: Context-Grouped Project Rows */}
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

                return (
                  <li
                    key={project.slug}
                    className="ProjectsList_projectItem"
                    onMouseEnter={() => {
                      setHoveredSlug(project.slug);
                      setHasHoveredLink(true);
                    }}
                    onMouseMove={() => {
                      if (hoveredSlug !== project.slug) {
                        setHoveredSlug(project.slug);
                      }
                      if (!hasHoveredLink) {
                        setHasHoveredLink(true);
                      }
                    }}
                    onMouseLeave={() => {
                      setHasHoveredLink(false);
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
                          {project.displayNumber}. {project.title}
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

      {/* Right Column (Desktop >= 900px): Hover-Preview Stage */}
      {activeProject && (
        <div className="WorkPreview_stage">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProject.slug}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.75, ease: easeOutExpo }}
              style={{
                paddingTop: 'calc(15vh + 0.75vw)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'calc(var(--indent) * 1.5)',
              }}
            >
              {(activeProject.media && activeProject.media.length > 0
                ? activeProject.media.slice(0, 2)
                : [activeProject.thumbnail]
              ).map((mediaSrc, idx) => (
                <Link
                  key={`${activeProject.slug}-${idx}`}
                  href={`/work/${activeProject.slug}`}
                  scroll={false}
                  style={{ display: 'block', textDecoration: 'none' }}
                >
                  <div
                    className="MediaGrid_mediaContent"
                    style={{
                      backgroundColor:
                        activeProject.colors?.[idx] || 'var(--color-default)',
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
                      <img src={mediaSrc} alt={activeProject.title} />
                    )}
                  </div>
                </Link>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Mobile Footer */}
      <div
        style={{
          paddingBottom: 'var(--indent)',
          marginTop: 'max(4rem, 5vw)',
        }}
        className="lg:hidden"
      >
        <SiteFooter show={true} delay={0.5} />
      </div>
    </div>
  );
}

export default WorkIndex;
