import React from 'react';
import { BodyCopySmall } from '../Text';

export interface VideoProps {
  src: string;
  caption?: string;
}

export function Video({ src, caption }: VideoProps) {
  const isYouTube = /youtube\.com|youtu\.be/i.test(src);
  const ytMatch = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_\-]+)/);
  const embedUrl = ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : src;

  return (
    <figure style={{ margin: 'calc(var(--indent) * 1.5) 0' }}>
      <div className="MediaGrid_mediaContent">
        {isYouTube ? (
          <iframe
            src={embedUrl}
            title={caption || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', aspectRatio: '16/9', border: 0, display: 'block' }}
          />
        ) : (
          <video src={src} autoPlay muted loop playsInline controls />
        )}
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
