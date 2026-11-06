'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AnnamViewer } from './AnnamViewer';

const ASSETS = '/projects/annam/form';

const PIPELINE: { step: string; tool: string }[] = [
  { step: 'Hears', tool: 'Silero VAD' },
  { step: 'Transcribes', tool: 'ElevenLabs Scribe v2' },
  { step: 'Thinks', tool: 'GPT' },
  { step: 'Speaks', tool: 'ElevenLabs TTS' },
];

const STACK: { label: string; value: string }[] = [
  {
    label: 'Device',
    value: 'ESP32-S3 · INMP441 I2S mic · I2S amp + 4 Ω speaker · 12-pixel NeoPixel ring · MPU6050 · 1200 mAh LiPo · TP4056 USB-C charger · step-up converter',
  },
  {
    label: 'Languages',
    value: 'Speech to text across Hindi, Tamil, Marathi, Bangla, Telugu, Malayalam, Manipuri and English, detected automatically',
  },
  {
    label: 'Interface',
    value: 'Flask backend serving a browser UI with an audio-reactive orb, chat history and recorded sessions',
  },
  {
    label: 'Enclosure',
    value: 'Fluted translucent acrylic shade, lathe-turned wooden base, brass collar over a neodymium magnet joint',
  },
];

const DECISIONS: { name: string; icon: string; body: string }[] = [
  {
    name: 'Form',
    icon: 'icon-form.png',
    body: 'I kept coming back to shapes that did not stand too tall. Anything tall starts asking for attention. The cone reads as something that sits, like a salt shaker or a small lamp, not something demanding to be looked at.',
  },
  {
    name: 'Light',
    icon: 'icon-light.png',
    body: 'I chose against anything that resembled a face; it could just as easily have become a character inviting the child to converse. Light lets it belong as much to the parent as to the child, and gives the voice a calm support.',
  },
  {
    name: 'CMF',
    icon: 'icon-cmf.png',
    body: 'Wood for one half, a fluted glass look for the other. Both choices came from needing the device to feel familiar and not stand out in the home.',
  },
];

export function PhysicalForm() {
  const reduced = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: reduced ? false : { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.6, delay, ease: [0.19, 1, 0.22, 1] },
  });

  return (
    <section className="Form_section" aria-labelledby="form-title">
      {/* Left — how the form was arrived at */}
      <div className="Form_main">
        <motion.header className="Form_header" {...reveal()}>
          <span className="Frame_eyebrow">03 · Physicality &amp; form</span>
          <h2 id="form-title" className="Text_title Frame_title">
            Physicality and form
          </h2>
          <p className="Form_lede">
            The making moved from screens to circuits, form and affordances.
          </p>
        </motion.header>

        <motion.figure className="Form_sketch" {...reveal(0.1)}>
          <div className="Form_sketchFrame">
            <img
              src={`${ASSETS}/sketch-thumb.jpg`}
              alt="A sheet of pencil sketches of small vessel, lamp and shaker forms."
              loading="lazy"
            />
          </div>
          <figcaption>Form explorations, from lamps to salt cellars</figcaption>
        </motion.figure>

        <motion.ul className="Form_decisions" {...reveal(0.15)}>
          {DECISIONS.map((d) => (
            <li key={d.name}>
              <img
                className="Form_icon"
                src={`${ASSETS}/${d.icon}`}
                alt=""
                aria-hidden="true"
              />
              <div>
                <h3 className="Form_decisionName">{d.name}</h3>
                <p>{d.body}</p>
              </div>
            </li>
          ))}
        </motion.ul>

        <motion.dl className="Form_refs" {...reveal(0.2)}>
          <div>
            <dt>References</dt>
            <dd>
              Google’s <em>Little Signals</em>, for ambient cues that live at
              the edge of attention. Jasper Morrison’s <em>Super Normal</em>{' '}
              (2006), for objects that know “its place in the society of
              things.”
            </dd>
          </div>
        </motion.dl>
      </div>

      {/* Right — product viewer, then what it runs on */}
      <div className="Form_aside">
        <motion.div className="Form_viewerSlot" {...reveal(0.1)}>
          <AnnamViewer
            poster={`${ASSETS}/render-poster.jpg`}
            posterAlt="Annam render: a fluted shade glowing warm on a turned wooden base."
          />
        </motion.div>

        <motion.div className="Form_stack" {...reveal(0.15)}>
          <h3 className="Medium_blockTitle">Tech stack</h3>
          <p className="Form_stackNote">
            The device streams audio over Wi-Fi to a laptop running the voice
            pipeline.
          </p>
          <ol className="Form_pipeline" aria-label="Voice pipeline">
            {PIPELINE.map((s) => (
              <li key={s.tool}>
                <span className="Form_pipelineStep">{s.step}</span>
                <span className="Form_pipelineTool">{s.tool}</span>
              </li>
            ))}
          </ol>
          <dl className="Medium_rules">
            {STACK.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}

export default PhysicalForm;
