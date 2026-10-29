'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ProjectEntry } from '@/content/getProjects';
import { siteConfig } from '@/content/site';
import { BodyCopyLarge, BodyCopyMedium, Title } from './Text';
import { RevealMask } from './RevealMask';
import { PageTitle } from './MarqueeHeading';
import { SiteFooter } from './SiteFooter';

function isVideoSrc(src: string) {
  return /\.(mp4|webm|mov)$/i.test(src);
}

function ListSection({
  title,
  items,
  delay = 0,
  className = '',
}: {
  title?: string;
  items: (string | { label: string; url: string })[];
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

function MediaStack({
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
              {isVideoSrc(src) ? (
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

export function CaseStudy({
  project,
  mdxContent,
}: {
  project: ProjectEntry;
  mdxContent?: React.ReactNode;
}) {
  const router = useRouter();

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

  const contextMeta = siteConfig.contexts.find((c) => c.id === project.context);
  const contextLine = contextMeta
    ? `${contextMeta.fullName} · ${project.year}`
    : String(project.year);

  const roleItems = [
    project.role,
    ...(project.collaborators && project.collaborators.length > 0
      ? [`Collaborators: ${project.collaborators.join(', ')}`]
      : []),
  ];

  const toolsItems =
    project.tools && project.tools.length > 0
      ? [project.tools.join(' · ')]
      : [];

  const mediaList =
    project.media && project.media.length > 0
      ? project.media
      : [project.thumbnail];

  return (
    <div id="project" className="Project_project">
      <div className="Spacer_spacer" />

      <PageTitle
        title={project.titleParts || [project.title]}
        titleOffset={project.titleOffset || ['45%', '50%']}
        show={true}
      />

      {/* Mobile/Tablet MediaGrid */}
      <MediaStack
        media={mediaList}
        colors={project.colors}
        className="MediaGrid_mobileOnly"
      />

      {/* Desktop Two-Column Split: Left metadata + MDX, Right media stack */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 'var(--indent)',
          alignItems: 'start',
        }}
      >
        <div
          className="Project_content"
          style={{
            gridColumn: '1 / -1',
          }}
        >
          <ListSection
            title="Context"
            items={[contextLine, `#${project.displayNumber}`]}
            delay={0.05}
          />

          <ListSection
            title="Role"
            items={roleItems}
            delay={0.12}
          />

          {toolsItems.length > 0 && (
            <ListSection
              title="Tools & Mediums"
              items={toolsItems}
              delay={0.2}
            />
          )}

          {project.summary && project.summary.length > 0 && (
            <ListSection
              title="Summary"
              items={project.summary}
              delay={0.28}
            />
          )}

          {project.externalUrl && (
            <ListSection
              items={[
                { label: 'Visit live project', url: project.externalUrl },
              ]}
              delay={0.45}
            />
          )}

          {/* MDX Case Study Body */}
          {mdxContent && (
            <div
              className="List_listWrapper"
              style={{ marginTop: 'max(2.5rem, 2.5vw)' }}
            >
              <BodyCopyLarge className="List_listTitle">
                <RevealMask show={true} delay={0.35}>
                  Case Notes & Process
                </RevealMask>
              </BodyCopyLarge>
              <div
                className="Text_bodyCopyMedium"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {mdxContent}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Right-Column Scrollable Media Stack (>= 900px) */}
      <div
        className="hidden min-[900px]:block"
        style={{
          position: 'fixed',
          top: 0,
          left: 'calc(var(--col) * 6 + var(--indent) * 5)',
          width: 'calc(var(--col) * 5 + var(--indent) * 6)',
          height: '100vh',
          overflowY: 'auto',
          paddingTop: 'var(--indent)',
          paddingBottom: 'calc(var(--indent) * 6)',
          zIndex: 15,
        }}
      >
        <MediaStack media={mediaList} colors={project.colors} />
      </div>

      {/* Next Project Footer (exact Stefan Project_footer) */}
      <footer className="Project_footer Project_show">
        <div className="Project_footerLinkWrapper">
          <Link
            className="Project_nextLink"
            href={`/work/${project.nextSlug}`}
            scroll={false}
            aria-label={`Next Project: ${project.nextTitle}`}
          />
          <Title className="Project_nextLinkLabel">
            <RevealMask show={true} delay={0.4}>
              Next Project
            </RevealMask>
          </Title>
        </div>
      </footer>

      <div
        style={{
          marginTop: 'max(5rem, 6vw)',
          paddingBottom: 'var(--indent)',
        }}
        className="min-[900px]:hidden"
      >
        <SiteFooter show={true} delay={0.6} />
      </div>
    </div>
  );
}

export default CaseStudy;
