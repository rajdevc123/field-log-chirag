'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const ASSETS = '/projects/annam/app';

// The prototype is built at iPhone size; the frame scales it to fit.
const PHONE_W = 393;
const PHONE_H = 852;

// Simple line icons, drawn on a 24px grid in the text colour.
const ICONS: Record<string, React.ReactNode> = {
  starters: (
    <>
      <path d="M4 5.5h16v10H10l-4 3.5v-3.5H4z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  journal: (
    <>
      <path d="M5 4.5h11a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2z" />
      <path d="M5 17.5a2 2 0 0 1 2-2h11" />
      <path d="M9 8.5h5" />
    </>
  ),
  setup: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2.4 2.3 3.5 5 3.5 8s-1.1 5.7-3.5 8c-2.4-2.3-3.5-5-3.5-8s1.1-5.7 3.5-8z" />
    </>
  ),
  kitchen: (
    <>
      <path d="M4.5 10.5h15v3a6 6 0 0 1-6 6h-3a6 6 0 0 1-6-6z" />
      <path d="M2.5 11.5h2M19.5 11.5h2" />
      <path d="M9 7.5c0-1.2 1-1.3 1-2.5M13.5 7.5c0-1.2 1-1.3 1-2.5" />
    </>
  ),
};

const FEATURES: { name: string; icon: string; body: string }[] = [
  {
    name: 'Dinner Conversation Starters',
    icon: 'starters',
    body: 'Log whatever interesting food you ate during the day—like a quick lunch at work or a snack on the street. At dinner, Annam brings it up so your child can ask you about it.',
  },
  {
    name: 'Family Food Journal',
    icon: 'journal',
    body: 'A shared place to keep track of family recipes, funny meal stories, and taste discoveries. No calorie counting or diet tracking—just real food memories.',
  },
  {
    name: 'Quick, Easy Setup',
    icon: 'setup',
    body: 'Connects Annam to your home and lets you pick the languages your family naturally speaks (supports 8 Indian languages and English) without filling out boring forms.',
  },
  {
    name: 'Kitchen Note Sync',
    icon: 'kitchen',
    body: 'While you cook, talk to Annam on its kitchen dock to quickly save recipe tweaks or ingredient changes without having to touch your phone with dirty hands.',
  },
];

function PhonePrototype() {
  const slotRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const fit = () => {
      const byWidth = slot.clientWidth / PHONE_W;
      const byHeight = (window.innerHeight * 0.86) / PHONE_H;
      setScale(Math.min(1, byWidth, byHeight));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(slot);
    window.addEventListener('resize', fit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, []);

  return (
    <div ref={slotRef} className="App_phoneSlot">
      <div
        className="App_phone"
        style={{ width: PHONE_W * scale, height: PHONE_H * scale }}
      >
        <iframe
          src={`${ASSETS}/prototype.html`}
          title="Annam companion app, interactive prototype"
          loading="lazy"
          width={PHONE_W}
          height={PHONE_H}
          style={{ transform: `scale(${scale})` }}
        />
      </div>
      <p className="App_hint">Tap through the prototype</p>
    </div>
  );
}

export function CompanionApp() {
  const reduced = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: reduced ? false : { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.6, delay, ease: [0.19, 1, 0.22, 1] },
  });

  return (
    <section className="App_section" aria-labelledby="app-title">
      <div className="App_main">
        <motion.header className="App_header" {...reveal()}>
          <span className="Frame_eyebrow">05 · The companion app</span>
          <h2 id="app-title" className="Text_title Frame_title">
            Annam Companion App
          </h2>
          <p className="App_lede">
            Easy to use, with a few features that widen what Annam can do.
          </p>
        </motion.header>

        <motion.ul className="App_features" aria-label="Features" {...reveal(0.1)}>
          {FEATURES.map((f) => (
            <li key={f.name}>
              <svg
                className="App_featureIcon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {ICONS[f.icon]}
              </svg>
              <div>
                <h3 className="App_featureName">{f.name}</h3>
                <p>{f.body}</p>
              </div>
            </li>
          ))}
        </motion.ul>

        <motion.figure className="App_ia" {...reveal(0.15)}>
          <div className="App_iaFrame">
            <img
              src={`${ASSETS}/ia-flow.png`}
              alt="Information architecture of the Annam app. From the tab bar, Home, Journal, Family and Annam settings branch out. Routes through Home and Journal meet at four shared screens: a meal, photo log, conversation seeds and family recipe. The object itself switches the app into kitchen companion mode on the dock, and dinner mode when it is upright at the table."
              loading="lazy"
            />
          </div>
          <figcaption>
            <span>
              Information architecture. Different routes meet at the same
              shared screens.
            </span>
            <a href={`${ASSETS}/ia-flow.png`} target="_blank" rel="noreferrer">
              Full size ↗
            </a>
          </figcaption>
        </motion.figure>
      </div>

      <motion.div className="App_aside" {...reveal(0.15)}>
        <PhonePrototype />
      </motion.div>
    </section>
  );
}

export default CompanionApp;
