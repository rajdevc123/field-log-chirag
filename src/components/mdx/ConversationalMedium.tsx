'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const LANGUAGES: { native: string; name: string; lang: string }[] = [
  { native: 'हिन्दी', name: 'Hindi', lang: 'hi' },
  { native: 'தமிழ்', name: 'Tamil', lang: 'ta' },
  { native: 'मराठी', name: 'Marathi', lang: 'mr' },
  { native: 'বাংলা', name: 'Bangla', lang: 'bn' },
  { native: 'తెలుగు', name: 'Telugu', lang: 'te' },
  { native: 'മലയാളം', name: 'Malayalam', lang: 'ml' },
  { native: 'মণিপুরী', name: 'Manipuri', lang: 'mni' },
  { native: 'English', name: 'English', lang: 'en' },
];

// Light level is the share of the table's attention each state asks for.
const STATES: {
  id: string;
  name: string;
  role: string;
  level: number;
  body: string;
}[] = [
  {
    id: '01',
    name: 'Aware',
    role: 'Peripheral ambient',
    level: 0.18,
    body: 'The default. Sits quietly like a warm lamp or a salt cellar, aware of the table’s chatter without interrupting it.',
  },
  {
    id: '02',
    name: 'Engaged',
    role: 'The invitation',
    level: 0.5,
    body: 'Senses an opening, or a dish being served, and glows gently to show it has a curiosity spark ready.',
  },
  {
    id: '03',
    name: 'Active',
    role: 'Full conversation',
    level: 1,
    body: 'Listens, answers, wonders, and shares the floor between child and caregiver for as long as the curiosity lasts.',
  },
];

const BRANCHES: { name: string; leaves: string[] }[] = [
  {
    name: 'Tonal registers',
    leaves: ['Wondering', 'Playful', 'Serious', 'Tender'],
  },
  {
    name: 'Modes of presence',
    leaves: [
      'Child – Annam',
      'Parent – Annam',
      'Child – Parent – Annam',
      'Grandparent – Child',
    ],
  },
  {
    name: 'Topical depth',
    leaves: [
      'Sensory & bodily',
      'Origins & ecology',
      'Cultural memory',
      'Ritual & history',
    ],
  },
  {
    name: 'Guardrails',
    leaves: [
      'Never moralize',
      'No body lecturing',
      'Nudge the parent in',
      'Graceful repair',
    ],
  },
];

const ROUTES = {
  annam: ['Factual', 'Sensory'],
  parent: ['Emotional', 'Generational', 'Taste preference'],
};

function PresenceChart() {
  // Step line: each state occupies a third of the width, height = light level.
  const W = 300;
  const H = 96;
  const top = 8;
  const base = H - 4;
  const y = (l: number) => base - (base - top) * l;
  const x = (i: number) => (W / 3) * i;
  const d = STATES.map(
    (s, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(s.level)} H${x(i + 1)}`,
  ).join(' ');
  const area = `${d} V${base} H0 Z`;

  return (
    <figure className="Medium_chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Attention asked of the table rises from Aware (low) to Engaged (medium) to Active (full)."
      >
        <path d={area} className="Medium_chartArea" />
        <path d={d} className="Medium_chartLine" vectorEffect="non-scaling-stroke" />
        {[1, 2].map((i) => (
          <line
            key={i}
            x1={x(i)}
            x2={x(i)}
            y1={top}
            y2={base}
            className="Medium_chartDivider"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <line
          x1={0}
          x2={W}
          y1={base}
          y2={base}
          className="Medium_chartBase"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <figcaption className="Medium_chartCaption">
        <span>Attention asked of the table</span>
        <span>Ignored → returns to Aware</span>
      </figcaption>
    </figure>
  );
}

export function ConversationalMedium() {
  const reduced = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: reduced ? false : { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.6, delay, ease: [0.19, 1, 0.22, 1] },
  });

  return (
    <section className="Medium_section" aria-labelledby="medium-title">
      <motion.header className="Medium_header" {...reveal()}>
        <h2 id="medium-title" className="Text_title Frame_title">
          Annam
        </h2>
        <p className="Medium_lede">
          A voice companion for the table, where conversation is the
          intervention.
        </p>
      </motion.header>

      {/* Column 1 — what Annam is, and how conversation does the work */}
      <div className="Medium_col">
        <motion.p className="Frame_problem" {...reveal(0.05)}>
          Annam (<span lang="sa">अन्नम्</span>) is a voice companion designed
          to sit at the Indian dining table. It is not a passive reminder tool
          or a nutrition tracker. It is an articulate, curious conversational
          presence, built to draw both child and parent into sustained
          exploration of food: its origins, its textures, the memories it
          carries.
        </motion.p>

        <motion.div className="Medium_block" {...reveal(0.1)}>
          <h3 className="Medium_blockTitle">Conversation as the core intervention</h3>
          <div className="Medium_contrast" role="table" aria-label="How products intervene">
            <div className="Medium_contrastCol" role="row">
              <span className="Medium_contrastLabel" role="rowheader">Most food products</span>
              <span className="Medium_contrastValue" role="cell">Compliance</span>
              <span className="Medium_contrastNote" role="cell">Tracking bites, lecturing on vitamins</span>
            </div>
            <div className="Medium_contrastCol is-annam" role="row">
              <span className="Medium_contrastLabel" role="rowheader">Annam</span>
              <span className="Medium_contrastValue" role="cell">Dialogue</span>
              <span className="Medium_contrastNote" role="cell">Responsive, shared, multi-turn</span>
            </div>
          </div>
          <p className="Medium_body">
            Between six and eleven, children enter a stage of deep curiosity.
            Annam meets that curiosity directly.
          </p>
        </motion.div>

        <motion.ul className="Medium_points" {...reveal(0.15)}>
          <li>
            <h4 className="Medium_pointTitle">Rich child–Annam dialogue</h4>
            <p>
              When a child keeps asking, Annam keeps going, answering with
              sensory and ecological depth and building a real multi-turn
              conversation.
            </p>
          </li>
          <li>
            <h4 className="Medium_pointTitle">The shared spotlight</h4>
            <p>
              Annam never shuts the parent out. As it answers the child, it
              weaves in bridges that hand the story to the parent, the table’s
              real source of lived knowledge.
            </p>
            <figure className="Medium_exchange">
              <div className="Medium_turn">
                <span className="Medium_speaker">Annam</span>
                <p>
                  “Papa grew up near those farms. Ask him what fresh mustard
                  leaves smell like at harvest.”
                </p>
              </div>
              <div className="Medium_turn is-handoff" aria-hidden="true">
                <span className="Medium_speaker">→ Papa</span>
                <p>The floor passes to the parent</p>
              </div>
            </figure>
          </li>
          <li>
            <h4 className="Medium_pointTitle">Multilingual fluency</h4>
            <p>
              Detects and converses in eight languages, following the
              mid-sentence switching common in Indian homes.
            </p>
            <ul className="Medium_langs" aria-label="Supported languages">
              {LANGUAGES.map((l) => (
                <li key={l.name}>
                  <span lang={l.lang} className="Medium_langNative">
                    {l.native}
                  </span>
                  <span className="Medium_langName">{l.name}</span>
                </li>
              ))}
            </ul>
          </li>
        </motion.ul>
      </div>

      {/* Column 2 — calm presence and the prompt architecture */}
      <div className="Medium_col">
        <motion.div className="Medium_block" {...reveal(0.1)}>
          <h3 className="Medium_blockTitle">The three-state presence model</h3>
          <p className="Medium_body">
            Drawing on Mark Weiser’s calm technology and Google ATAP’s work on
            proxemics, Annam is expressive without being intrusive.
          </p>
          <PresenceChart />
          <ol className="Medium_states">
            {STATES.map((s) => (
              <li key={s.id}>
                <span
                  className="Medium_glow"
                  style={{ '--level': s.level } as React.CSSProperties}
                  aria-hidden="true"
                />
                <span className="Medium_stateId">{s.id}</span>
                <h4 className="Medium_stateName">
                  {s.name}
                  <span className="Medium_stateRole">{s.role}</span>
                </h4>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </motion.div>

        <motion.div className="Medium_block" {...reveal(0.15)}>
          <h3 className="Medium_blockTitle">The architecture of dialogue</h3>
          <p className="Medium_body">
            An 8-branch system prompt governs the dynamics of a multi-party
            meal.
          </p>

          <div className="Medium_tree">
            <span className="Medium_treeRoot">System prompt</span>
            <ul className="Medium_treeBranches">
              {BRANCHES.map((b) => (
                <li key={b.name}>
                  <span className="Medium_treeBranch">{b.name}</span>
                  <ul className="Medium_treeLeaves">
                    {b.leaves.map((leaf) => (
                      <li key={leaf}>{leaf}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          <dl className="Medium_rules">
            <div>
              <dt>Modes of presence</dt>
              <dd>
                Adapts its rhythm to a one-on-one discovery loop with the
                child, supporting a caregiver in the kitchen, or a three-way
                table.
              </dd>
            </div>
            <div>
              <dt>Dynamic handoffs</dt>
              <dd>
                Answers factual and sensory questions directly; routes
                emotional, generational and taste questions to the parent.
                <div className="Medium_routes" aria-label="Who answers which questions">
                  <div className="Medium_route">
                    <span className="Medium_routeTo">Annam answers</span>
                    <span className="Medium_routeChips">
                      {ROUTES.annam.map((r) => (
                        <span key={r}>{r}</span>
                      ))}
                    </span>
                  </div>
                  <div className="Medium_route is-parent">
                    <span className="Medium_routeTo">Routed to parent</span>
                    <span className="Medium_routeChips">
                      {ROUTES.parent.map((r) => (
                        <span key={r}>{r}</span>
                      ))}
                    </span>
                  </div>
                </div>
              </dd>
            </div>
            <div>
              <dt>Guardrails</dt>
              <dd>
                No moralizing about nutrition, no body-shaming, and a tender
                register that dampens tone when an exchange turns vulnerable.
              </dd>
            </div>
          </dl>
        </motion.div>
      </div>
    </section>
  );
}

export default ConversationalMedium;
