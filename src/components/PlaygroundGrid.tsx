'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';
import type { PlaygroundItem } from '@/content/getPlayground';
import { easeOutExpo } from './easings';
import { BodyCopyLarge, BodyCopyMedium, Title } from './Text';
import { RevealMask } from './RevealMask';
import { PageTitle } from './MarqueeHeading';
import { SiteFooter } from './SiteFooter';
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

function GamePlayerFrame({ item }: { item: PlaygroundItem }) {
  const containerRef = useRef<HTMLDivElement>(null);
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
      className={`GamePlayer_frame ${
        isCssFullscreen ? 'GamePlayer_cssFullscreen' : ''
      } ${isFullscreen ? 'GamePlayer_isFullscreen' : ''}`}
    >
      <div className="GamePlayer_topBar">
        <div className="GamePlayer_topBarLeft">
          <span className="GamePlayer_liveDot" />
          <span className="GamePlayer_liveBadge">
            {isHtml ? 'INTERACTIVE 3D' : isVideo ? 'VIDEO' : 'STILL'}
          </span>
          <span className="GamePlayer_itemTitle">{item.title}</span>
        </div>

        {isHtml && (
          <div className="GamePlayer_controlsHint">
            WASD / Arrows to walk · Space to ink
          </div>
        )}

        <div className="GamePlayer_topBarRight">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="GamePlayer_fsBtn"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 size={13} strokeWidth={2.2} />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 size={13} strokeWidth={2.2} />
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="GamePlayer_screen">
        {isVideo ? (
          <video
            src={item.embed}
            autoPlay
            loop
            muted
            playsInline
            controls
            className="GamePlayer_media"
          />
        ) : isImage ? (
          <img
            src={item.embed}
            alt={item.title}
            className="GamePlayer_media"
          />
        ) : item.embed ? (
          <iframe
            src={item.embed}
            title={item.title}
            allow="accelerometer; autoplay; fullscreen; gyroscope"
            className="GamePlayer_media"
          />
        ) : (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="GamePlayer_media"
          />
        )}

        <button
          type="button"
          onClick={toggleFullscreen}
          className="GamePlayer_screenFsBtn"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 size={15} strokeWidth={2.2} />
          ) : (
            <Maximize2 size={15} strokeWidth={2.2} />
          )}
        </button>
      </div>
    </div>
  );
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

        <AnimatePresence mode="wait">
          {!activeItem ? (
            /* STATE 1: Clean Thumbnail Grid Only (no surrounding text clutter on desktop; scannable labels on mobile) */
            <motion.section
              key="playground-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
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
                    ) : isHtmlSrc(item.thumbnail) ? (
                      <iframe
                        src={item.thumbnail}
                        title={item.title}
                        tabIndex={-1}
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
                      <img src={item.thumbnail} alt={item.title} />
                    )}
                  </motion.div>
                  <div className="PlaygroundMobile_cardMeta">
                    <BodyCopyMedium as="span">
                      {item.displayNumber}. {item.title}
                    </BodyCopyMedium>
                  </div>
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
              {/* Mobile Media View (< 900px): Embedded Game Player Frame */}
              <div
                className="min-[900px]:hidden"
                style={{ marginTop: 'max(1.25rem, 2vw)' }}
              >
                <GamePlayerFrame item={activeItem} />

                {/* Mobile horizontal touch-scrollable thumbnail strip */}
                <div className="PlaygroundMobile_thumbStrip">
                  {items
                    .filter((i) => i.slug !== activeItem.slug)
                    .map((thumbItem) => (
                      <button
                        key={thumbItem.slug}
                        type="button"
                        onClick={() => openExperiment(thumbItem.slug)}
                        className="PlaygroundMobile_thumbButton"
                        aria-label={thumbItem.title}
                      >
                        <div className="MediaGrid_mediaContent">
                          {isVideoSrc(thumbItem.thumbnail) ? (
                            <video
                              src={thumbItem.thumbnail}
                              autoPlay
                              muted
                              loop
                              playsInline
                            />
                          ) : isHtmlSrc(thumbItem.thumbnail) ? (
                            <iframe
                              src={thumbItem.thumbnail}
                              title={thumbItem.title}
                              tabIndex={-1}
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
                              src={thumbItem.thumbnail}
                              alt={thumbItem.title}
                            />
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Left Column: Clean Stefan-formatted metadata (Year removed) */}
              <div className="Project_content Playground_detailContent">
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
              </div>

              {/* Right Column (Desktop >= 900px): Embedded Game Player Frame (60%-70% of viewport width) */}
              <div className="hidden min-[900px]:block Playground_playerStage">
                <GamePlayerFrame item={activeItem} />

                {/* Thumbnail switcher strip below the player */}
                <div
                  style={{
                    marginTop: 'calc(var(--indent) * 0.75)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: 'calc(var(--indent) * 0.5)',
                    maxWidth: '460px',
                  }}
                >
                  {items
                    .filter((i) => i.slug !== activeItem.slug)
                    .map((thumbItem) => (
                      <div
                        key={thumbItem.slug}
                        onClick={() => openExperiment(thumbItem.slug)}
                        className="MediaGrid_mediaContent"
                        style={{
                          cursor: 'pointer',
                          opacity: 0.6,
                          borderRadius: '6px',
                          overflow: 'hidden',
                          transition: 'opacity 0.25s ease, transform 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '0.6';
                          e.currentTarget.style.transform = 'translateY(0)';
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
                        ) : isHtmlSrc(thumbItem.thumbnail) ? (
                          <iframe
                            src={thumbItem.thumbnail}
                            title={thumbItem.title}
                            tabIndex={-1}
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
                            src={thumbItem.thumbnail}
                            alt={thumbItem.title}
                          />
                        )}
                      </div>
                    ))}
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
      </div>
    </LayoutGroup>
  );
}

export default PlaygroundGrid;
