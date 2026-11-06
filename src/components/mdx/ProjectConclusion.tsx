'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const REACTIONS: { who: string; body: string }[] = [
  {
    who: 'Parents',
    body: 'Some liked a gentle prompt that took the pressure off starting conversations and sharing family food stories. Others felt the table was already too busy, or too personal, for more technology.',
  },
  {
    who: 'Kids',
    body: 'Some asked Annam questions, liked the light, and started talking about where their food came from. Others found it annoying, ignored it, or didn’t want an object on the table while they ate.',
  },
];

const AI_USE: { tool: string; body: string }[] = [
  {
    tool: 'Claude',
    body: 'Wrote the Python backend: hotspot networking, low-latency audio streaming and the Flask server.',
  },
  {
    tool: 'ChatGPT 5.4',
    body: 'The live reasoning behind every reply, following the system prompt’s handoffs and tone.',
  },
  {
    tool: 'ElevenLabs',
    body: 'Scribe v2 for speech recognition across eight languages, and eleven_v3 for Annam’s voice.',
  },
];

export function ProjectConclusion() {
  const reduced = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: reduced ? false : { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.6, delay, ease: [0.19, 1, 0.22, 1] },
  });

  return (
    <section className="End_section" aria-labelledby="end-title">
      <motion.header className="End_header" {...reveal()}>
        <h2 id="end-title" className="Text_title Frame_title">
          Conclusion
        </h2>
      </motion.header>

      <motion.div className="End_col" {...reveal(0.05)}>
        <h3 className="End_colTitle">What I learned</h3>
        <p>
          Annam was my first real look at voice interfaces. Writing dialogue
          is not like building features. The pauses, the handoffs, and
          knowing when to stay quiet are what make a voice product work.
        </p>
        <p>
          Annam won’t suit every home. But where it clicked, voice helped
          parents and children talk to each other instead of competing for
          their attention.
        </p>
      </motion.div>

      <motion.div className="End_col" {...reveal(0.1)}>
        <h3 className="End_colTitle">How families reacted</h3>
        <p>Testing with real families brought mixed reactions.</p>
        <dl className="End_list">
          {REACTIONS.map((r) => (
            <div key={r.who}>
              <dt>{r.who}</dt>
              <dd>{r.body}</dd>
            </div>
          ))}
        </dl>
      </motion.div>

      <motion.div className="End_col" {...reveal(0.15)}>
        <h3 className="End_colTitle">A note on AI use</h3>
        <p>AI was part of how Annam was built, and of how it runs.</p>
        <dl className="End_list">
          {AI_USE.map((a) => (
            <div key={a.tool}>
              <dt>{a.tool}</dt>
              <dd>{a.body}</dd>
            </div>
          ))}
        </dl>
      </motion.div>

      <div className="End_footer">
        <Link href="/work" scroll={false} className="End_back">
          <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          <span>Back to projects</span>
        </Link>
      </div>
    </section>
  );
}

export default ProjectConclusion;
