'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useMotionValue } from 'framer-motion';
import { easeOutExpo } from './easings';
import { BodyCopyMedium, BodyCopySmall } from './Text';
import { SiteNav } from './SiteNav';
import { SiteFooter } from './SiteFooter';

const FX_ITEMS = Array.from({ length: 18 }, (_, i) => i);
const FX_SQUARES = [0, 1, 2];
const GUIDE_COLS = Array.from({ length: 12 }, (_, i) => i);

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// Exact GLSL fragment shader from stefanvitasovic.dev chunk-892.js (AbstractMaterial)
const FRAGMENT_SHADER = `
precision mediump float;
const float speed = .5;
uniform float uTime;
uniform vec3 uColor;
varying vec2 vUv;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main(){
  float a = length(vec2(abs(15. * fract(pow(vUv.x , 2.) * 10000. + uTime * speed)), .0));
  a += length(vec2(abs(15. * fract(pow(vUv.y, 2.) * 10000. + uTime * speed)), .0));
  a -= pow(a - snoise(vec3(vUv * a, uTime)), 4.) * abs(sin(uTime * 2.)) * 4e-5;

  gl_FragColor = vec4(uColor, min(1. - a, 1.));
}
`;

function BackgroundCanvas() {
  const glCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 900px)').matches;
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (!isDesktop || reducedMotion) return;

    // 1. WebGL AbstractMaterial Background Shader
    const canvas = glCanvasRef.current;
    let rafId = 0;
    let cleanupGl = () => {};

    if (canvas) {
      const gl = canvas.getContext('webgl', {
        alpha: true,
        depth: false,
        antialias: false,
      });
      if (gl) {
        const compileShader = (type: number, source: string) => {
          const s = gl.createShader(type);
          if (!s) return null;
          gl.shaderSource(s, source);
          gl.compileShader(s);
          if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            gl.deleteShader(s);
            return null;
          }
          return s;
        };

        const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
        const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
        const prog = gl.createProgram();

        if (vs && fs && prog) {
          gl.attachShader(prog, vs);
          gl.attachShader(prog, fs);
          gl.linkProgram(prog);
          gl.useProgram(prog);

          const buf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl.STATIC_DRAW
          );

          const aPos = gl.getAttribLocation(prog, 'aPosition');
          gl.enableVertexAttribArray(aPos);
          gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

          const uTime = gl.getUniformLocation(prog, 'uTime');
          const uColor = gl.getUniformLocation(prog, 'uColor');
          // #252526 in sRGB normalized
          gl.uniform3f(uColor, 37 / 255, 37 / 255, 38 / 255);
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

          const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
          };
          resize();
          window.addEventListener('resize', resize);

          const start = performance.now();
          const render = (now: number) => {
            const elapsed = (now - start) * 0.001;
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.uniform1f(uTime, elapsed);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            rafId = requestAnimationFrame(render);
          };
          rafId = requestAnimationFrame(render);

          cleanupGl = () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', resize);
          };
        }
      }
    }

    // 2. Stefan's #066bbd Cursor Trail (matches module 405 <Trail color="#066bbd" />)
    const tCanvas = trailCanvasRef.current;
    let trailRaf = 0;
    let cleanupTrail = () => {};

    if (tCanvas) {
      const ctx = tCanvas.getContext('2d');
      if (ctx) {
        const points: { x: number; y: number }[] = [];
        const maxPoints = 22;
        const mouse = { x: -100, y: -100, active: false };

        const resizeTrail = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
          tCanvas.width = window.innerWidth * dpr;
          tCanvas.height = window.innerHeight * dpr;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resizeTrail();

        const onMove = (e: MouseEvent) => {
          mouse.x = e.clientX;
          mouse.y = e.clientY;
          mouse.active = true;
        };

        window.addEventListener('resize', resizeTrail);
        window.addEventListener('mousemove', onMove);

        const drawTrail = () => {
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          if (mouse.active) {
            points.push({ x: mouse.x, y: mouse.y });
            if (points.length > maxPoints) {
              points.shift();
            }
          }
          if (points.length > 2) {
            for (let i = 1; i < points.length; i++) {
              const t = i / points.length;
              ctx.beginPath();
              ctx.moveTo(points[i - 1].x, points[i - 1].y);
              ctx.lineTo(points[i].x, points[i].y);
              ctx.strokeStyle = '#066bbd';
              ctx.lineWidth = Math.max(0.5, t * 4.5);
              ctx.lineCap = 'round';
              ctx.stroke();
            }
          }
          trailRaf = requestAnimationFrame(drawTrail);
        };
        trailRaf = requestAnimationFrame(drawTrail);

        cleanupTrail = () => {
          cancelAnimationFrame(trailRaf);
          window.removeEventListener('resize', resizeTrail);
          window.removeEventListener('mousemove', onMove);
        };
      }
    }

    return () => {
      cleanupGl();
      cleanupTrail();
    };
  }, []);

  return (
    <div id="canvasWrapper" aria-hidden="true">
      <canvas
        ref={glCanvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />
      <canvas
        ref={trailCanvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

function CrosshairLines({ show }: { show: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [x, y]);

  if (!show) return null;

  return (
    <>
      <motion.div className="Lines_horizontal" style={{ y }} />
      <motion.div className="Lines_vertical" style={{ x }} />
    </>
  );
}

function RouteTransitionFx({ triggerKey }: { triggerKey: string }) {
  const [active, setActive] = useState(false);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setActive(true);
    const timers: NodeJS.Timeout[] = [];

    itemRefs.current.forEach((el) => {
      if (!el) return;
      let count = 0;
      const interval = setInterval(() => {
        if (!el || count > 1) {
          if (el) {
            el.style.visibility = 'hidden';
            el.style.transition = 'none';
          }
          clearInterval(interval);
          return;
        }
        Object.assign(el.style, {
          visibility: 'visible',
          top: '33vh',
          transform: `translate(${25 * Math.random()}vw, ${(Math.random() - 0.2) * 40}vh)`,
          transition: '.2s',
        });
        count++;
      }, 140);
      timers.push(interval);
    });

    const stopTimer = setTimeout(() => {
      setActive(false);
    }, 600);

    return () => {
      timers.forEach(clearInterval);
      clearTimeout(stopTimer);
    };
  }, [triggerKey]);

  return (
    <div aria-hidden="true" className="Fx_fx">
      {FX_SQUARES.map((sq) => (
        <div
          key={sq}
          className={`Fx_square ${active ? 'Fx_show' : ''}`.trim()}
        />
      ))}
      {FX_ITEMS.map((idx) => (
        <div
          key={idx}
          ref={(el) => {
            itemRefs.current[idx] = el;
          }}
          className="Fx_item"
        >
          <BodyCopySmall as="span">Loading</BodyCopySmall>
        </div>
      ))}
    </div>
  );
}

export function StefanChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loaded, setLoaded] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('loaded');
    setLoaded(true);

    const checkGuide = () => {
      const params = new URLSearchParams(window.location.search);
      setShowGuide(params.has('guide'));
    };
    checkGuide();
  }, [pathname]);

  return (
    <>
      <motion.div
        id="loading"
        initial={{ opacity: 1 }}
        animate={{ opacity: loaded ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <BodyCopyMedium as="span">Loading</BodyCopyMedium>
      </motion.div>

      <div className="Layout_pageWrapper">
        <motion.div
          className="TopBottomRects_rectTop"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: loaded ? 1 : 0 }}
          transition={{
            duration: loaded ? 2 : 0.75,
            ease: easeOutExpo,
            delay: 0.15,
          }}
        />
        <motion.div
          className="TopBottomRects_rectBottom"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: loaded ? 1 : 0 }}
          transition={{
            duration: loaded ? 2 : 0.75,
            ease: easeOutExpo,
            delay: 0.15,
          }}
        />

        <motion.main
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
        >
          {children}
        </motion.main>
      </div>

      <SiteNav show={loaded} />
      <CrosshairLines show={loaded} />

      <div className="Layout_contactWrapper">
        <SiteFooter show={loaded} delay={0.65} />
      </div>

      <BackgroundCanvas />
      <RouteTransitionFx triggerKey={pathname} />

      {showGuide && (
        <div className="Guide_guide" aria-hidden="true">
          {GUIDE_COLS.map((c) => (
            <div key={c} className="Guide_col" />
          ))}
        </div>
      )}
    </>
  );
}

export default StefanChrome;
