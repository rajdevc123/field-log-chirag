/**
 * PORTFOLIO PROJECTS REGISTRY
 *
 * HOW TO ADD A NEW PROJECT:
 * 1. Copy one of the objects in the `projects` array below.
 * 2. Change its `slug` (this automatically creates the URL `/work/your-slug`).
 * 3. Place any images or videos in `/public/projects/your-slug/` and reference them in `media`.
 * 4. If your project is an interactive live web experiment, set `interactiveEmbedUrl` to its path or URL.
 */

export interface ProjectSection {
  heading: string;
  body: string;
  caption?: string;
}

export interface ProjectEntry {
  id: string;
  index: string;
  slug: string;
  title: string;
  subtitle: string;
  year: string;
  category: string;
  tags: string[];
  summary: string;
  clientOrContext: string;
  role: string;
  duration: string;
  interactiveEmbedUrl?: string;
  sections: ProjectSection[];
}

export const projects: ProjectEntry[] = [
  {
    id: 'proj-01',
    index: '01',
    slug: 'tactile-telemetry-instrument',
    title: 'Tactile Telemetry Instrument',
    subtitle: '1-Bit E-Ink Field Recorder & Spatial Interface',
    year: '2026',
    category: 'PHYSICAL COMPUTING / INTERFACE',
    tags: ['E-Ink Display', 'Embedded Systems', 'Swiss Grid', 'Industrial Design'],
    summary:
      'An experimental field instrument exploring low-power 1-bit dithering, high-contrast sunlight legibility, and rotary hardware controls for environmental sensing.',
    clientOrContext: 'Studio Research // Sem 03',
    role: 'System Architecture, Shader Pipeline, Hardware Prototyping',
    duration: '6 Weeks',
    sections: [
      {
        heading: '01 // CONTEXT & PROBLEM',
        body: 'Modern field interfaces suffer from screen glare, battery drain, and cognitive overload. By constraining the visual output to a strict 1-bit charcoal-on-paper Bayer matrix, the interface prioritizes structural clarity over decorative chrome.',
        caption: 'FIG 1.1 — 4x4 ordered Bayer threshold calibration across luminance steps.',
      },
      {
        heading: '02 // SYSTEM ARCHITECTURE',
        body: 'Built around a custom shader pipeline and mechanical detented encoders. Sensor telemetry is mapped directly to typographic grids and spatial horizons without intermediate menus.',
        caption: 'FIG 1.2 — Signal flow from environmental sensors to 1-bit frame buffer.',
      },
      {
        heading: '03 // OUTCOME',
        body: 'Replace this placeholder text in src/content/projects.ts with your own project documentation, process photographs, and video embeds.',
      },
    ],
  },
  {
    id: 'proj-02',
    index: '02',
    slug: 'kinetic-cartography',
    title: 'Kinetic Cartography',
    subtitle: 'Procedural Terrain & Ecological Memory Simulation',
    year: '2026',
    category: 'COMPUTATIONAL DESIGN / WEBGL',
    tags: ['Three.js', 'GLSL Shaders', 'Procedural Animation', 'Data Visualization'],
    summary:
      'A real-time procedural simulation translating ecological migration datasets into responsive 3D forms and typographic telemetry overlays.',
    clientOrContext: 'New Media Design Studio',
    role: 'Creative Technologist & Interaction Designer',
    duration: '4 Weeks',
    interactiveEmbedUrl: '/elephant-walk/index.html',
    sections: [
      {
        heading: '01 // OVERVIEW',
        body: 'Ecological data is often presented as static charts detached from the living landscapes it describes. Kinetic Cartography pairs real-time procedural bone rigging with live telemetry overlays.',
        caption: 'FIG 2.1 — Procedural skeletal articulation driven by harmonic sine waves.',
      },
      {
        heading: '02 // TECHNICAL IMPLEMENTATION',
        body: 'Implemented in React Three Fiber using custom vertex wind displacement and screen-space ordered dithering so the 3D viewport blends seamlessly into the surrounding editorial print layout.',
      },
    ],
  },
  {
    id: 'proj-03',
    index: '03',
    slug: 'acoustic-paper-archive',
    title: 'Acoustic Paper Archive',
    subtitle: 'Tangible Sound Indexing & Archival Typography',
    year: '2025',
    category: 'INTERACTIVE INSTALLATION',
    tags: ['Sound Design', 'Archival Systems', 'Physical Interaction'],
    summary:
      'An archival table that links printed Swiss index cards with spatialized field recordings, turning physical browsing into an auditory composition.',
    clientOrContext: 'Exhibition Prototype',
    role: 'Interaction Design & Sound Engineering',
    duration: '5 Weeks',
    sections: [
      {
        heading: '01 // CONCEPT',
        body: 'How do we give digital audio archives the permanence and browsability of a physical library catalog? Each printed card carries an optical marker that triggers layered field recordings.',
      },
      {
        heading: '02 // EXHIBITION NOTES',
        body: 'Edit src/content/projects.ts to customize or replace this project card with your own case studies.',
      },
    ],
  },
];
