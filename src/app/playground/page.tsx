import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllPlaygroundItems } from '@/content/getPlayground';
import { PlaygroundGrid } from '@/components/PlaygroundGrid';

export const metadata: Metadata = {
  title: 'Chirag Rajdeo | Playground',
  description:
    'Exploratory WebGL shaders, dithered 3D walk-cycles, and physical-digital sketches.',
};

export default function PlaygroundPage() {
  const items = getAllPlaygroundItems();

  return (
    <Suspense fallback={null}>
      <PlaygroundGrid items={items} />
    </Suspense>
  );
}
