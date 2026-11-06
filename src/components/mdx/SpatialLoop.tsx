'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const ASSETS = '/projects/annam/modes';

const MODES: {
  id: string;
  place: string;
  name: string;
  power: string;
  body: string;
  img: string;
  alt: string;
}[] = [
  {
    id: 'kitchen',
    place: 'In the kitchen',
    name: 'On the dock',
    power: 'Charging',
    body: 'Mounted by the stove, Annam helps the caregiver hands-free while they cook: a quick substitution, a recipe from memory, the story behind a dish.',
    img: 'kitchen.jpg',
    alt: 'Annam glowing on its wooden wall dock against kitchen tiles while a woman cooks at the stove behind it.',
  },
  {
    id: 'table',
    place: 'At the table',
    name: 'Off the dock',
    power: 'On battery',
    body: 'Lifted off and carried to the meal, it runs cordless. Here it stays at the edge of the conversation and joins in when the child starts wondering.',
    img: 'table.jpg',
    alt: 'Annam glowing on a wooden dining table beside steel plates of rotis, a mother and son eating and talking behind it.',
  },
];

export function SpatialLoop() {
  const reduced = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: reduced ? false : { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.6, delay, ease: [0.19, 1, 0.22, 1] },
  });

  return (
    <section className="Loop_section" aria-labelledby="loop-title">
      <motion.header className="Loop_header" {...reveal()}>
        <span className="Frame_eyebrow">04 · Two places, one object</span>
        <h2 id="loop-title" className="Text_title Frame_title">
          Where it lives
        </h2>
        <p className="Loop_lede">It moves with the meal, from the stove to the table.</p>
      </motion.header>

      {MODES.map((m, i) => (
        <motion.figure key={m.id} className={`Loop_mode is-${m.id}`} {...reveal(0.1 + i * 0.05)}>
          <div className="Loop_img">
            <img src={`${ASSETS}/${m.img}`} alt={m.alt} loading="lazy" />
          </div>
          <figcaption>
            <span className="Loop_meta">
              {m.place}
              <span className="Loop_power">{m.power}</span>
            </span>
            <h3 className="Loop_name">{m.name}</h3>
            <p>{m.body}</p>
          </figcaption>
        </motion.figure>
      ))}
    </section>
  );
}

export default SpatialLoop;
