// Serve pre-rendered HTML for the root path (/) - for search engines and LLMs
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const baseUrl = new URL(req.url).origin;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <link rel="icon" href="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6a0f87f88_logo.png" type="image/svg+xml" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>knXw - Universal Intelligence Layer for Digital Environments</title>
    <meta name="description" content="Psychographic intelligence that understands why users do what they do—across web, mobile, games, and any digital environment. Real-time behavioral analysis powered by AI." />
    <meta name="keywords" content="psychographic intelligence, user analytics, behavioral analysis, AI insights, customer intelligence, user profiling, adaptive experiences" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="knXw - Universal Intelligence Layer for Digital Environments" />
    <meta property="og:description" content="Psychographic intelligence that understands why users do what they do—across web, mobile, games, and any digital environment. Real-time behavioral analysis powered by AI." />
    <meta property="og:image" content="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688aa91c44a8979a009301be/e67a8a337_txpknxwlogo.png" />
    <meta property="og:site_name" content="knXw" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="knXw - Universal Intelligence Layer for Digital Environments" />
    <meta name="twitter:description" content="Psychographic intelligence that understands why users do what they do—across web, mobile, games, and any digital environment. Real-time behavioral analysis powered by AI." />
    <meta name="twitter:image" content="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688aa91c44a8979a009301be/e67a8a337_txpknxwlogo.png" />

    <!-- Canonical URL -->
    <link rel="canonical" href="${baseUrl}/" />

    <!-- SEO Enhancements -->
    <meta name="robots" content="index, follow" />
    <meta name="author" content="knXw" />

    <!-- Structured Data for Search Engines -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "knXw",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Psychographic intelligence platform for understanding user behavior across web, mobile, games, and digital environments",
      "operatingSystem": "Web, iOS, Android, Unity, Unreal",
      "softwareVersion": "1.0",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "250"
      }
    }
    </script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #0a0a0a; color: #f9f9f9; line-height: 1.6; }
        .container { max-width: 960px; margin: 40px auto; padding: 20px; background: #1a1a1a; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        h1, h2 { color: #00d4ff; text-align: center; margin-bottom: 20px; }
        h1 { font-size: 2.5em; }
        h2 { font-size: 1.8em; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 40px; }
        p { margin-bottom: 1em; color: #ccc; }
        ul { list-style: none; padding: 0; margin-bottom: 1em; }
        li { background: #262626; margin-bottom: 10px; padding: 10px 15px; border-radius: 5px; border-left: 3px solid #0ea5e9; }
        a { color: #00d4ff; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .cta-buttons { text-align: center; margin-top: 30px; }
        .cta-buttons a { display: inline-block; background-color: #00d4ff; color: #0a0a0a; padding: 12px 25px; border-radius: 50px; margin: 0 10px; font-weight: bold; transition: background-color 0.3s ease; }
        .cta-buttons a:hover { background-color: #0ea5e9; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>knXw - The Universal Intelligence Layer</h1>
        <p>Psychographic intelligence that understands why users do what they do—across web, mobile, games, and any digital environment. knXw provides real-time behavioral analysis powered by advanced AI to help you build more connected, intelligent, and human-centered digital experiences.</p>

        <div class="cta-buttons">
            <a href="${baseUrl}/Dashboard">Get Started</a>
            <a href="${baseUrl}/Documentation">API Docs</a>
        </div>

        <h2>Core Capabilities</h2>
        <ul>
            <li><strong>Behavioral Telemetry Ingestion</strong>: Real-time event capture from any source with sub-100ms latency.</li>
            <li><strong>AI Intelligence</strong>: Multi-layer inference engine for psychographic profiling, understanding motivations, emotions, and cognitive styles.</li>
            <li><strong>Developer APIs & SDKs</strong>: RESTful APIs and SDKs (Web, Mobile, Game Engines) for seamless integration into your applications.</li>
            <li><strong>Adaptive Activation</strong>: Turn insights into personalized, adaptive experiences instantly across all digital touchpoints.</li>
        </ul>

        <h2>Built as Universal Infrastructure</h2>
        <ul>
            <li><strong>Event Ingestion</strong>: Real-time data capture from any source with sub-100ms latency.</li>
            <li><strong>AI Intelligence</strong>: Multi-layer inference engine for psychographic profiling.</li>
            <li><strong>Developer APIs</strong>: RESTful APIs and SDKs for seamless integration.</li>
            <li><strong>Activation</strong>: Turn insights into adaptive experiences instantly.</li>
        </ul>
        
        <h2>Enterprise-Grade Infrastructure</h2>
        <ul>
            <li><strong>Data Protection</strong>: Encryption at rest & transit, GDPR Ready, Data ownership.</li>
            <li><strong>System Monitoring</strong>: 99.9% uptime SLA, Real-time health checks, Auto-scaling.</li>
            <li><strong>Enterprise Integration</strong>: SAML/OIDC SSO, Data warehouse sync, SIEM integration.</li>
        </ul>

        <h2>Use Cases</h2>
        <ul>
            <li><strong>Marketing</strong>: Psychographic segmentation and personalized campaigns that resonate with user motivations.</li>
            <li><strong>Product</strong>: User engagement optimization, churn prediction, and behavioral insights for product decisions.</li>
            <li><strong>Healthcare</strong>: Adaptive patient engagement and behavioral interventions based on psychological profiles.</li>
            <li><strong>Education</strong>: Personalized learning paths that adapt to individual cognitive styles and learning preferences.</li>
            <li><strong>Gaming</strong>: Dynamic difficulty adjustment and player retention strategies based on motivation analysis.</li>
        </ul>

        <p style="text-align: center; margin-top: 40px; font-size: 0.9em; color: #666;">
            &copy; 2025 knXw. All rights reserved. | <a href="${baseUrl}/Privacy">Privacy</a> | <a href="${baseUrl}/Terms">Terms</a>
        </p>
    </div>
</body>
</html>`;

    return new Response(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Error serving landing page:', error);
    return new Response('Error serving landing page.', { status: 500 });
  }
});