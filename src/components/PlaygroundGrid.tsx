'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';
import type { PlaygroundItem } from '@/content/getPlayground';
import { easeOutExpo } from './easings';
import { BodyCopyLarge, BodyCopyMedium, Title } from './Text';
import { RevealMask } from './RevealMask';
import { PageTitle } from './MarqueeHeading';
import { BackToPlayground } from './BackToPlayground';

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

function isHtmlSrc(src: string) {
  return /\.html(\?.*)?$/i.test(src);
}

function PlaygroundMediaViewer({ item }: { item: PlaygroundItem }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      const active = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      );
      setIsFullscreen(active);
      if (!active) {
        setIsCssFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Explicitly release media decoder / range stream when switching pieces
  useEffect(() => {
    const vid = videoRef.current;
    return () => {
      if (vid) {
        try {
          vid.pause();
          vid.removeAttribute('src');
          vid.load();
        } catch {
          // ignore
        }
      }
    };
  }, [item.embed]);

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (isCssFullscreen) {
      setIsCssFullscreen(false);
      setIsFullscreen(false);
      return;
    }

    if (
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement
    ) {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      } catch (e) {
        console.error(e);
      }
      setIsFullscreen(false);
      return;
    }

    try {
      if (container.requestFullscreen) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
        setIsFullscreen(true);
      } else {
        setIsCssFullscreen(true);
        setIsFullscreen(true);
      }
    } catch {
      setIsCssFullscreen(true);
      setIsFullscreen(true);
    }
  };

  const isHtml = item.embed && isHtmlSrc(item.embed);
  const isVideo = item.embed && isVideoSrc(item.embed);
  const isImage = item.embed && isImageSrc(item.embed);

  return (
    <div
      ref={containerRef}
      className={`Playground_mediaCard ${
        isCssFullscreen ? 'Playground_cssFullscreen' : ''
      }`}
    >
      {isHtml ? (
        <div className="Playground_iframeContainer">
          <div className="Playground_interactiveBar">
            <span className="Playground_interactiveHint">
              Interactive 3D · Click to Play
            </span>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="Playground_actionBtn"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 size={13} strokeWidth={2.2} />
                  <span>Exit</span>
                </>
              ) : (
                <>
                  <Maximize2 size={13} strokeWidth={2.2} />
                  <span>Fullscreen</span>
                </>
              )}
            </button>
          </div>
          <iframe
            src={item.embed}
            title={item.title}
            allow="accelerometer; autoplay; fullscreen; gyroscope"
            className="Playground_iframeElement"
          />
        </div>
      ) : isVideo ? (
        <div className="Playground_mediaContainer">
          <video
            ref={videoRef}
            key={item.embed}
            src={item.embed}
            autoPlay
            loop
            playsInline
            controls
            preload="metadata"
            className="Playground_videoElement"
          />
        </div>
      ) : isImage ? (
        <div className="Playground_mediaContainer">
          <img
            src={item.embed}
            alt={item.title}
            className="Playground_imageElement"
          />
        </div>
      ) : (
        <div className="Playground_mediaContainer">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="Playground_imageElement"
          />
        </div>
      )}
    </div>
  );
}

export function PlaygroundGrid({ items }: { items: PlaygroundItem[] }) {
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

  const openExperiment = (slug: string) => {
    setSelectedSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeExperiment = () => {
    setSelectedSlug(null);
  };

  // Escape key closes selected piece back to grid; Arrow keys cycle pieces
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

  // Demand-driven parallax card motion on scroll (sleeps when idle or in detail view)
  useEffect(() => {
    if (selectedSlug) return;

    let rafId = 0;
    let currentScroll = window.scrollY;
    let running = false;

    const updateParallax = () => {
      const targetScroll = window.scrollY;
      const diff = targetScroll - currentScroll;
      currentScroll += diff * 0.14;

      const isDesktop = window.matchMedia('(min-width: 900px)').matches;
      for (let i = 0; i < cardRefs.current.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        if (!isDesktop) {
          el.style.transform = '';
          continue;
        }
        const speed = i % 2 === 1 ? -0.05 : 0.025;
        const yOffset = currentScroll * speed;
        el.style.transform = `translate3d(0, ${yOffset}px, 0)`;
      }

      if (Math.abs(diff) > 0.5) {
        rafId = requestAnimationFrame(updateParallax);
      } else {
        running = false;
      }
    };

    const onScroll = () => {
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
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

  const otherItems = React.useMemo(() => {
    if (!activeItem) return items;
    return items.filter((i) => i.slug !== activeItem.slug);
  }, [activeItem, items]);

  return (
    <div id="projects" className="Projects_projects">
      <AnimatePresence>
        {activeItem && (
          <BackToPlayground show={true} onClick={closeExperiment} />
        )}
      </AnimatePresence>

      <div
        className={`Spacer_spacer ${
          activeItem ? 'Project_backSpace' : ''
        }`.trim()}
      />

      {/* Top-Left Title: "Playground" in grid view, or the selected piece's 2-line title when clicked */}
      <div key={activeItem ? activeItem.slug : 'playground-root'}>
        <PageTitle
          title={activeTitleParts}
          titleOffset={activeItem ? ['38%', '46%'] : ['45%']}
          show={true}
        />
      </div>

      {/* Top-Right Counter */}
      <div
        className={`ProjectsList_progressWrapper ${
          activeItem ? 'Playground_progressWrapper' : ''
        }`}
      >
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

      {!activeItem ? (
        /* STATE 1: Clean Thumbnail Grid */
        <motion.section
          key="playground-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="Playground_gridSection"
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
              className="Playground_cardArticle"
              style={{ cursor: 'pointer', willChange: 'transform' }}
            >
              <div className="MediaGrid_mediaContent">
                {isVideoSrc(item.thumbnail) ? (
                  <video
                    src={item.thumbnail}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : isHtmlSrc(item.thumbnail) ? (
                  <iframe
                    src={item.thumbnail}
                    title={item.title}
                    tabIndex={-1}
                    loading="lazy"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      border: 0,
                      display: 'block',
                      pointerEvents: 'none',
                      zIndex: 2,
                    }}
                  />
                ) : (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="PlaygroundMobile_cardMeta">
                <BodyCopyMedium as="span">
                  {item.displayNumber}. {item.title}
                </BodyCopyMedium>
              </div>
            </article>
          ))}
        </motion.section>
      ) : (
        /* STATE 2: Option B — In-Flow Dual-Column (Data on Left, Media on Right) */
        <motion.div
          key={`playground-detail-${activeItem.slug}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: easeOutExpo }}
        >
          <div className="Playground_detailLayout">
            {/* Left Column: Metadata */}
            <aside className="Playground_detailSidebar">
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

              <div
                className="List_listWrapper Project_summary"
                style={{ whiteSpace: 'normal', maxWidth: '32rem' }}
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
                        style={{ marginTop: '0.75em' }}
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
            </aside>

            {/* Right Column: Clean Media Viewport + Switcher */}
            <section className="Playground_mediaColumn">
              <PlaygroundMediaViewer item={activeItem} />

              {/* Switcher Strip of other experiments (excludes active item & avoids heavy 3D iframes in tiny thumbs) */}
              <div className="Playground_switcherSection">
                <div className="Playground_switcherLabel">More in Playground</div>
                <div className="Playground_switcherGrid">
                  {otherItems.map((other) => (
                    <button
                      key={other.slug}
                      type="button"
                      onClick={() => openExperiment(other.slug)}
                      className="Playground_switcherCard"
                      aria-label={other.title}
                    >
                      <div className="Playground_switcherThumb">
                        {isVideoSrc(other.thumbnail) ? (
                          <video
                            src={other.thumbnail}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                          />
                        ) : isHtmlSrc(other.thumbnail) ? (
                          <img
                            src="/playground/elephant-walkcycle/thumb.svg"
                            alt={other.title}
                            loading="lazy"
                          />
                        ) : (
                          <img
                            src={other.thumbnail}
                            alt={other.title}
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="Playground_switcherCardMeta">
                        <span className="Playground_switcherNum">
                          {other.displayNumber}
                        </span>
                        <span className="Playground_switcherTitle">
                          {other.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* In-flow Next Piece Footer */}
          {nextItem && (
            <footer className="Project_footer Project_show Playground_footerInFlow">
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
    </div>
  );
}

export default PlaygroundGrid;
