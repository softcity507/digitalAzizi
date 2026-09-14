'use client';

import LandingHeader from '@/components/max/LandingHeader';
import HeroSection from '@/components/max/HeroSection';
import AuthCard from '@/components/max/AuthCard';
import LandingFooter from '@/components/max/LandingFooter';

interface LandingContainerProps {
  className?: string;
}

export default function LandingContainer({ className = '' }: LandingContainerProps) {
  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center bg-canvas text-content-primary selection:bg-brand selection:text-black transition-colors duration-200 ${className}`}
    >
      {/* Background Decorative Radial Gradient Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-brand/5 rounded-full blur-3xl -top-24 -left-24 absolute" />
        <div className="w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-3xl top-1/3 -right-24 absolute" />
      </div>

      {/* 1. Header Bar */}
      <LandingHeader />

      {/* Main Content Flow */}
      <main className="relative z-10 w-full flex flex-col items-center gap-6 sm:gap-7 px-4 py-2 sm:py-4">
        {/* 2. Hero Section (Lock, Title, Description, Security Pill) */}
        <HeroSection />

        {/* 3. Authentication & Sign-in Card */}
        <AuthCard />



        {/* 5. 3 Feature Highlights (3C, Debit/Credit, PDF) */}
        {/* <FeatureHighlights /> */}

        {/* 6. Footer Section (Explore Demo & Legal Disclaimer) */}
        <LandingFooter />
      </main>
    </div>
  );
}
