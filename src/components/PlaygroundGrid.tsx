'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { PlaygroundItem } from '@/content/getPlayground';
import { BodyCopyLarge, BodyCopyMedium, BodyCopySmall, Title } from './Text';
import { RevealMask } from './RevealMask';
import { PageTitle } from './MarqueeHeading';
import { PlaygroundOverlay } from './PlaygroundOverlay';
import { SiteFooter } from './SiteFooter';

export function PlaygroundGrid({ items }: { items: PlaygroundItem[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openSlug = searchParams.get('open');
  const [hoveredSlug, setHoveredSlug] = useState<string>(
    items[0]?.slug || ''
  );

  const activeOverlayItem =
    items.find((item) => item.slug === openSlug) || null;
  const focusedItem =
    items.find((item) => item.slug === hoveredSlug) || items[0];

  const totalStr = String(items.length).padStart(2, '0');
  const currentStr = focusedItem ? focusedItem.displayNumber : '01';

  const openExperiment = (slug: string) => {
    router.push(`/playground?open=${encodeURIComponent(slug)}`, {
      scroll: false,
    });
  };

  const closeExperiment = () => {
    router.push('/playground', { scroll: false });
  };

  return (
    <div id="projects" className="Projects_projects">
      <div className="Spacer_spacer" />

      <PageTitle
        title={['Playground']}
        titleOffset={['45%']}
        show={true}
      />

      {/* Top-Right Counter matching /work */}
      <div className="ProjectsList_progressWrapper">
        <div className="ProjectsList_current">
          <RevealMask show={true}>
            <Title as="span" className="ProjectsList_currentLabel">
              {currentStr}
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
              {totalStr}
            </Title>
          </RevealMask>
        </div>
      </div>

      {/* Tile Grid */}
      <section
        style={{
          marginTop: 'max(2.5rem, 6vw)',
          paddingBottom: 'calc(var(--indent) * 8)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))',
          gap: 'calc(var(--indent) * 2) var(--indent)',
          width: '100%',
        }}
      >
        {items.map((item, idx) => (
          <article
            key={item.slug}
            onMouseEnter={() => setHoveredSlug(item.slug)}
            onClick={() => openExperiment(item.slug)}
            style={{ cursor: 'pointer' }}
          >
            <div className="MediaGrid_mediaTop">
              <div className="MediaGrid_index">
                <RevealMask show={true} delay={0.05 * idx}>
                  <BodyCopyLarge as="span">{item.displayNumber}</BodyCopyLarge>
                </RevealMask>
              </div>
              <div className="MediaGrid_total">
                <RevealMask show={true} delay={0.05 * idx + 0.05}>
                  <BodyCopyLarge as="span">{item.year}</BodyCopyLarge>
                </RevealMask>
              </div>
            </div>

            <div className="MediaGrid_mediaContent">
              <img src={item.thumbnail} alt={item.title} />
            </div>

            <div
              style={{
                marginTop: '0.65rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '1rem',
              }}
            >
              <BodyCopyLarge as="h2">
                <RevealMask show={true} delay={0.06 * idx + 0.1}>
                  {item.title}
                </RevealMask>
              </BodyCopyLarge>

              <BodyCopySmall style={{ color: 'var(--color-accent)' }}>
                <RevealMask show={true} delay={0.06 * idx + 0.14}>
                  {item.tech.join(' · ')}
                </RevealMask>
              </BodyCopySmall>
            </div>

            <BodyCopyMedium style={{ marginTop: '0.35rem', opacity: 0.75 }}>
              <RevealMask show={true} delay={0.06 * idx + 0.18}>
                {item.note}
              </RevealMask>
            </BodyCopyMedium>
          </article>
        ))}
      </section>

      <PlaygroundOverlay item={activeOverlayItem} onClose={closeExperiment} />

      <div
        style={{
          paddingBottom: 'var(--indent)',
          marginTop: 'max(3rem, 4vw)',
        }}
        className="min-[900px]:hidden"
      >
        <SiteFooter show={true} delay={0.5} />
      </div>
    </div>
  );
}

export default PlaygroundGrid;
