
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseProvider } from '@/firebase';
import 'react-simple-keyboard/build/css/index.css';
import { KeyboardProvider } from '@/components/keyboard-provider';
import { PT_Sans, Playfair_Display } from 'next/font/google';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/dashboard-layout';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'HAVELI KEBAB & GRILL',
  description: 'Your Restaurant. Smarter.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased", ptSans.variable, playfairDisplay.variable)}>
        <FirebaseProvider>
          <KeyboardProvider>
            <DashboardLayout>
              {children}
            </DashboardLayout>
          </KeyboardProvider>
        </FirebaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
