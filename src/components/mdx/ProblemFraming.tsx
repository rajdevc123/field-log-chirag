'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BatteryLow,
  MessageCircleOff,
  Package,
  type LucideIcon,
} from 'lucide-react';

const TENSIONS: {
  icon: LucideIcon;
  title: string;
  quotes: string[];
}[] = [
  {
    icon: Package,
    title: 'The processed pull',
    quotes: [
      'He’ll eat anything Maggi-flavoured. Real food, no chance.',
      'My daughter learned about millets from a YouTube short. Not from me.',
    ],
  },
  {
    icon: BatteryLow,
    title: 'Parental burnout',
    quotes: [
      'I cook three different things every night. One for him, one for her, one for us.',
      'My mother used to talk about food the whole time she cooked. I don’t have the energy at the end of my day.',
    ],
  },
  {
    icon: MessageCircleOff,
    title: 'Conversation gone quiet',
    quotes: [
      'At dinner I asked him what he had for lunch. He said ‘food’. That was the whole conversation.',
      'Dinner is the only time we’re together. It’s also the time we fight the most.',
    ],
  },
];

export function ProblemFraming() {
  const reduced = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: reduced ? false : { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.6, delay, ease: [0.19, 1, 0.22, 1] },
  });

  return (
    <section className="Frame_section" aria-labelledby="frame-title">
      <div className="Frame_main">
        <motion.header className="Frame_header" {...reveal()}>
          <h2 id="frame-title" className="Text_title Frame_title">
            Problem Framing
          </h2>
        </motion.header>

        <motion.p className="Frame_problem" {...reveal(0.05)}>
          In urban Indian nuclear households, the shared food language between
          parent and child has thinned. Food moves between them as provision
          and instruction, while advertising, peers and screens shape the
          child’s food identity in the years they are most open to it, roughly
          six to eleven. Parents want to be the primary voice, but rarely have
          the conversational tools to hold that role at the one moment they
          share: the meal.
        </motion.p>

        <motion.p className="Frame_thesis" {...reveal(0.1)}>
          The dinner-table fight is the symptom. What’s missing is a shared
          language for food.
        </motion.p>

        <motion.blockquote className="Frame_hmw" {...reveal(0.15)}>
          <span className="Frame_hmwLabel">How might we</span>
          <p className="Frame_hmwText">
            help urban Indian families build a food relationship between parent
            and child at the meal table, at a time when children’s food desires
            are already being shaped by advertising, peer culture and screens?
          </p>
        </motion.blockquote>
      </div>

      <motion.aside
        className="Frame_voices"
        aria-labelledby="voices-title"
        {...reveal(0.1)}
      >
        <header>
          <h3 id="voices-title" className="Frame_voicesTitle">
            Voices from the meal table
          </h3>
          <p className="Frame_voicesNote">
            Drawn from conversations with family and friends
          </p>
        </header>

        <figure className="Frame_lead">
          <blockquote lang="hi" className="Frame_leadHi">
            “हम अपने ज़माने में खाना खाते थे। आजकल बच्चे खाना खाते समय खाने की
            तरफ देखते भी नहीं हैं।”
          </blockquote>
          <figcaption className="Frame_leadEn">
            In our day, we ate our food. Children today don’t even look at their
            food while they eat.
          </figcaption>
        </figure>

        {TENSIONS.map(({ icon: Icon, title, quotes }) => (
          <div key={title} className="Frame_tension">
            <h4 className="Frame_tensionTitle">
              <Icon size={13} strokeWidth={1.6} aria-hidden="true" />
              {title}
            </h4>
            <ul className="Frame_quotes">
              {quotes.map((q) => (
                <li key={q}>“{q}”</li>
              ))}
            </ul>
          </div>
        ))}
      </motion.aside>
    </section>
  );
}

export default ProblemFraming;
