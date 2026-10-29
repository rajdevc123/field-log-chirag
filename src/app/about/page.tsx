'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '@/content/site';
import { easeOutCirc } from '@/components/easings';
import { AboutCopy, AboutTitle } from '@/components/Text';
import { RevealMask } from '@/components/RevealMask';
import { SiteFooter } from '@/components/SiteFooter';

/**
 * Exact replica of Stefan's Char component on /about (module 8048).
 */
function AnimatedChar({
  char,
  index,
  show = true,
}: {
  char: string;
  index: number;
  show?: boolean;
}) {
  const delay = show ? 0.02 * Math.pow(index, 2) + 0.15 : 0;
  return (
    <motion.span
      className="Char_char"
      initial={{ opacity: 0, y: '50%', scale: 0.8, skewY: 10 }}
      animate={{
        opacity: show ? 1 : 0,
        y: show ? 0 : '50%',
        scale: show ? 1 : 0.8,
        skewY: show ? 0 : 10,
      }}
      transition={{
        duration: 0.75,
        delay,
        ease: easeOutCirc,
        opacity: {
          duration: show ? 0.5 : 0.2,
          delay,
          ease: easeOutCirc,
        },
      }}
    >
      {char}
    </motion.span>
  );
}

function AboutHeroLabel({ text, show = true }: { text: string; show?: boolean }) {
  return (
    <AboutTitle className="AboutHero_aboutHeroLabel">
      {text.split('').map((ch, idx) => (
        <AnimatedChar key={idx} char={ch} index={idx} show={show} />
      ))}
    </AboutTitle>
  );
}

export default function AboutPage() {
  const { heroLabels, yearBadge, paragraphs, columns, credentials } =
    siteConfig.about;

  return (
    <div id="about" className="About_about">
      {/* Giant Right-Aligned Accent Hero ("Chrg" / "Rjdo") */}
      <div className="AboutHero_aboutHero">
        {heroLabels.map((label, idx) => (
          <AboutHeroLabel key={idx} text={label} show={true} />
        ))}
      </div>

      {/* 3-Column Info Section (exact Stefan InfoColumns) */}
      <motion.div
        className="InfoColumns_infoColumns"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.75, delay: 0.45 }}
      >
        <div className="InfoColumns_infoColumn">
          <AboutCopy as="p">{paragraphs[0]}</AboutCopy>
        </div>

        <div className="InfoColumns_infoColumn">
          <blockquote>
            <AboutCopy as="p">{paragraphs[1]}</AboutCopy>
            <AboutCopy as="p">{paragraphs[2]}</AboutCopy>
            <AboutCopy as="p">{paragraphs[3]}</AboutCopy>
            <AboutCopy as="p">{paragraphs[4]}</AboutCopy>
          </blockquote>
          <br />
          <AboutCopy as="p">{paragraphs[5]}</AboutCopy>
        </div>

        <div className="InfoColumns_infoColumn">
          <div>
            {columns.map((group, gIdx) => (
              <React.Fragment key={group.title}>
                <RevealMask show={true} delay={0.2 * gIdx + 0.3}>
                  <AboutCopy>{group.title}</AboutCopy>
                </RevealMask>
                <ul>
                  {group.items.map((item, iIdx) => (
                    <AboutCopy key={iIdx} as="li">
                      <RevealMask
                        show={true}
                        delay={0.2 * gIdx + 0.08 * iIdx + 0.35}
                      >
                        {item}
                      </RevealMask>
                    </AboutCopy>
                  ))}
                </ul>
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bottom Publications / Resume & Credentials Section */}
      <div className="Publications_publicationsSection">
        <div>
          <AboutTitle className="Publications_yob">
            {yearBadge.split('').map((ch, idx) => (
              <AnimatedChar key={idx} char={ch} index={idx} show={true} />
            ))}
          </AboutTitle>
        </div>

        <div className="Publications_publicationsList">
          <AboutCopy className="Publications_publicationsTitle">
            <RevealMask show={true} delay={0.2}>
              Resume & Credentials
            </RevealMask>
          </AboutCopy>
          <ul>
            {credentials.map((cred, idx) => (
              <AboutCopy key={idx} as="li">
                <RevealMask show={true} delay={0.1 * idx + 0.25}>
                  <a
                    href={cred.url}
                    target={cred.download ? '_self' : '_blank'}
                    rel="noreferrer"
                    download={
                      cred.download ? 'Chirag_Rajdeo_Resume_2026.pdf' : undefined
                    }
                  >
                    {cred.title}
                  </a>
                </RevealMask>
              </AboutCopy>
            ))}
          </ul>
        </div>
      </div>

      <div
        style={{
          paddingBottom: 'var(--indent)',
          marginTop: 'max(2rem, 3vw)',
        }}
        className="min-[900px]:hidden"
      >
        <SiteFooter show={true} delay={0.5} />
      </div>
    </div>
  );
}
