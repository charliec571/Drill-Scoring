import type { Metadata, Viewport } from 'next';
import './globals.css';
import NavigationHeader from '@/components/NavigationHeader';

export const metadata: Metadata = {
  title: '2026 U.S. Army JROTC National Drill Championship',
  description: 'Official Field Judge Scoring, Tabulation & Results System (SOP V4, Feb 2026)',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'JROTC Drill',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#111418',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-army-black text-white min-h-screen flex flex-col font-sans selection:bg-army-gold selection:text-black">
        <NavigationHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-20">
          {children}
        </main>
      </body>
    </html>
  );
}
