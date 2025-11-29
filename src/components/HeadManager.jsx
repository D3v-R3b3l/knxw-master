import React from 'react';

// This component doesn't render visible UI. It's intended to manage the document's <head>
// through the platform's rendering mechanism, which should hoist these tags.
// This is a common pattern in frameworks that handle server-side rendering or static generation.

export default function HeadManager() {
  return (
    <>
      {/* SEO and Base Tags */}
      <title>knXw • Psychographic Intelligence Platform</title>
      <meta name="description" content="knXw reveals the 'why' behind user actions, translating raw behavior into actionable psychographic insights for higher engagement and retention." />
      
      {/* Viewport Meta Tag - ACCESSIBILITY FIX: Enables user scaling */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Performance Optimization: Preconnect to critical domains */}
      <link rel="preconnect" href="https://app.base44.com" />
      <link rel="preconnect" href="https://base44.app" />

      {/* Favicon and Theme Colors (example) */}
      {/* You can add your favicon links here if they are uploaded to the project */}
      {/* <link rel="icon" href="/favicon.ico" /> */}
      <meta name="theme-color" content="#0a0a0a" />
    </>
  );
}