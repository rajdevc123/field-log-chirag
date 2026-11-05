'use client';

import React from 'react';

/**
 * Standard vertical flow wrapper for the /about page (infinite loop scrolling removed
 * across both desktop and mobile per user preference).
 */
export function InfiniteScroller({ children }: { children: React.ReactNode }) {
  const childArray = React.Children.toArray(children).filter(Boolean);

  return (
    <div className="InfiniteScroller_scrollWrapper">
      {childArray.map((child, idx) => (
        <section
          key={idx}
          className="InfiniteScroller_scrollItem"
          data-id={idx}
        >
          {child}
        </section>
      ))}
    </div>
  );
}

export default InfiniteScroller;
