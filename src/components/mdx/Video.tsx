import React from 'react';
import { BodyCopySmall } from '../Text';

export interface VideoProps {
  src: string;
  caption?: string;
}

export function Video({ src, caption }: VideoProps) {
  return (
    <figure style={{ margin: 'calc(var(--indent) * 1.5) 0' }}>
      <div className="MediaGrid_mediaContent">
        <video src={src} autoPlay muted loop playsInline controls />
      </div>
      {caption && (
        <figcaption style={{ marginTop: '0.5rem', opacity: 0.7 }}>
          <BodyCopySmall as="span">{caption}</BodyCopySmall>
        </figcaption>
      )}
    </figure>
  );
}

export default Video;
