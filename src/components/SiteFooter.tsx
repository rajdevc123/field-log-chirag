'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/content/site';
import { BodyCopyMedium } from './Text';
import { RevealMask } from './RevealMask';

export function SiteFooter({
  show = true,
  delay = 0.65,
}: {
  show?: boolean;
  delay?: number;
}) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <div className="Contact_contact">
      <ul className="Contact_contactList">
        {siteConfig.availability.enabled && (
          <li className="Contact_contactListItem">
            <BodyCopyMedium as="span">
              <RevealMask show={show} delay={delay}>
                {siteConfig.availability.label}
              </RevealMask>
            </BodyCopyMedium>
          </li>
        )}
        {siteConfig.links.map((link, idx) => (
          <li key={link.href} className="Contact_contactListItem">
            <BodyCopyMedium>
              <RevealMask show={show} delay={delay + (idx + 1) * 0.1}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              </RevealMask>
            </BodyCopyMedium>
          </li>
        ))}
      </ul>

      <div className="Contact_year" style={{ pointerEvents: 'auto' }}>
        {isHome ? (
          <div style={{ display: 'flex', gap: '1.25em', alignItems: 'baseline' }}>
            <BodyCopyMedium as="span">
              <RevealMask show={show} delay={delay + 0.35}>
                <Link href="/work">Projects</Link>
              </RevealMask>
            </BodyCopyMedium>
            <BodyCopyMedium as="span">
              <RevealMask show={show} delay={delay + 0.4}>
                <Link href="/playground">Playground</Link>
              </RevealMask>
            </BodyCopyMedium>
            <BodyCopyMedium as="span">
              <RevealMask show={show} delay={delay + 0.45}>
                <Link href="/about">About</Link>
              </RevealMask>
            </BodyCopyMedium>
            <BodyCopyMedium as="span">
              <RevealMask
                show={show}
                delay={delay + 0.1 * siteConfig.links.length}
              >
                {siteConfig.year}
              </RevealMask>
            </BodyCopyMedium>
          </div>
        ) : (
          <BodyCopyMedium as="span">
            <RevealMask
              show={show}
              delay={delay + 0.1 * siteConfig.links.length}
            >
              {siteConfig.year}
            </RevealMask>
          </BodyCopyMedium>
        )}
      </div>
    </div>
  );
}

export default SiteFooter;
