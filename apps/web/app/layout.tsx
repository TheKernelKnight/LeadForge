import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';  // This should be correct
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LeadForge - Lead Generation Platform',
  description: 'Find and qualify business leads for your services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}