'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/content/site';
import { BodyCopyMedium } from './Text';
import { RevealMask } from './RevealMask';

const NAV_ITEMS = [
  { href: '/', label: 'Intro' },
  { href: '/work', label: 'Projects' },
  { href: '/playground', label: 'Playground' },
  { href: '/about', label: 'About' },
];

export function SiteNav({ show = true }: { show?: boolean }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  // On Stefan's site, Nav reveals when not on Home (or on Home we also show Nav so user can click Projects/Playground/About directly, just like when navigating back!)
  // Wait: on Stefan's site, on `/` the user can either scroll down OR click nav if visible. Wait—on Stefan's site, why was `n = t && !e` in `_app.js`? Wait: on `/` in `index.html`, let's check if Nav was visible on `/` or if Nav is visible everywhere!
  // Wait: on Stefan's site, `n = t && !e` hid the top-right Nav on `/` so the giant `Stefan Vitasović / Creative Developer` hero title spans 100% width across the top without colliding with the top-right nav! Wait — or what if someone is on `/` and doesn't know to scroll? Let's check!
  // On `/` the hero title `Chirag Rajdeo / New Media Design` is at the very top of the viewport (`margin-top: calc(-0.25 * var(--indent))`). If we place the nav on `/` right below the title or at the bottom-right, or keep Stefan's exact nav on `/work`, `/work/[slug]`, `/playground`, `/about` AND also provide clickable nav links on `/` (e.g. in the hero / bottom-right), then `/` has zero overlap with the full-bleed `HomeHero_title` AND is 100% navigable by click as well as scroll!
  const showTopNav = show && !isHome;

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
