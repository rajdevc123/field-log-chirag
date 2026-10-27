/**
 * SITE CONFIGURATION
 * Edit this file to update your name, HUD telemetry, manifesto quote,
 * bio, and contact links across the entire portfolio.
 */

export const siteConfig = {
  // Brand & Monogram shown in the Swiss HUD footer & navigation
  monogram: 'Brdy',
  designerName: 'Chirag Rajdeo',
  role: 'New Media Design // Systems & Interactive Environments',
  institution: 'National Institute of Design (NID)',

  // Swiss Telemetry HUD Text
  telemetry: {
    sectorCode: 'SECTOR // 02 [SAVANNAH_GIANTS]',
    sectorCounter: '[ 02 / 02 : SAVANNAH_GIANTS ]',
    coordinates: 'LAT: 02.41°N │ LONG: 37.89°E',
    sleepingStatus: 'SLEEPING',
    awakeStatus: 'OBSERVING_USER',
    horizonLogTitle: 'HORIZON_LOG // 02',
    horizonLogQuote:
      '"DEEP TIME & MEMORY — Biological systems do not refactor; they accumulate. Software should be built to endure compression, not rebuild from scratch every season."',
  },

  // About / Manifesto Section (Below the fold)
  about: {
    headline:
      'Designing tactile digital instruments, computational environments, and durable software interfaces.',
    bioParagraphs: [
      'Working at the intersection of spatial computing, physical-digital systems, and editorial typography. Every interface is treated as an instrument with physical weight, deliberate constraints, and legibility.',
      'This portfolio is structured as an expandable field log. To add new projects or edit existing entries, update src/content/projects.ts.',
    ],
    capabilities: [
      'Interactive Installations & Spatial Computing',
      'WebGL / GLSL Shaders & Procedural Systems',
      'Tactile Hardware & Embedded Prototyping',
      'Swiss Editorial Systems & Design Tooling',
    ],
  },

  // Contact & Social Links
  links: {
    email: 'mailto:hello@example.com',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    areNa: 'https://are.na',
  },
};
