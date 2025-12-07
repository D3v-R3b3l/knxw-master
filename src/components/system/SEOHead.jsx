import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEOHead({
  title = "knXw - Universal Intelligence Layer",
  description = "Psychographic intelligence that understands why users do what they do—across web, mobile, games, and any digital environment.",
  keywords = "psychographic intelligence, user analytics, behavioral analysis, AI insights, customer intelligence",
  ogImage = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688aa91c44a8979a009301be/e67a8a337_txpknxwlogo.png",
  ogType = "website",
  canonicalUrl,
}) {
  const fullTitle = title.includes('knXw') ? title : `${title} | knXw`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Helmet>
  );
}