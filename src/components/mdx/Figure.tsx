import React from 'react';
import { BodyCopySmall } from '../Text';

export interface FigureProps {
  src: string;
  caption?: string;
  alt?: string;
}

export function Figure({ src, caption, alt = '' }: FigureProps) {
  return (
    <figure style={{ margin: 'calc(var(--indent) * 1.5) 0' }}>
      <div className="MediaGrid_mediaContent">
        <img src={src} alt={alt || caption || ''} />
      </div>
      {caption && (
        <figcaption style={{ marginTop: '0.5rem', opacity: 0.7 }}>
          <BodyCopySmall as="span">{caption}</BodyCopySmall>
        </figcaption>
      )}
    </figure>
  );
}

export default Figure;
