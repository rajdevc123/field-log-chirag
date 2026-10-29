import React from 'react';

export interface GalleryProps {
  images: string[];
}

export function Gallery({ images = [] }: GalleryProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--indent)',
        margin: 'calc(var(--indent) * 1.5) 0',
      }}
    >
      {images.map((src, i) => (
        <div key={i} className="MediaGrid_mediaContent">
          <img src={src} alt="" />
        </div>
      ))}
    </div>
  );
}

export default Gallery;
