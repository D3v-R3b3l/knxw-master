import React from 'react';
import SEOHead from '@/components/system/SEOHead';
import FooterSection from '@/components/landing/FooterSection';
import CustomCursor from '@/components/ui/CustomCursor';
import { ConsentProvider } from '@/components/privacy/ConsentManager';
import { HelmetProvider } from 'react-helmet-async';
import RuntimeHomepageSections from '@/components/landing/RuntimeHomepageSections';

export default function LandingPage() {
  return (
    <HelmetProvider>
      <ConsentProvider>
        <SEOHead
          title="knXw - Runtime Intelligence Layer"
          description="knXw is a runtime intelligence layer that interprets user behavior and feeds that understanding back into your system so it can adapt what it does in real time."
          keywords="runtime intelligence layer, behavior interpretation, real-time system adaptation, adaptive runtime sdk, execution layer"
        />

        <div className="bg-black min-h-screen text-white selection:bg-white/10">
          <CustomCursor />
          <main className="relative z-10" id="landing-main">
            <RuntimeHomepageSections />
          </main>
          <div className="relative" style={{ zIndex: 20 }}>
            <FooterSection />
          </div>
        </div>
      </ConsentProvider>
    </HelmetProvider>
  );
}