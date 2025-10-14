
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseProvider } from '@/firebase';
import 'react-simple-keyboard/build/css/index.css';
import { KeyboardProvider } from '@/components/keyboard-provider';

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseProvider>
          <KeyboardProvider>
            {children}
          </KeyboardProvider>
        </FirebaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
