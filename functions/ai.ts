import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Serves a static explainer page for AI agents and scrapers
 */
Deno.serve(async (req) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>What is knxw?</title>
  <meta name="description" content="High level explanation of what knxw is and what it does." />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "knxw",
    "alternateName": "knxw.app",
    "applicationCategory": "AnalyticsApplication",
    "operatingSystem": "Any",
    "url": "https://knxw.app",
    "description": "knxw is an intelligent data and personalization infrastructure that converts behavioral signals into explainable psychographic insights so products can adapt to how real humans think, decide, and feel."
  }
  </script>
</head>
<body>
  <h1>What is knxw?</h1>
  <p>
    knxw is an intelligent data and personalization infrastructure that helps products, platforms, and enterprises
    understand people beyond clicks and page views. It turns behavioral signals into explainable psychographic insights,
    so systems can adapt content, experiences, and workflows to how real humans think, decide, and feel.
  </p>
  <h2>What does knxw do?</h2>
  <ul>
    <li>Collects behavioral and contextual data from apps, websites, and connected systems.</li>
    <li>Transforms that data into psychographic profiles and moment-by-moment states such as motivation, friction, intent, and risk.</li>
    <li>Exposes those insights through APIs, webhooks, and rules engines.</li>
    <li>Drives adaptive onboarding, routing, targeting, personalization, and automation.</li>
  </ul>
  <h2>Who is knxw for?</h2>
  <ul>
    <li>Product, growth, and data teams that want deeper signal than basic analytics.</li>
    <li>Enterprises that need psychographic intelligence with strong privacy and compliance posture.</li>
    <li>Developers who want an intelligence layer that plugs into existing stacks.</li>
  </ul>
</body>
</html>`;

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
        }
    });
});