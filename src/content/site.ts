export type WorkContextId = 'nid' | 'future-east' | 'dr-reddys';

export interface WorkContextMeta {
  id: WorkContextId;
  label: string;
  fullName: string;
  years: string;
  role: string;
}

export const siteConfig = {
  metadata: {
    title: 'Chirag Rajdeo | Creative Technologist & New Media Designer',
    description:
      'Creative technologist and New Media Designer at NID Gandhinagar. Focusing on interactive installations, physical computing, and digital experiences.',
    url: 'https://field-log-chirag.vercel.app',
  },
  identity: {
    name: 'Chirag Rajdeo',
    role: 'New Media Designer',
    location: 'Gandhinagar, India',
    extraNav: ['Chirag Rajdeo', 'New Media Designer', 'NID, India'],
  },
  home: {
    // Matches Stefan's HomeHero two-part SlicedText title separated by <Sep />
    title: ['Chirag Rajdeo', 'New Media Design'],
    // Line-by-line Reveal description matching Stefan's HomeHero_descriptionLabel
    description: [
      'New Media Design — NID · previously',
      "Dr. Reddy's & Future East Film.",
      'Exploring physical computing, interactive',
      'installations, and computational media.',
      'Bridging tangible hardware, real-time',
      'graphics, and research-led making.',
      'M.Des candidate at National Institute',
      'of Design, Gandhinagar.',
    ],
  },
  availability: {
    enabled: true,
    label: 'Available for freelance / open to grad opportunities:',
  },
  links: [
    {
      label: 'rajdevc123@gmail.com',
      href: 'mailto:rajdevc123@gmail.com',
    },
    {
      label: 'linkedin/chirag-rajdeo',
      href: 'https://linkedin.com/in/chirag-rajdeo',
    },
    {
      label: 'github/rajdevc123',
      href: 'https://github.com/rajdevc123',
    },
  ],
  year: '2026.',
  contexts: [
    {
      id: 'nid' as WorkContextId,
      label: 'NID',
      fullName: 'National Institute of Design',
      years: '2024 – ',
      role: 'M.Des — New Media Design',
    },
    {
      id: 'future-east' as WorkContextId,
      label: 'Future East Film',
      fullName: 'Future East Film',
      years: '2021 – 2022',
      role: 'Creative Producer',
    },
    {
      id: 'dr-reddys' as WorkContextId,
      label: "Dr. Reddy's Labs",
      fullName: "Dr. Reddy's Laboratories",
      years: '2022 – 2025',
      role: 'Digital Studio Manager',
    },
  ] satisfies WorkContextMeta[],
  about: {
    // Matches Stefan's ["Stfn", "Vtsvc"] giant character-animated AboutHero
    heroLabels: ['Chrg', 'Rjdo'],
    yearBadge: '26',
    paragraphs: [
      'Chirag Rajdeo is a Creative Technologist and New Media Designer working across physical computing, interactive installations, motion systems, and digital product experiences. Currently pursuing his Master of Design in New Media Design at the National Institute of Design (NID), Gandhinagar.',
      '"Before joining NID, I set up and led the in-house digital studio at Dr. Reddy’s Laboratories, directing technical infrastructure, interactive learning systems, and 360° enterprise platforms across 25+ gamified and scenario-based experiences. Earlier at Future East Film, I produced over 20 commercial campaigns for global brands including OnePlus, Meta, Reckitt, and Marico.',
      'My work lives at the intersection of tangible hardware and expressive software—combining microcontrollers (Arduino, ESP32), real-time shaders and projection mapping (TouchDesigner, Three.js, GLSL, MadMapper), and local AI/voice pipelines into cohesive spatial and screen-based narratives.',
      'With a B.Des in Visual Communication Design from ISDI Parsons and a B.A. in Sociology from the University of Mumbai, my practice pairs visual rigor with qualitative cultural inquiry. Current tools of choice include: TouchDesigner, Arduino/ESP32, React/Next.js, Three.js/R3F, GLSL, Python, Blender, Figma, and Adobe Creative Suite."',
      '— Blending physical computing, visual craft, and emerging media to build systems that resonate.',
      'Open for internships, research fellowships, creative technology collaborations, and select freelance commissions.',
    ],
    columns: [
      {
        title: 'Education',
        items: [
          'NID Gandhinagar — M.Des New Media Design (2025 – Present)',
          'ISDI Parsons Mumbai — B.Des Visual Communication (2017 – 2021)',
          'University of Mumbai — B.A. Sociology (2017 – 2020)',
        ],
      },
      {
        title: 'Experience',
        items: [
          "Dr. Reddy's Laboratories — Digital Studio Manager (2022 – 2025)",
          'Future East Film — Creative Producer (2021 – 2022)',
          'Sunset Cinema Club — Graphic Designer (2020 – 2021)',
        ],
      },
      {
        title: 'Physical & Interactive',
        items: [
          'Arduino, ESP32, Sensors & Actuators',
          'TouchDesigner, MadMapper, Processing',
          'Three.js / R3F, GLSL Shaders, WebGL',
          '3D Printing & Rapid Fabrication',
        ],
      },
      {
        title: 'Visual, Motion & AI',
        items: [
          'Figma, Adobe CC, Blender, DaVinci',
          'After Effects, Premiere Pro',
          'Local LLMs (Ollama), Computer Vision',
          'Voice & Audio Pipelines (STT/TTS/VAD)',
        ],
      },
    ],
    credentials: [
      {
        title: 'Download Resume (PDF) — Chirag_Rajdeo_Resume_2026.pdf',
        url: '/resume.pdf',
        download: true,
      },
      {
        title: 'LinkedIn — linkedin.com/in/chirag-rajdeo',
        url: 'https://linkedin.com/in/chirag-rajdeo',
      },
      {
        title: 'GitHub — github.com/rajdevc123',
        url: 'https://github.com/rajdevc123',
      },
      {
        title: 'Email — rajdevc123@gmail.com',
        url: 'mailto:rajdevc123@gmail.com',
      },
    ],
  },
};
