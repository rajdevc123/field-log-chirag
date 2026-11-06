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

export function SiteFooter({
  show = true,
  delay = 0.65,
  hideNav = false,
}: {
  show?: boolean;
  delay?: number;
  /** Project pages swap the nav for the Back to projects pill. */
  hideNav?: boolean;
}) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isWork = pathname === '/work';
  const isAbout = pathname === '/about';

  // Navigation items for bottom bar:
  // On Home (/): show Projects, Playground, About (omit Home)
  // On all other pages: show Home, Projects, Playground, About
  const navItemsForPage = isHome
    ? NAV_ITEMS.filter((item) => item.href !== '/')
    : NAV_ITEMS;

  // On desktop (>= 900px), the bottom-left nav is shown on Home (/) and Projects (/work).
  // On mobile/tablet (< 900px), the bottom-left nav is shown on ALL pages as a unified sticky bottom bar.
  const showDesktopBottomNav = isHome || isWork;

  return (
    <div className={`Contact_contact${hideNav ? ' Contact_noNav' : ''}`}>
      {/* Sticky bottom-left navigation bar:
          - Desktop (>= 900px): active on Home (/) and Projects (/work)
          - Mobile (< 900px): active across ALL pages for consistent thumb-friendly navigation */}
      {!hideNav && (
      <nav
        className={`Contact_navLinks ${
          showDesktopBottomNav ? '' : 'Contact_mobileOnlyNav'
        }`.trim()}
        aria-label="Primary Navigation"
      >
        {navItemsForPage.map((item, idx) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <BodyCopyMedium key={item.href} as="span">
              <RevealMask show={show} delay={delay + 0.08 * idx}>
                <Link
                  href={item.href}
                  className={`Nav_navLink ${isActive ? 'Nav_isActive' : ''}`.trim()}
                >
                  {item.label}
                </Link>
              </RevealMask>
            </BodyCopyMedium>
          );
        })}
      </nav>
      )}

      {/* Bottom right: 2026. alone in the bottom right corner */}
      <div className="Contact_year" style={{ pointerEvents: 'auto' }}>
        <BodyCopyMedium as="span">
          <RevealMask show={show} delay={delay + 0.2}>
            {siteConfig.year}
          </RevealMask>
        </BodyCopyMedium>
      </div>
    </div>
  );
}

export default SiteFooter;
