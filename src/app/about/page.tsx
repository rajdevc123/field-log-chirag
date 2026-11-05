'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { InfiniteScroller } from '@/components/InfiniteScroller';
import { AssociativeHero } from '@/components/AssociativeHero';

const EXPERIENCE = [
  {
    org: 'Dr. Reddy’s Laboratories',
    meta: 'Digital Studio Manager · 2022–2025',
    description:
      'Established and led an in-house digital studio, overseeing its infrastructure, workflows and end-to-end delivery. Designed 25+ interactive learning experiences, contributing to an estimated ₹1.5 Cr+ in cost savings. Also developed an enterprise SharePoint studio portal with an interactive 360° virtual tour and produced 250+ multimedia assets.',
  },
  {
    org: 'Future East Film',
    meta: 'Creative Producer · 2021–2022',
    description:
      'Produced 20+ digital campaigns for brands including OnePlus, Reckitt, SBI, Marico and Meta. Worked across pitches, storyboards and production, coordinating creative teams and collaborators from concept through final delivery.',
  },
  {
    org: 'Sunset Cinema Club',
    meta: 'Graphic Designer · 2020–2021',
    description:
      'Designed 50+ visual assets across print, web, social and mobile for experiential cinema events.',
  },
];

const SKILLS = [
  {
    category: 'Physical Computing & Fabrication',
    items:
      'Arduino, ESP32, sensors and actuators, circuit prototyping, microcontrollers, soldering, 3D printing, rapid prototyping.',
  },
  {
    category: 'Creative Coding & Interactive Media',
    items:
      'TouchDesigner, MadMapper, Processing, Python, interactive installations.',
  },
  {
    category: 'AI & Agentic Workflows',
    items:
      'Claude, Cursor, Codex, local LLMs (Ollama), computer vision, AI-assisted prototyping.',
  },
  {
    category: 'Interaction & Experience Design',
    items:
      'Interaction design, physical-digital integration, experience design, research-led making, rapid prototyping, cross-disciplinary collaboration.',
  },
  {
    category: 'Design & Prototyping',
    items: 'Figma, Photoshop, Illustrator, InDesign, Miro.',
  },
  {
    category: '3D, Motion & Video',
    items: 'Blender, After Effects, Premiere Pro, DaVinci Resolve.',
  },
  {
    category: 'Audio & Voice',
    items: 'ElevenLabs, speech pipelines (STT, TTS, VAD), sound design, Audacity.',
  },
];

const EDUCATION = [
  {
    institution: 'National Institute of Design, Gandhinagar',
    degree: 'Master of Design (M.Des), New Media Design',
    period: '2025–Present',
  },
  {
    institution: 'Atlas SkillTech University (ISDI Parsons)',
    degree: 'Bachelor of Design (B.Des), Visual Communication Design',
    period: '2017–2021',
  },
  {
    institution: 'University of Mumbai (IDOL)',
    degree: 'Bachelor of Arts (B.A.), Sociology',
    period: '2017–2020',
  },
];

function SectionBlock({
  label,
  children,
  delay = 0,
}: {
  label: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      className="AboutField_section"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
    >
      <h2 className="AboutField_label">
        <span className="AboutField_labelMarker" aria-hidden="true" />
        <span>{label}</span>
      </h2>
      <div className="AboutField_content">{children}</div>
    </motion.section>
  );
}

export default function AboutPage() {
  return (
    <div id="about" className="About_about">
      <InfiniteScroller>
        <AssociativeHero />

        <div className="AboutField_grid">
          {/* Column 1 — Identity, Photo, Resume & Contact */}
          <div className="AboutField_col AboutField_colIdentity">
            <SectionBlock label="Introduction" delay={0.05}>
              <p className="AboutField_introText">
                Multidisciplinary designer interested in human-computer
                interaction, emerging technologies and human behaviour. Exploring
                how interactive systems can shape experiences across physical and
                digital environments. Currently pursuing New Media Design at NID
                Gandhinagar.
              </p>

              <figure className="AboutField_portrait">
                <img
                  src="/about-portrait-duotone.jpg"
                  alt="Chirag Rajdeo"
                  className="AboutField_portraitImg"
                />
              </figure>
            </SectionBlock>

            <SectionBlock label="Contact" delay={0.12}>
              <div className="AboutField_contact">
                <p className="AboutField_bodyText">
                  Have something interesting in mind? I&apos;d be happy to hear
                  from you.
                </p>
                <ul className="AboutField_contactLinks">
                  <li>
                    <a
                      href="mailto:rajdevc123@gmail.com"
                      className="AboutField_link"
                    >
                      rajdevc123@gmail.com
                    </a>
                  </li>
                  <li>
                    <span className="AboutField_contactPrefix">LinkedIn: </span>
                    <a
                      href="https://linkedin.com/in/chirag-rajdeo"
                      target="_blank"
                      rel="noreferrer"
                      className="AboutField_link"
                    >
                      linkedin.com/in/chirag-rajdeo
                    </a>
                  </li>
                  <li>
                    <span className="AboutField_contactPrefix">GitHub: </span>
                    <a
                      href="https://github.com/rajdevc123"
                      target="_blank"
                      rel="noreferrer"
                      className="AboutField_link"
                    >
                      github.com/rajdevc123
                    </a>
                  </li>
                  <li className="AboutField_resumeItem">
                    <a
                      href="/resume.pdf"
                      download="Chirag_Rajdeo_Resume.pdf"
                      className="AboutField_link AboutField_resumeLink"
                    >
                      Download Resume (PDF) ↗
                    </a>
                  </li>
                </ul>
              </div>
            </SectionBlock>
          </div>

          {/* Column 2 — Thinking and personality */}
          <div className="AboutField_col AboutField_colNarrative">
            <SectionBlock label="Approach" delay={0.1}>
              <p className="AboutField_bodyText">
                I find myself drawn to the spaces between disciplines, connecting
                ideas from design, technology, art, science and sociology.
                I&apos;m curious about how seemingly unrelated things inform one
                another, and enjoy following questions into unfamiliar
                territories. I believe in staying curious, exploring without
                predetermined answers and allowing unexpected connections to
                shape what I make and how I think.
              </p>
            </SectionBlock>

            <SectionBlock label="Interests" delay={0.15}>
              <p className="AboutField_bodyText">
                I&apos;m interested in human-computer interaction, embodied
                technologies, artificial intelligence, sensory experiences, human
                behaviour and the evolving relationship between people and
                machines. I&apos;m particularly drawn to the possibilities that
                emerge when technology moves beyond screens and into our
                physical, social and everyday environments.
              </p>
            </SectionBlock>

            <SectionBlock label="A Little About Me" delay={0.2}>
              <p className="AboutField_bodyText">
                Outside of design, I&apos;m usually running, exploring the
                outdoors, sketching or taking apart some new gadget just to see
                how it works. I have a habit of collecting electronic components
                and bits of hardware that might come in handy someday.
              </p>
            </SectionBlock>
          </div>

          {/* Column 3 — Professional information */}
          <div className="AboutField_col AboutField_colProfessional">
            <SectionBlock label="Experience" delay={0.15}>
              <div className="AboutField_entryList">
                {EXPERIENCE.map((item) => (
                  <article key={item.org} className="AboutField_entry">
                    <h3 className="AboutField_org">{item.org}</h3>
                    <p className="AboutField_meta">{item.meta}</p>
                    <p className="AboutField_entryDesc">{item.description}</p>
                  </article>
                ))}
              </div>
            </SectionBlock>

            <SectionBlock label="Skills" delay={0.2}>
              <div className="AboutField_skillList">
                {SKILLS.map((group) => (
                  <div key={group.category} className="AboutField_skillGroup">
                    <h3 className="AboutField_skillCategory">
                      {group.category}
                    </h3>
                    <p className="AboutField_skillItems">{group.items}</p>
                  </div>
                ))}
              </div>
            </SectionBlock>

            <SectionBlock label="Education" delay={0.25}>
              <div className="AboutField_eduList">
                {EDUCATION.map((edu) => (
                  <div key={edu.institution} className="AboutField_eduItem">
                    <h3 className="AboutField_org">{edu.institution}</h3>
                    <p className="AboutField_eduDegree">{edu.degree}</p>
                    <p className="AboutField_meta">{edu.period}</p>
                  </div>
                ))}
              </div>
            </SectionBlock>
          </div>
        </div>
      </InfiniteScroller>
    </div>
  );
}
