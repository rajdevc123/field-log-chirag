import React from 'react';
import { BodyCopyMedium } from '../Text';

export interface TwoColProps {
  left: string;
  right: string;
}

export function TwoCol({ left, right }: TwoColProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--indent)',
        margin: 'calc(var(--indent) * 1.25) 0',
      }}
    >
      <BodyCopyMedium>{left}</BodyCopyMedium>
      <BodyCopyMedium>{right}</BodyCopyMedium>
    </div>
  );
}

export default TwoCol;
