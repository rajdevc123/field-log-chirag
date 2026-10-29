import type { Metadata, Viewport } from 'next';
import './globals.css';
import { siteConfig } from '@/content/site';
import { StefanChrome } from '@/components/StefanChrome';

export const metadata: Metadata = {
  title: siteConfig.metadata.title,
  description: siteConfig.metadata.description,
};

export const viewport: Viewport = {
  themeColor: '#f1efeb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="loaded">
      <head>
        <link
          rel="preload"
          href="/fonts/HelveticaNowDisplay-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/HelveticaNowDisplay-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <StefanChrome>{children}</StefanChrome>
      </body>
    </html>
  );
}
