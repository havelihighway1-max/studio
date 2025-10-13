"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [isClient, setIsClient] = useState(false);
  const backgroundImage = PlaceHolderImages.find(img => img.id === 'blurry-dishes');

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Or a skeleton loader
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      {backgroundImage && (
        <Image
          src={backgroundImage.imageUrl}
          alt={backgroundImage.description}
          fill
          className="object-cover object-center filter blur-sm brightness-50"
          data-ai-hint={backgroundImage.imageHint}
          priority
        />
      )}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center bg-black/50 p-4 text-center">
        <div className="w-full bg-background/80 py-2 text-center backdrop-blur-sm mb-auto">
          <h2 className="font-body text-3xl font-bold text-primary [text-shadow:0_0_1px_hsl(var(--foreground))]">بسم الله الرحمن الرحيم</h2>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-1">
          <h1 className="font-headline text-6xl md:text-7xl lg:text-8xl font-bold text-white [text-shadow:2px_2px_8px_rgba(0,0,0,0.7)]">
            HAVELI KEBAB & GRILL
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-foreground/90">
            Your Restaurant. Smarter.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/dashboard">
              Enter Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
        
        <div className="h-16"></div>

      </div>
    </div>
  );
}