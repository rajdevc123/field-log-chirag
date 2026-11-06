'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Units are centimetres. The stage matches the page (--color-aux). The device is built from lathe profiles traced off
// the prototype photos; the shade and the base meet at the brass collar,
// which hides the magnet joint between the two halves.

type PartId =
  | 'base'
  | 'speaker'
  | 'battery'
  | 'charger'
  | 'collar'
  | 'ring'
  | 'mpu'
  | 'esp32'
  | 'mic'
  | 'shade';

type Part = {
  id: PartId;
  name: string;
  role: string;
  side: 'left' | 'right';
  // where the part travels to in the exploded view
  explode: [number, number, number];
};

// Bottom → top. Speaker, battery and charger live in the wooden base; the
// ring, ESP32, MPU6050 and mic make up the top module inside the shade.
const PARTS: Part[] = [
  {
    id: 'base',
    name: 'Lathe-turned wooden base',
    role: 'Holds the bottom module',
    side: 'right',
    explode: [0, -6, 0],
  },
  {
    id: 'speaker',
    name: '4 Ω speaker',
    role: 'Annam’s voice, driven by an I2S amp',
    side: 'left',
    explode: [0, -0.6, 0],
  },
  {
    id: 'battery',
    name: '1200 mAh LiPo',
    role: 'Cordless, so it can move round the table',
    side: 'left',
    explode: [0, 0.9, 0],
  },
  {
    id: 'charger',
    name: 'USB-C charging module',
    role: 'TP4056, charges the LiPo',
    side: 'right',
    explode: [0, 2.9, 0],
  },
  {
    id: 'collar',
    name: 'Brass collar',
    role: 'Hides the magnet joint between halves',
    side: 'right',
    explode: [0, 4.6, 0],
  },
  {
    id: 'ring',
    name: '12-pixel NeoPixel ring',
    role: 'Lights the shade for each presence state',
    side: 'left',
    explode: [0, 6.4, 0],
  },
  {
    id: 'mpu',
    name: 'MPU6050',
    role: 'Senses the flip to wake or mute',
    side: 'left',
    explode: [-3.8, 7.4, 0.25],
  },
  {
    id: 'esp32',
    name: 'ESP32-S3',
    role: 'Wi-Fi, audio streaming, light states',
    side: 'right',
    explode: [0, 6.2, 0],
  },
  {
    id: 'mic',
    name: 'INMP441 microphone',
    role: 'I2S MEMS mic, listens through the top',
    side: 'left',
    explode: [0, 4.8, 0],
  },
  {
    id: 'shade',
    name: 'Fluted acrylic shade',
    role: 'Diffuses the ring into one soft glow',
    side: 'right',
    explode: [0, 21.5, 0],
  },
];

const SHADE_Y0 = 3.95;
const SHADE_Y1 = 19;
const shadeR = (t: number) => 3.3 + 1.1 * Math.pow(t, 1.7);
const PIVOT_Y = 9.5;

const v2 = (pts: [number, number][]) => pts.map(([r, y]) => new THREE.Vector2(r, y));

function smoothSeam(g: THREE.LatheGeometry, segments: number, points: number) {
  const n = g.attributes.normal as THREE.BufferAttribute;
  for (let j = 0; j < points; j++) {
    const a = j;
    const b = segments * points + j;
    const x = (n.getX(a) + n.getX(b)) / 2;
    const y = (n.getY(a) + n.getY(b)) / 2;
    const z = (n.getZ(a) + n.getZ(b)) / 2;
    n.setXYZ(a, x, y, z);
    n.setXYZ(b, x, y, z);
  }
  n.needsUpdate = true;
}

function shadeGeometry() {
  const rows = 72;
  const segments = 360;
  const flutes = 40;
  const amp = 0.11;
  const pts: THREE.Vector2[] = [];
  for (let j = 0; j <= rows; j++) {
    const t = j / rows;
    pts.push(new THREE.Vector2(shadeR(t), SHADE_Y0 + t * (SHADE_Y1 - SHADE_Y0)));
  }
  const g = new THREE.LatheGeometry(pts, segments);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let k = 0; k < p.count; k++) {
    const x = p.getX(k);
    const z = p.getZ(k);
    const r = Math.hypot(x, z);
    const th = Math.atan2(x, z);
    const f = Math.pow(0.5 + 0.5 * Math.cos(flutes * th), 0.6);
    const nr = r + amp * f;
    p.setX(k, (x / r) * nr);
    p.setZ(k, (z / r) * nr);
  }
  g.computeVertexNormals();
  smoothSeam(g, segments, rows + 1);
  return g;
}

function canvasTexture(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext('2d')!);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Turned wood: rings run around the lathe axis, so grain lines run along u.
function woodTexture() {
  const tex = canvasTexture(1024, 512, (c) => {
    c.fillStyle = '#4c1915';
    c.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 260; i++) {
      const y = Math.random() * 512;
      const a = 0.04 + Math.random() * 0.12;
      c.strokeStyle = Math.random() > 0.5 ? `rgba(120,46,36,${a})` : `rgba(24,6,5,${a})`;
      c.lineWidth = 0.5 + Math.random() * 2.5;
      c.beginPath();
      const amp = 2 + Math.random() * 6;
      const freq = 1 + Math.floor(Math.random() * 3);
      for (let x = 0; x <= 1024; x += 16) {
        const yy = y + Math.sin((x / 1024) * Math.PI * 2 * freq + i) * amp;
        x === 0 ? c.moveTo(x, yy) : c.lineTo(x, yy);
      }
      c.stroke();
    }
  });
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Crumpled brass foil, as a bump map.
function foilTexture() {
  return canvasTexture(512, 64, (c) => {
    c.fillStyle = '#808080';
    c.fillRect(0, 0, 512, 64);
    for (let i = 0; i < 500; i++) {
      const v = Math.floor(Math.random() * 255);
      c.fillStyle = `rgba(${v},${v},${v},0.35)`;
      c.beginPath();
      c.ellipse(Math.random() * 512, Math.random() * 64, 2 + Math.random() * 10, 1 + Math.random() * 4, Math.random() * Math.PI, 0, Math.PI * 2);
      c.fill();
    }
  });
}

function shadowTexture() {
  const tex = canvasTexture(256, 256, (c) => {
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(60,40,30,0.45)');
    g.addColorStop(0.45, 'rgba(60,40,30,0.18)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
  });
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

type Built = {
  scene: THREE.Scene;
  pivot: THREE.Group;
  parts: Record<PartId, { group: THREE.Group; center: THREE.Vector3; explode: THREE.Vector3 }>;
  glowMats: { shade: THREE.MeshPhysicalMaterial; led: THREE.MeshStandardMaterial };
  innerLight: THREE.PointLight;
  shadow: THREE.Mesh;
};

function buildScene(): Built {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f1efeb');

  const mat = {
    wood: new THREE.MeshPhysicalMaterial({ map: woodTexture(), roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.4, side: THREE.DoubleSide }),
    brass: new THREE.MeshStandardMaterial({ color: '#caa24c', metalness: 1, roughness: 0.34, bumpMap: foilTexture(), bumpScale: 0.6 }),
    pcb: new THREE.MeshStandardMaterial({ color: '#151515', roughness: 0.55 }),
    pcbBlue: new THREE.MeshStandardMaterial({ color: '#1f58b8', roughness: 0.5 }),
    silver: new THREE.MeshStandardMaterial({ color: '#c9c9c4', metalness: 0.9, roughness: 0.3 }),
    chip: new THREE.MeshStandardMaterial({ color: '#0c0c0c', roughness: 0.4 }),
    header: new THREE.MeshStandardMaterial({ color: '#e8c33d', roughness: 0.5 }),
    rubber: new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.8 }),
    gold: new THREE.MeshStandardMaterial({ color: '#b99545', metalness: 1, roughness: 0.35 }),
    cell: new THREE.MeshStandardMaterial({ color: '#dcdcd8', metalness: 0.35, roughness: 0.35 }),
    tape: new THREE.MeshStandardMaterial({ color: '#e6b81e', roughness: 0.4 }),
    red: new THREE.MeshStandardMaterial({ color: '#c0261d', roughness: 0.5 }),
    pad: new THREE.MeshStandardMaterial({ color: '#b39068', roughness: 0.9 }),
  };
  const glowMats = {
    shade: new THREE.MeshPhysicalMaterial({
      color: '#f3efe6',
      roughness: 0.55,
      transmission: 0.7,
      thickness: 0.35,
      ior: 1.49,
      side: THREE.DoubleSide,
      emissive: new THREE.Color('#ffae55'),
      emissiveIntensity: 0,
    }),
    led: new THREE.MeshStandardMaterial({ color: '#f2eee4', roughness: 0.3, emissive: new THREE.Color('#ffb04a'), emissiveIntensity: 0 }),
  };

  const box = (w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    return mesh;
  };
  const cyl = (r: number, h: number, m: THREE.Material, y = 0, seg = 64) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
    mesh.position.y = y;
    return mesh;
  };

  const groups = {} as Record<PartId, THREE.Group>;
  const make = (id: PartId) => (groups[id] = new THREE.Group());

  // Base — a hollow turned cup with a side button and a pad underneath
  {
    const g = make('base');
    const profile = v2([
      [0, 0], [4.5, 0], [4.62, 0.12], [4.62, 2.15], [4.5, 2.28], [4.12, 2.32],
      [4.12, 2.55], [4.38, 2.62], [4.44, 2.82], [4.3, 2.94], [3.92, 2.98],
      [3.92, 3.7], [3.84, 3.8], [3.45, 3.8], [3.45, 0.55], [0, 0.55],
    ]);
    g.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 128), mat.wood));
    const button = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.28, 32), mat.wood);
    button.rotation.x = Math.PI / 2;
    button.position.set(0, 1.2, 4.68);
    g.add(button);
    g.add(cyl(4.42, 0.06, mat.pad, -0.03, 96));
  }

  // Speaker — cone facing up
  {
    const g = make('speaker');
    g.add(cyl(1.85, 0.85, mat.rubber, 0.95));
    g.add(cyl(1.95, 0.12, mat.gold, 1.42));
    const cone = new THREE.Mesh(new THREE.LatheGeometry(v2([[0.35, 1.5], [0.5, 1.55], [1.7, 1.86], [2.0, 1.9], [2.0, 1.48]]), 64), mat.rubber);
    g.add(cone);
    g.add(cyl(0.45, 0.06, mat.chip, 1.52, 32));
    g.add(box(0.35, 0.7, 0.25, mat.red, 0, 1.0, 1.9));
  }

  // Battery — flat pouch cell
  {
    const g = make('battery');
    g.add(box(5.0, 0.55, 3.4, mat.cell, 0, 2.3, 0));
    g.add(box(0.5, 0.57, 3.42, mat.tape, -2.5, 2.3, 0));
    const wire = (m: THREE.Material, z: number) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 8), m);
      w.rotation.z = Math.PI / 2;
      w.position.set(-1.9, 2.15, z);
      return w;
    };
    g.add(wire(mat.red, 1.85), wire(mat.chip, 1.65));
  }

  // Charging module — TP4056 with USB-C
  {
    const g = make('charger');
    g.add(box(2.6, 0.12, 1.7, mat.pcbBlue, 0.6, 2.8, -0.3));
    g.add(box(0.9, 0.32, 0.75, mat.silver, 1.7, 2.98, -0.3));
    g.add(box(0.5, 0.1, 0.4, mat.chip, 0.2, 2.9, -0.6));
    g.add(box(0.3, 0.1, 0.3, mat.chip, -0.3, 2.9, 0));
  }

  // Brass collar
  {
    const g = make('collar');
    g.add(new THREE.Mesh(new THREE.LatheGeometry(v2([[3.38, 3.8], [3.58, 3.8], [3.6, 4.18], [3.58, 4.55], [3.38, 4.55], [3.38, 3.8]]), 128), mat.brass));
  }

  // NeoPixel ring — twelve LEDs facing up into the shade
  {
    const g = make('ring');
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 1.85, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 1.25, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const pcb = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: false, curveSegments: 48 }), mat.pcb);
    pcb.rotation.x = -Math.PI / 2;
    pcb.position.y = 4.7;
    g.add(pcb);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const led = box(0.42, 0.14, 0.42, glowMats.led, Math.cos(a) * 1.55, 4.93, Math.sin(a) * 1.55);
      led.rotation.y = -a;
      g.add(led);
    }
  }

  // ESP32-S3 dev board, standing upright in the shade
  {
    const g = make('esp32');
    const y = 11;
    g.add(box(2.8, 6.3, 0.16, mat.pcb, 0, y, 0));
    g.add(box(1.8, 2.5, 0.3, mat.silver, 0, y + 1.6, 0.23));
    g.add(box(1.8, 0.7, 0.08, mat.chip, 0, y + 3.3, 0.06));
    g.add(box(0.24, 5.8, 0.24, mat.header, -1.2, y - 0.1, -0.2));
    g.add(box(0.24, 5.8, 0.24, mat.header, 1.2, y - 0.1, -0.2));
    g.add(box(0.9, 0.34, 0.32, mat.silver, -0.6, y - 2.95, 0.24));
    g.add(box(0.9, 0.34, 0.32, mat.silver, 0.6, y - 2.95, 0.24));
    g.add(box(0.5, 0.5, 0.18, glowMats.led, -0.2, y - 1.4, 0.17));
    g.add(box(0.35, 0.3, 0.2, mat.chip, 0.6, y - 0.4, 0.17));
  }

  // MPU6050, on the back of the ESP32
  {
    const g = make('mpu');
    g.add(box(2.1, 1.6, 0.12, mat.pcbBlue, 0, 9.5, -0.36));
    g.add(box(0.45, 0.45, 0.1, mat.chip, 0.1, 9.5, -0.47));
    g.add(box(0.24, 1.4, 0.24, mat.header, -0.9, 9.5, -0.26));
  }

  // INMP441 mic under the top cap
  {
    const g = make('mic');
    g.add(cyl(0.7, 0.12, mat.pcb, 18.2, 48));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.04, 8, 48), mat.gold);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 18.27;
    g.add(ring);
    g.add(box(0.45, 0.14, 0.35, mat.silver, 0.1, 18.32, 0));
    g.add(box(0.8, 0.22, 0.22, mat.header, 0, 18.0, -0.3));
  }

  // Shade — fluted cone with a frosted cap and the mic holes
  {
    const g = make('shade');
    g.add(new THREE.Mesh(shadeGeometry(), glowMats.shade));
    const cap = new THREE.Mesh(new THREE.CircleGeometry(shadeR(1) - 0.02, 96), glowMats.shade);
    cap.rotation.x = -Math.PI / 2;
    cap.position.y = SHADE_Y1 - 0.35;
    g.add(cap);
    for (let i = 0; i < 7; i++) {
      const a = (i / 6) * Math.PI * 2;
      const r = i === 6 ? 0 : 0.28;
      const holeMesh = new THREE.Mesh(new THREE.CircleGeometry(0.07, 12), mat.chip);
      holeMesh.rotation.x = -Math.PI / 2;
      holeMesh.position.set(Math.cos(a) * r, SHADE_Y1 - 0.34, Math.sin(a) * r);
      g.add(holeMesh);
    }
  }

  const pivot = new THREE.Group();
  pivot.position.y = PIVOT_Y;
  const body = new THREE.Group();
  body.position.y = -PIVOT_Y;
  pivot.add(body);
  scene.add(pivot);

  const parts = {} as Built['parts'];
  for (const p of PARTS) {
    const g = groups[p.id];
    body.add(g);
    // pivot (+9.5) and body (−9.5) cancel, so world space here is body space
    const center = new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3());
    parts[p.id] = { group: g, center, explode: new THREE.Vector3(...p.explode) };
  }

  const innerLight = new THREE.PointLight('#ffb35c', 0, 40, 1.6);
  innerLight.position.y = 7;
  groups.ring.add(innerLight);

  const key = new THREE.DirectionalLight('#fff1dc', 1.4);
  key.position.set(18, 30, 22);
  const rim = new THREE.DirectionalLight('#9fb4ff', 0.5);
  rim.position.set(-20, 12, -18);
  scene.add(key, rim);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.06;
  scene.add(shadow);

  return { scene, pivot, parts, glowMats, innerLight, shadow };
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const approach = (cur: number, target: number, step: number) =>
  cur < target ? Math.min(target, cur + step) : Math.max(target, cur - step);

export function AnnamViewer({ poster, posterAlt }: { poster: string; posterAlt: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const cardRefs = useRef<Partial<Record<PartId, HTMLDivElement | null>>>({});
  const lineRefs = useRef<Partial<Record<PartId, SVGPolylineElement | null>>>({});
  const dotRefs = useRef<Partial<Record<PartId, SVGCircleElement | null>>>({});

  const state = useRef({ exploded: false, flipped: false, hovered: null as PartId | null });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState<PartId | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    state.current.exploded = exploded;
  }, [exploded]);
  useEffect(() => {
    state.current.flipped = flipped;
  }, [flipped]);
  useEffect(() => {
    state.current.hovered = hovered;
  }, [hovered]);

  useEffect(() => {
    const host = canvasHost.current;
    const wrap = wrapRef.current;
    if (!host || !wrap) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      setFailed(true);
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const built = buildScene();
    const { scene, pivot, parts, glowMats, innerLight, shadow } = built;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.55;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 400);
    camera.position.set(26, 22, 38);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = 1.9;
    controls.autoRotate = !reduced;
    controls.autoRotateSpeed = 0.7;
    controls.target.set(0, 9.5, 0);

    let resumeTimer: number | undefined;
    const onStart = () => {
      controls.autoRotate = false;
      window.clearTimeout(resumeTimer);
      setTouched(true);
    };
    const onEnd = () => {
      if (reduced) return;
      resumeTimer = window.setTimeout(() => (controls.autoRotate = true), 4000);
    };
    controls.addEventListener('start', onStart);
    controls.addEventListener('end', onEnd);

    const onDblClick = () => {
      if (!state.current.exploded) setFlipped((f) => !f);
    };
    renderer.domElement.addEventListener('dblclick', onDblClick);

    let W = 1;
    let H = 1;
    const resize = () => {
      W = Math.max(1, wrap.clientWidth);
      H = Math.max(1, wrap.clientHeight);
      renderer.setSize(W, H, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      svgRef.current?.setAttribute('viewBox', `0 0 ${W} ${H}`);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '100px' });
    io.observe(wrap);

    // animation state
    let explodeT = 0;
    let flipP = 0;
    let glow = 1;
    let firstFrame = true;
    const clock = new THREE.Clock();
    const tmp = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const target = new THREE.Vector3();
    const anchors: { id: PartId; side: 'left' | 'right'; x: number; y: number }[] = [];

    const layoutLabels = (alpha: number) => {
      anchors.length = 0;
      for (const p of PARTS) {
        const part = parts[p.id];
        tmp.copy(part.center);
        part.group.localToWorld(tmp);
        tmp.project(camera);
        anchors.push({ id: p.id, side: p.side, x: (tmp.x * 0.5 + 0.5) * W, y: (-tmp.y * 0.5 + 0.5) * H });
      }
      const pad = W < 560 ? 8 : 14;
      for (const side of ['left', 'right'] as const) {
        const items = anchors
          .filter((a) => a.side === side)
          .sort((a, b) => a.y - b.y)
          .map((a) => {
            const el = cardRefs.current[a.id]!;
            return { a, el, h: el.offsetHeight, w: el.offsetWidth, top: 0 };
          });
        const gap = 6;
        items.forEach((it, i) => {
          const want = it.a.y - it.h / 2;
          const min = i === 0 ? pad : items[i - 1].top + items[i - 1].h + gap;
          it.top = Math.max(want, min);
        });
        for (let i = items.length - 1; i >= 0; i--) {
          const max = i === items.length - 1 ? H - pad - items[i].h - 44 : items[i + 1].top - items[i].h - gap;
          items[i].top = Math.min(items[i].top, max);
        }
        for (const it of items) {
          const left = side === 'left' ? pad : W - pad - it.w;
          it.el.style.transform = `translate(${left}px, ${it.top}px)`;
          it.el.style.opacity = String(alpha);
          it.el.style.pointerEvents = alpha > 0.5 ? 'auto' : 'none';
          const ex = side === 'left' ? left + it.w : left;
          const ey = it.top + it.h / 2;
          const elbow = side === 'left' ? ex + 14 : ex - 14;
          const line = lineRefs.current[it.a.id];
          line?.setAttribute('points', `${ex},${ey} ${elbow},${ey} ${it.a.x},${it.a.y}`);
          line?.style.setProperty('opacity', String(alpha));
          const dot = dotRefs.current[it.a.id];
          dot?.setAttribute('cx', String(it.a.x));
          dot?.setAttribute('cy', String(it.a.y));
          dot?.style.setProperty('opacity', String(alpha));
        }
      }
    };

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible) return;
      const s = state.current;
      const speed = reduced ? 4 : 1;

      explodeT = approach(explodeT, s.exploded ? 1 : 0, (dt / 1.1) * speed);
      flipP = approach(flipP, s.flipped ? 1 : 0, (dt / 1.15) * speed);
      const e = ease(explodeT);
      const f = ease(flipP);

      for (const p of PARTS) {
        const part = parts[p.id];
        part.group.position.copy(part.explode).multiplyScalar(e);
        const k = s.hovered === p.id ? 1.08 : 1;
        const sc = part.group.scale.x + (k - part.group.scale.x) * Math.min(1, dt * 10);
        part.group.scale.setScalar(sc);
      }

      pivot.rotation.z = Math.PI * f;
      pivot.position.y = PIVOT_Y + Math.sin(Math.PI * flipP) * 3.5;

      // Muting is immediate, like covering a candle; waking waits for the landing.
      const glowTarget = s.flipped ? 0 : flipP < 0.12 ? 1 : 0;
      glow = approach(glow, glowTarget, dt * (glowTarget > glow ? 1.2 : 2.6) * speed);
      const breathe = reduced ? 1 : 0.9 + 0.1 * Math.sin(clock.elapsedTime * 1.3);
      const g = glow * breathe;
      glowMats.shade.emissiveIntensity = 0.32 * g;
      glowMats.led.emissiveIntensity = 2.4 * g;
      innerLight.intensity = 60 * g;

      (shadow.material as THREE.MeshBasicMaterial).opacity = (1 - e) * (1 - 0.45 * Math.sin(Math.PI * flipP));
      shadow.scale.setScalar(1 - 0.15 * Math.sin(Math.PI * flipP));

      // Frame the assembly, pulling back to fit the exploded stack.
      target.set(0, THREE.MathUtils.lerp(9.5, 16.5, e), 0);
      const dist = THREE.MathUtils.lerp(H > W * 1.1 ? 52 : 46, H > W * 1.1 ? 118 : 100, e);
      dir.copy(camera.position).sub(controls.target).normalize();
      controls.target.copy(target);
      camera.position.copy(target).addScaledVector(dir, dist);
      controls.update();

      renderer.render(scene, camera);
      layoutLabels(Math.max(0, (explodeT - 0.55) / 0.45));

      if (firstFrame) {
        firstFrame = false;
        setReady(true);
      }
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resumeTimer);
      ro.disconnect();
      io.disconnect();
      controls.removeEventListener('start', onStart);
      controls.removeEventListener('end', onEnd);
      renderer.domElement.removeEventListener('dblclick', onDblClick);
      controls.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : [];
        mats.forEach((mm) => {
          Object.values(mm).forEach((v) => v instanceof THREE.Texture && v.dispose());
          mm.dispose();
        });
      });
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const toggleExplode = () => {
    setTouched(true);
    if (!exploded) setFlipped(false);
    setExploded((x) => !x);
  };

  return (
    <div className="Viewer" ref={wrapRef}>
      <img
        className={`Viewer_poster${failed ? '' : ' is-hidden'}`}
        src={poster}
        alt={posterAlt}
      />
      <div className="Viewer_canvas" ref={canvasHost} aria-hidden={!ready} />

      {!failed && (
        <>
          <svg className="Viewer_leaders" ref={svgRef} aria-hidden="true">
            {PARTS.map((p) => (
              <g key={p.id} className={hovered === p.id ? 'is-active' : undefined}>
                <polyline ref={(el) => { lineRefs.current[p.id] = el; }} style={{ opacity: 0 }} />
                <circle r={2.5} ref={(el) => { dotRefs.current[p.id] = el; }} style={{ opacity: 0 }} />
              </g>
            ))}
          </svg>

          <ul className="Viewer_labels" aria-label="Components" aria-hidden={!exploded}>
            {PARTS.map((p) => (
              <li key={p.id}>
                <div
                  ref={(el) => { cardRefs.current[p.id] = el; }}
                  className={`Viewer_card${hovered === p.id ? ' is-active' : ''}`}
                  style={{ opacity: 0 }}
                  onMouseEnter={() => setHovered(p.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span className="Viewer_cardText">
                    <span className="Viewer_cardName">{p.name}</span>
                    <span className="Viewer_cardRole">{p.role}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="Viewer_status" aria-live="polite">
            <span className={`Viewer_dot${flipped ? ' is-off' : ''}`} aria-hidden="true" />
            {exploded ? 'Exploded view' : flipped ? 'Muted' : 'Awake'}
          </div>
          <span className={`Viewer_hint${touched ? ' is-hidden' : ''}`}>
            Drag to rotate
          </span>

          <div className="Viewer_controls">
            <button
              type="button"
              className="Viewer_button"
              onClick={() => {
                setTouched(true);
                setFlipped((f) => !f);
              }}
              disabled={exploded}
              aria-pressed={flipped}
            >
              {flipped ? 'Flip to wake' : 'Flip to mute'}
            </button>
            <button
              type="button"
              className="Viewer_button"
              onClick={toggleExplode}
              aria-pressed={exploded}
            >
              {exploded ? 'Assemble' : 'Explode'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AnnamViewer;
