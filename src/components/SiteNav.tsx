'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/content/site';
import { BodyCopyMedium } from './Text';
import { RevealMask } from './RevealMask';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Projects' },
  { href: '/playground', label: 'Playground' },
  { href: '/about', label: 'About' },
];

export function SiteNav({ show = true }: { show?: boolean }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isWork = pathname === '/work';
  // Top nav is hidden on Home AND on Projects (/work), because both share the sticky bottom-left nav
  const showTopNav = show && !isHome && !isWork;

  return (
    <>
      <nav className="Nav_nav" aria-label="Primary Navigation">
        <ul className="Nav_navLinks">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <BodyCopyMedium
                key={item.href}
                as="li"
                className="Nav_linkItem"
              >
                <RevealMask show={showTopNav} delay={0.25}>
                  <Link
                    href={item.href}
                    scroll={false}
                    tabIndex={showTopNav ? 0 : -1}
                    className={`Nav_navLink ${isActive ? 'Nav_isActive' : ''}`.trim()}
                  >
                    {item.label}
                  </Link>
                </RevealMask>
              </BodyCopyMedium>
            );
          })}
        </ul>
      </nav>

      <div className="Nav_extraNav Nav_hideOnDesktop">
        <Link href="/" tabIndex={showTopNav ? 0 : -1}>
          <ul>
            {siteConfig.identity.extraNav.map((line, i) => (
              <li key={i}>
                <BodyCopyMedium>
                  <RevealMask show={showTopNav} delay={0.1 * i + 0.5}>
                    {line}
                  </RevealMask>
                </BodyCopyMedium>
              </li>
            ))}
          </ul>
        </Link>
      </div>
    </>
  );
}

export default SiteNav;
