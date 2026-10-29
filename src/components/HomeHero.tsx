'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { siteConfig } from '@/content/site';
import { easeOutExpo } from './easings';
import { BodyCopyLarge, HeroTitle, Subtitle } from './Text';
import { RevealMask } from './RevealMask';
import { Sep, SlicedText } from './MarqueeHeading';
import { SiteFooter } from './SiteFooter';

// Exact Mulberry32 PRNG from Stefan's Home page (module 7175)
function mulberry32(seed: number) {
  let t = seed;
  return function () {
    let e = Math.imul((t += 1831565813) ^ (t >>> 15), 1 | t);
    return (
      (((e ^= e + Math.imul(e ^ (e >>> 7), 61 | e)) ^ (e >>> 14)) >>> 0) /
      4294967296
    );
  };
}

function generatePositions(
  count: number,
  seed: number = 42,
  minLeft: number = 0,
  maxLeft: number = 70
) {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => {
    const left = minLeft + rand() * (maxLeft - minLeft);
    return {
      top: `${Math.round(100 * rand())}%`,
      left: `${Math.round(left)}%`,
    };
  });
}

const ART_CONFIG = {
  default: generatePositions(40, 22),
  aux: generatePositions(30, 8, 2),
  randomizedIndexes: (() => {
    const arr = Array.from({ length: 70 }, (_, i) => i);
    const rand = mulberry32(42);
    return arr.sort(() => rand() - 0.5);
  })(),
};

const TOTAL_ART_ITEMS = ART_CONFIG.default.length + ART_CONFIG.aux.length;
const ART_INDICES = Array.from({ length: TOTAL_ART_ITEMS }, (_, i) => i);

function getAuxLineCount(index: number) {
  return Math.min(Math.floor(18 * mulberry32(index)()) + 10, 28);
}

interface ScrollDatum {
  height: number;
  offset: number;
  y: number;
  speed: number;
}

function ArtItem({
  index,
  randomizedIndex,
  itemsRefs,
  scrollData,
  isDefault,
  isAux,
  isAccent,
  style,
  show,
}: {
  index: number;
  randomizedIndex: number;
  itemsRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  scrollData: React.MutableRefObject<Record<number, ScrollDatum>>;
  isDefault: boolean;
  isAux: boolean;
  isAccent: boolean;
  style: React.CSSProperties;
  show: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    itemsRefs.current[index] = el;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      el.style.transform = '';
      scrollData.current[index] = {
        height: rect.height,
        offset: el.offsetTop,
        y: scrollData.current[index]?.y ?? 0,
        speed: Math.random() * (isAux ? 0.1 : 0.05) + 0.2,
      };
    };

    measure();
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      delete scrollData.current[index];
    };
  }, [index, isAux, itemsRefs, scrollData]);

  const classes = [
    'Art_artItem',
    isDefault ? 'Art_default' : '',
    isAux ? 'Art_aux' : '',
    isAccent ? 'Art_accent' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const lineCount = isAux ? getAuxLineCount(index) : 0;

  return (
    <div className={classes} ref={ref} style={style} role="presentation">
      <motion.div
        className="Art_bg"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: show ? 1 : 0, opacity: show ? 1 : 0 }}
        transition={{
          scaleY: {
            duration: show ? 1 : 0.4,
            delay: show ? 0.01 * randomizedIndex + 0.1 : 0.001 * randomizedIndex,
            ease: easeOutExpo,
          },
          opacity: {
            duration: show ? 0 : 0.4,
            delay: show ? 0.01 * randomizedIndex + 0.1 : 0.001 * randomizedIndex,
          },
        }}
        role="presentation"
      >
        {isAux &&
          Array.from({ length: lineCount }, (_, i) => (
            <span key={i} className="Art_auxItem" role="presentation" />
          ))}
      </motion.div>
    </div>
  );
}

function HomeArt({ show }: { show: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollData = useRef<Record<number, ScrollDatum>>({});
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = Math.min(now - lastTime, 50);
      lastTime = now;

      const totalHeight = Math.max(
        containerRef.current?.scrollHeight || window.innerHeight,
        500
      );
      const data = scrollData.current;
      const els = itemsRefs.current;

      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        const d = data[i];
        if (el && d) {
          d.y -= d.speed * delta * 0.1;
          if (d.offset + d.y + d.height < 0) {
            d.y += totalHeight;
          }
          el.style.transform = `translate3d(0, ${d.y}px, 0)`;
          if (i >= ART_CONFIG.default.length && i % 4 === 0) {
            const norm = (d.offset + d.height + d.y) / totalHeight;
            el.style.setProperty('--scale', String(Math.round((norm - 0.5) * 6) + 1));
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [prefersReducedMotion]);

  return (
    <div className="Art_art" ref={containerRef} aria-hidden="true">
      {ART_INDICES.map((idx) => {
        const isDefault = idx < ART_CONFIG.default.length;
        const isAux = idx >= ART_CONFIG.default.length;
        const isAccent = idx % 2 === 0 && isAux;
        const style = isDefault
          ? ART_CONFIG.default[idx]
          : ART_CONFIG.aux[idx - ART_CONFIG.default.length];

        return (
          <ArtItem
            key={idx}
            index={idx}
            randomizedIndex={ART_CONFIG.randomizedIndexes[idx]}
            itemsRefs={itemsRefs}
            scrollData={scrollData}
            isDefault={isDefault}
            isAux={isAux}
            isAccent={isAccent}
            style={style}
            show={show}
          />
        );
      })}
    </div>
  );
}

export function HomeHero() {
  const router = useRouter();
  const { title, description } = siteConfig.home;
  const navigatedRef = useRef(false);

  // Stefan's wheel-down controller on Home that navigates to Projects (/work)
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 28 && !navigatedRef.current) {
        navigatedRef.current = true;
        router.push('/work');
      }
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [router]);

  return (
    <div className="Home_home" id="home">
      <HomeArt show={true} />

      {/* Reserved ambient slot for Phase C Airavata layered puppet */}
      <div
        id="airavata-ambient-slot"
        data-ambient-slot="airavata"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      <section className="HomeHero_homeHero">
        <HeroTitle className="HomeHero_title" aria-label={title.join(' ')}>
          <span className="HomeHero_titlePart" aria-hidden="true">
            {title[0].split(' ').map((word, idx) => (
              <span key={idx} className="HomeHero_word">
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <SlicedText
                    text={word}
                    from={idx === 0 ? '11%' : '0%'}
                    iterations={idx === 0 ? 5 : 7}
                    show={true}
                    repeat={true}
                  />
                </motion.span>
              </span>
            ))}
          </span>

          <Sep />

          <span className="HomeHero_titlePart" aria-hidden="true">
            {title[1].split(' ').map((word, idx) => (
              <span key={idx} className="HomeHero_word" data-k="true">
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <SlicedText
                    text={word}
                    from="-5%"
                    iterations={idx === 0 ? 7 : 8}
                    show={true}
                    repeat={true}
                  />
                </motion.span>
              </span>
            ))}
          </span>
        </HeroTitle>

        <div className="HomeHero_content">
          <div className="HomeHero_description">
            <BodyCopyLarge as="span" className="HomeHero_pre">
              <div>
                <RevealMask show={true}>—</RevealMask>
                <br />
                <RevealMask show={true}>info info</RevealMask>
              </div>
            </BodyCopyLarge>

            <Subtitle className="HomeHero_descriptionLabel">
              {description.map((line, idx) => (
                <span
                  key={idx}
                  className={idx > 0 ? 'HomeHero_neg' : ''}
                >
                  <RevealMask
                    show={true}
                    delay={0.05 * idx}
                    className="HomeHero_reveal"
                  >
                    {line}
                  </RevealMask>
                </span>
              ))}
            </Subtitle>
          </div>
        </div>

        <div className="HomeHero_contact">
          <SiteFooter show={true} delay={0.4} />
        </div>
      </section>
    </div>
  );
}

export default HomeHero;
