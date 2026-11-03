'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import type { PlaygroundItem } from '@/content/getPlayground';
import { easeOutExpo } from './easings';
import { BodyCopyLarge, BodyCopyMedium, Title } from './Text';
import { RevealMask } from './RevealMask';
import { PageTitle } from './MarqueeHeading';
import { SiteFooter } from './SiteFooter';

function splitPlaygroundTitle(title: string): [string, string] {
  const clean = title.replace(/\s*—\s*/g, ' ').trim();
  const words = clean.split(/\s+/);
  if (words.length <= 1) return [clean, 'Study'];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

function isVideoSrc(src: string) {
  return /\.(mp4|webm|mov)$/i.test(src);
}

function isImageSrc(src: string) {
  return /\.(png|jpg|jpeg|webp|svg|gif)$/i.test(src);
}

export function PlaygroundGrid({ items }: { items: PlaygroundItem[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    searchParams.get('open')
  );
  const [hoveredSlug, setHoveredSlug] = useState<string>(
    items[0]?.slug || ''
  );

  useEffect(() => {
    const paramOpen = searchParams.get('open');
    setSelectedSlug(paramOpen);
  }, [searchParams]);

  const activeItem =
    items.find((item) => item.slug === selectedSlug) || null;
  const focusedItem =
    activeItem ||
    items.find((item) => item.slug === hoveredSlug) ||
    items[0];

  const totalStr = String(items.length).padStart(2, '0');
  const currentStr = focusedItem ? focusedItem.displayNumber : '01';

  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const overscrollUpRef = useRef(0);
  const overscrollDownRef = useRef(0);
  const navigatedRef = useRef(false);

  const openExperiment = (slug: string) => {
    setSelectedSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeExperiment = () => {
    setSelectedSlug(null);
  };

  // Escape key closes selected piece back to grid
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSlug) {
        e.preventDefault();
        closeExperiment();
      } else if (
        (e.key === 'ArrowRight' || e.key === 'ArrowDown') &&
        selectedSlug
      ) {
        e.preventDefault();
        const idx = items.findIndex((i) => i.slug === selectedSlug);
        if (idx !== -1) {
          setSelectedSlug(items[(idx + 1) % items.length].slug);
        }
      } else if (
        (e.key === 'ArrowLeft' || e.key === 'ArrowUp') &&
        selectedSlug
      ) {
        e.preventDefault();
        const idx = items.findIndex((i) => i.slug === selectedSlug);
        if (idx !== -1) {
          setSelectedSlug(
            items[(idx - 1 + items.length) % items.length].slug
          );
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [items, selectedSlug]);

  // Parallax card motion on scroll within /playground
  useEffect(() => {
    let rafId = 0;
    let currentScroll = window.scrollY;

    const updateParallax = () => {
      currentScroll += (window.scrollY - currentScroll) * 0.12;
      const isDesktop = window.matchMedia('(min-width: 900px)').matches;
      for (let i = 0; i < cardRefs.current.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        if (!isDesktop || selectedSlug) {
          el.style.transform = '';
          continue;
        }
        const speed = i % 2 === 1 ? -0.05 : 0.025;
        const yOffset = currentScroll * speed;
        el.style.transform = `translate3d(0, ${yOffset}px, 0)`;
      }
      rafId = requestAnimationFrame(updateParallax);
    };
    rafId = requestAnimationFrame(updateParallax);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [selectedSlug]);

  const activeTitleParts = activeItem
    ? splitPlaygroundTitle(activeItem.title)
    : ['Playground'];

  const nextItem = React.useMemo(() => {
    if (!activeItem) return null;
    const idx = items.findIndex((i) => i.slug === activeItem.slug);
    return items[(idx + 1) % items.length] || null;
  }, [activeItem, items]);

  return (
    <LayoutGroup>
      <div id="projects" className="Projects_projects">
        <div className="Spacer_spacer" />

        {/* Top-Left Title: "Playground" in grid view, or the selected piece's 2-line title when clicked */}
        <div key={activeItem ? activeItem.slug : 'playground-root'}>
          <PageTitle
            title={activeTitleParts}
            titleOffset={activeItem ? ['38%', '46%'] : ['45%']}
            show={true}
          />
        </div>

        {/* Top-Right Counter */}
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

        <AnimatePresence mode="wait">
          {!activeItem ? (
            /* STATE 1: Clean Thumbnail Grid Only (no surrounding text clutter) */
            <motion.section
              key="playground-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                marginTop: 'max(2.5rem, 5vw)',
                paddingBottom: 'calc(var(--indent) * 8)',
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(min(100%, 400px), 1fr))',
                gap: 'var(--indent)',
                width: '100%',
              }}
            >
              {items.map((item, idx) => (
                <article
                  key={item.slug}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  onMouseEnter={() => setHoveredSlug(item.slug)}
                  onClick={() => openExperiment(item.slug)}
                  style={{ cursor: 'pointer', willChange: 'transform' }}
                >
                  <motion.div
                    layoutId={`playground-media-${item.slug}`}
                    transition={{ duration: 0.7, ease: easeOutExpo }}
                    className="MediaGrid_mediaContent"
                  >
                    {isVideoSrc(item.thumbnail) ? (
                      <video
                        src={item.thumbnail}
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img src={item.thumbnail} alt={item.title} />
                    )}
                  </motion.div>
                </article>
              ))}
            </motion.section>
          ) : (
            /* STATE 2: Selected Piece — Data on Left, Scaled Media on Right */
            <motion.div
              key={`playground-detail-${activeItem.slug}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Left Column: Clean Stefan-formatted metadata */}
              <div className="Project_content">
                <div className="List_listWrapper Project_role">
                  <BodyCopyLarge className="List_listTitle">
                    <RevealMask show={true} delay={0.08}>
                      Medium & Tools
                    </RevealMask>
                  </BodyCopyLarge>
                  <ul>
                    <li className="List_listItem">
                      <BodyCopyMedium>
                        <RevealMask show={true} delay={0.14}>
                          {activeItem.tech.join(' / ')}
                        </RevealMask>
                      </BodyCopyMedium>
                    </li>
                  </ul>
                </div>

                <div className="List_listWrapper Project_recognitions">
                  <BodyCopyLarge className="List_listTitle">
                    <RevealMask show={true} delay={0.16}>
                      Year
                    </RevealMask>
                  </BodyCopyLarge>
                  <ul>
                    <li className="List_listItem">
                      <BodyCopyMedium>
                        <RevealMask show={true} delay={0.22}>
                          {`${activeItem.year} — #${activeItem.displayNumber}`}
                        </RevealMask>
                      </BodyCopyMedium>
                    </li>
                  </ul>
                </div>

                <div
                  className="List_listWrapper Project_summary"
                  style={{ whiteSpace: 'normal', maxWidth: '30rem' }}
                >
                  <BodyCopyLarge className="List_listTitle">
                    <RevealMask show={true} delay={0.24}>
                      Summary
                    </RevealMask>
                  </BodyCopyLarge>
                  <ul>
                    {activeItem.note && (
                      <li className="List_listItem">
                        <BodyCopyMedium>
                          <RevealMask show={true} delay={0.3}>
                            {activeItem.note}
                          </RevealMask>
                        </BodyCopyMedium>
                      </li>
                    )}
                    {activeItem.content &&
                      activeItem.content !== activeItem.note && (
                        <li
                          className="List_listItem"
                          style={{ marginTop: '0.5em' }}
                        >
                          <BodyCopyMedium>
                            <RevealMask show={true} delay={0.36}>
                              {activeItem.content}
                            </RevealMask>
                          </BodyCopyMedium>
                        </li>
                      )}
                  </ul>
                </div>

                <div className="List_listWrapper Project_link">
                  <ul>
                    <li className="List_listItem">
                      <button
                        type="button"
                        onClick={closeExperiment}
                        className="List_link"
                        style={{ cursor: 'pointer' }}
                      >
                        <BodyCopyMedium>
                          <RevealMask
                            show={true}
                            delay={0.42}
                            className="List_label"
                          >
                            Back to playground
                          </RevealMask>
                        </BodyCopyMedium>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column (Desktop >= 900px): Scaled Media Stage */}
              <div
                className="hidden min-[900px]:block"
                style={{
                  position: 'fixed',
                  top: 'calc(14vh + 1vw)',
                  left: 'calc(var(--col) * 6 + var(--indent) * 5)',
                  width: 'calc(var(--col) * 5 + var(--indent) * 6)',
                  zIndex: 15,
                }}
              >
                <motion.div
                  layoutId={`playground-media-${activeItem.slug}`}
                  transition={{ duration: 0.7, ease: easeOutExpo }}
                  className="MediaGrid_mediaContent"
                  style={{
                    backgroundColor: '#252526',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                  }}
                >
                  {activeItem.embed && isVideoSrc(activeItem.embed) ? (
                    <video
                      src={activeItem.embed}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                    />
                  ) : activeItem.embed && isImageSrc(activeItem.embed) ? (
                    <img src={activeItem.embed} alt={activeItem.title} />
                  ) : activeItem.embed ? (
                    <iframe
                      src={activeItem.embed}
                      title={activeItem.title}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        border: 0,
                        display: 'block',
                        zIndex: 2,
                      }}
                      allow="accelerometer; autoplay; fullscreen; gyroscope"
                    />
                  ) : (
                    <img
                      src={activeItem.thumbnail}
                      alt={activeItem.title}
                    />
                  )}
                </motion.div>

                {/* Thumbnail switcher strip below the scaled right-hand media */}
                <div
                  style={{
                    marginTop: 'var(--indent)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 'calc(var(--indent) * 0.5)',
                  }}
                >
                  {items
                    .filter((i) => i.slug !== activeItem.slug)
                    .slice(0, 5)
                    .map((thumbItem) => (
                      <div
                        key={thumbItem.slug}
                        onClick={() => openExperiment(thumbItem.slug)}
                        className="MediaGrid_mediaContent"
                        style={{
                          cursor: 'pointer',
                          opacity: 0.55,
                          transition: 'opacity 0.25s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '0.55';
                        }}
                      >
                        {isVideoSrc(thumbItem.thumbnail) ? (
                          <video
                            src={thumbItem.thumbnail}
                            autoPlay
                            muted
                            loop
                            playsInline
                          />
                        ) : (
                          <img
                            src={thumbItem.thumbnail}
                            alt={thumbItem.title}
                          />
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Mobile Media View (< 900px) */}
              <div
                className="min-[900px]:hidden"
                style={{ marginTop: 'var(--indent)' }}
              >
                <div className="MediaGrid_mediaContent">
                  {activeItem.embed && isVideoSrc(activeItem.embed) ? (
                    <video
                      src={activeItem.embed}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                    />
                  ) : (
                    <img
                      src={activeItem.thumbnail}
                      alt={activeItem.title}
                    />
                  )}
                </div>
              </div>

              {/* Next Piece Footer at Bottom Right */}
              {nextItem && (
                <footer className="Project_footer Project_show">
                  <div className="Project_footerLinkWrapper">
                    <button
                      type="button"
                      onClick={() => openExperiment(nextItem.slug)}
                      className="Project_nextLink"
                      style={{ cursor: 'pointer' }}
                      aria-label={`Next: ${nextItem.title}`}
                    />
                    <Title className="Project_nextLinkLabel">
                      <RevealMask show={true} delay={0.2}>
                        Next Piece
                      </RevealMask>
                    </Title>
                  </div>
                </footer>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
    </LayoutGroup>
  );
}

export default PlaygroundGrid;
