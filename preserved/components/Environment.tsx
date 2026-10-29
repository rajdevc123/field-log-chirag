'use client';

import React, { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { SavannaReferenceBackgroundMaterial } from '@/shaders/DitherShader';

interface TerrainEnvironmentProps {
  scrollOffsetRef: React.MutableRefObject<number>;
}

/**
 * Renders the full-viewport 1-bit stipple sky + scrolling Turing/labyrinth wave-dithered
 * savanna ground plane matching media_1793098949617_90b387e7.png.
 */
export function TerrainEnvironment({ scrollOffsetRef }: TerrainEnvironmentProps) {
  const { size } = useThree();
  const bgMaterial = useMemo(() => new SavannaReferenceBackgroundMaterial(), []);

  useFrame((state) => {
    bgMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
    bgMaterial.uniforms.uScrollOffset.value = scrollOffsetRef.current;
    bgMaterial.uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh material={bgMaterial} frustumCulled={false} renderOrder={-10}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
