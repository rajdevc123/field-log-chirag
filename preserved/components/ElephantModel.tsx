'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame, useThree, useLoader, GroupProps } from '@react-three/fiber';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BiomechanicalElephantMaterial } from '@/shaders/DitherShader';

export interface HullData {
  points: string; // SVG polygon points in pixel coords
  topVertex: { x: number; y: number };
}

export interface ElephantModelProps extends GroupProps {
  isHovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  isCalf?: boolean;
  onHullUpdate?: (hull: HullData) => void;
  onWalkDelta?: (deltaScroll: number) => void;
}

// 2D Monotone Chain Convex Hull algorithm
function computeConvexHull(pts: { x: number; y: number }[]): { x: number; y: number }[] {
  if (pts.length <= 3) return pts;
  const sorted = [...pts].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
  const cross = (o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: { x: number; y: number }[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: { x: number; y: number }[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

export function ElephantModel({
  isHovered,
  onHoverChange,
  isCalf = false,
  onHullUpdate,
  onWalkDelta,
  ...props
}: ElephantModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, raycaster, pointer, size } = useThree();

  const stlPath = isCalf ? '/models/elephant_calf.stl' : '/models/elephant_mother.stl';
  const rawGeometry = useLoader(STLLoader, stlPath);

  // Weld vertices for smooth normals; normalize calf STL scale (925.6 / 261.97 = 3.533)
  // so both meshes share identical anatomical bone coordinates in the vertex shader
  const smoothGeometry = useMemo(() => {
    const cloned = rawGeometry.clone();
    if (isCalf) {
      cloned.scale(3.533, 3.533, 3.533);
    }
    cloned.deleteAttribute('normal');
    const welded = mergeVertices(cloned, 0.5);
    welded.computeVertexNormals();
    return welded;
  }, [rawGeometry, isCalf]);

  const material = useMemo(
    () => new BiomechanicalElephantMaterial({ isCalf }),
    [isCalf]
  );

  const walkCycleRef = useRef(0);
  const walkWeightRef = useRef(1.0);
  const hoverWeightRef = useRef(0.0);
  const currentYaw = useRef(0.0);
  const currentPitch = useRef(0.0);

  const targetPoint = useRef(new THREE.Vector3());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const tempVec = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();

    // 1. Smoothly transition between Walking (isHovered=false) and Observing User (isHovered=true)
    const targetWalk = isHovered ? 0.0 : 1.0;
    const targetHover = isHovered ? 1.0 : 0.0;

    walkWeightRef.current = THREE.MathUtils.lerp(walkWeightRef.current, targetWalk, dt * 3.8);
    hoverWeightRef.current = THREE.MathUtils.lerp(hoverWeightRef.current, targetHover, dt * 3.8);

    const wWalk = walkWeightRef.current;
    const wHover = hoverWeightRef.current;

    // Advance walk cycle phase when walking
    const walkStep = dt * (isCalf ? 3.8 : 3.1) * wWalk;
    walkCycleRef.current += walkStep;

    if (!isCalf && onWalkDelta) {
      onWalkDelta(dt * 0.65 * wWalk);
    }

    material.uniforms.uTime.value = t;
    material.uniforms.uWalkCycle.value = walkCycleRef.current;
    material.uniforms.uWalkWeight.value = wWalk;
    material.uniforms.uHoverWeight.value = wHover;
    material.uniforms.uEarFlap.value = Math.sin(t * 2.4) * (0.06 + 0.14 * wHover);

    // 2. Head Gaze Tracking when hovered
    let desiredYaw = 0.0;
    let desiredPitch = 0.0;

    if (isHovered && groupRef.current) {
      raycaster.setFromCamera(pointer, camera);
      raycaster.ray.intersectPlane(plane.current, targetPoint.current);

      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);

      const dx = targetPoint.current.x - (worldPos.x - 0.8);
      const dy = targetPoint.current.y - (worldPos.y + 1.2);

      // Turn head toward viewer (+Z is camera direction, which corresponds to positive Y rotation in side profile)
      desiredYaw = THREE.MathUtils.clamp(0.58 + dx * 0.22, 0.15, 0.88);
      desiredPitch = THREE.MathUtils.clamp(-dy * 0.22, -0.28, 0.28);
    }

    currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, desiredYaw, dt * 4.5);
    currentPitch.current = THREE.MathUtils.lerp(currentPitch.current, desiredPitch, dt * 4.5);

    material.uniforms.uHeadYaw.value = currentYaw.current;
    material.uniforms.uHeadPitch.value = currentPitch.current;

    // 3. Project live 3D anatomical extremity landmarks into 2D screen space for the CV Convex Hull
    if (onHullUpdate && groupRef.current) {
      const wc = walkCycleRef.current + (isCalf ? 1.4 : 0.0);
      const strideBob = Math.abs(Math.sin(wc)) * 22.0 * wWalk;

      // Key anatomical vertices in the remapped Y-up model space
      const flPhase = wc + 1.5708;
      const frPhase = wc + 4.7124;
      const blPhase = wc;
      const brPhase = wc + 3.1416;

      const flSwing = -Math.sin(flPhase) * 195.0 * wWalk;
      const frSwing = -Math.sin(frPhase) * 195.0 * wWalk;
      const blSwing = -Math.sin(blPhase) * 195.0 * wWalk;
      const brSwing = -Math.sin(brPhase) * 195.0 * wWalk;

      const flLift = Math.max(0, Math.cos(flPhase)) * 115.0 * wWalk;
      const frLift = Math.max(0, Math.cos(frPhase)) * 115.0 * wWalk;

      const trunkTipX = -610.0 + Math.sin(wc - 2.2) * 58.0 * wWalk - 55.0 * wHover;
      const trunkTipY = 55.0 + 75.0 * wHover + strideBob;

      const landmarks: [number, number, number][] = [
        [-430, 935 + strideBob, 0], // Crown of head
        [-580, 740 + strideBob, 0], // Forehead / Upper snout
        [-680, 390 + strideBob, 70], // Tusk tip
        [trunkTipX, trunkTipY, 0], // Swaying trunk tip
        [-205 + flSwing, flLift, -120], // Front-left foot
        [-205 + frSwing, frLift, 120], // Front-right foot
        [215 + blSwing, 0, -120], // Back-left foot
        [215 + brSwing, 0, 120], // Back-right foot
        [395, 360 + strideBob, 0], // Tail tip
        [350, 790 + strideBob, 0], // Rump / Pelvis arch
        [-40, 895 + strideBob, 0], // Shoulder peak
      ];

      const screenPts: { x: number; y: number }[] = [];
      for (const [lx, ly, lz] of landmarks) {
        tempVec.current.set(lx, ly, lz);
        tempVec.current.applyMatrix4(groupRef.current.matrixWorld);
        tempVec.current.project(camera);

        const sx = (tempVec.current.x * 0.5 + 0.5) * size.width;
        const sy = (-(tempVec.current.y * 0.5) + 0.5) * size.height;
        screenPts.push({ x: sx, y: sy });
      }

      const hull = computeConvexHull(screenPts);
      if (hull.length >= 3) {
        // Find top-most / front-left vertex for the blue computer-vision badge
        let topV = hull[0];
        for (const pt of hull) {
          if (pt.y + pt.x * 0.25 < topV.y + topV.x * 0.25) {
            topV = pt;
          }
        }
        const pointsStr = hull.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
        onHullUpdate({ points: pointsStr, topVertex: topV });
      }
    }
  });

  const modelScale = isCalf ? 0.00148 : 0.00265;

  return (
    <group
      ref={groupRef}
      {...props}
      scale={modelScale}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHoverChange(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHoverChange(false);
      }}
    >
      {/* Sculpted Elephant Mesh */}
      <mesh geometry={smoothGeometry} material={material} />

      {/* Generous Invisible Bounding Hitbox so hovering between walking legs never flickers */}
      <mesh position={[-120, 460, 0]}>
        <boxGeometry args={[1080, 920, 560]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
