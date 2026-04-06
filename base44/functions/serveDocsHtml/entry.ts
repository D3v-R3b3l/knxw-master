// Serve pre-rendered HTML for /documentation - for search engines and LLMs
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
    <title>knXw Documentation - API Reference, SDKs, and Integrations</title>
    <meta name="description" content="Comprehensive documentation for knXw API, Web SDK, GameDev SDK, Webhooks, and various integrations. Learn how to implement psychographic intelligence into your applications." />
    <meta name="keywords" content="knxw documentation, API reference, SDK guide, webhooks, integrations, psychographic intelligence, user behavior analytics" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="knXw Documentation" />
    <meta property="og:description" content="Comprehensive documentation for knXw API, Web SDK, GameDev SDK, Webhooks, and various integrations." />
    <meta property="og:image" content="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688aa91c44a8979a009301be/e67a8a337_txpknxwlogo.png" />
    <meta property="og:site_name" content="knXw" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="knXw Documentation" />
    <meta name="twitter:description" content="Comprehensive documentation for knXw API, Web SDK, GameDev SDK, Webhooks, and various integrations." />
    <meta name="twitter:image" content="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688aa91c44a8979a009301be/e67a8a337_txpknxwlogo.png" />

    <!-- Canonical URL -->
    <link rel="canonical" href="${baseUrl}/Documentation" />

    <meta name="robots" content="index, follow" />
    <meta name="author" content="knXw" />

    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": "knXw Documentation",
      "description": "Comprehensive API documentation and integration guides for knXw psychographic intelligence platform",
      "author": {
        "@type": "Organization",
        "name": "knXw"
      }
    }
    </script>

    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #0a0a0a; color: #f9f9f9; line-height: 1.6; }
        .container { max-width: 960px; margin: 40px auto; padding: 20px; background: #1a1a1a; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        h1, h2, h3 { color: #00d4ff; margin-bottom: 20px; }
        h1 { font-size: 2.5em; text-align: center; }
        h2 { font-size: 1.8em; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 40px; }
        h3 { font-size: 1.3em; margin-top: 30px; }
        p { margin-bottom: 1em; color: #ccc; }
        ul { list-style: disc; padding-left: 20px; margin-bottom: 1em; }
        li { margin-bottom: 8px; color: #ccc; }
        a { color: #00d4ff; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .doc-section { background: #262626; padding: 15px; border-radius: 5px; margin-bottom: 15px; border-left: 3px solid #0ea5e9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>knXw Documentation</h1>
        <p>Welcome to the knXw documentation. Here you can find detailed information about our platform, APIs, SDKs, and integrations to help you build powerful psychographic intelligence into your applications.</p>
        
        <h2>Getting Started</h2>
        <div class="doc-section">
            <h3>Introduction to knXw</h3>
            <p>knXw is a universal intelligence layer that provides psychographic and contextual intelligence across digital environments. It helps you understand not just what users do, but why they do it.</p>
            <ul>
                <li>Real-time behavioral telemetry</li>
                <li>AI-powered psychographic profiling</li>
                <li>Adaptive engagement capabilities</li>
                <li>Enterprise-grade security and compliance</li>
            </ul>
        </div>

        <h2>API Reference</h2>
        <div class="doc-section">
            <h3>REST API</h3>
            <p>Our RESTful API provides programmatic access to all knXw features. Key endpoints include:</p>
            <ul>
                <li><strong>POST /api/v1/events</strong> - Ingest behavioral events</li>
                <li><strong>GET /api/v1/profiles/:userId</strong> - Retrieve psychographic profiles</li>
                <li><strong>GET /api/v1/insights</strong> - Query AI-generated insights</li>
                <li><strong>GET /api/v1/recommendations</strong> - Get personalized recommendations</li>
            </ul>
            <p>Authentication: Bearer token required. See <a href="${baseUrl}/Documentation#authentication">Authentication Guide</a>.</p>
        </div>

        <h2>SDKs & Libraries</h2>
        <div class="doc-section">
            <h3>JavaScript/TypeScript SDK</h3>
            <p>For web applications. Install via npm:</p>
            <p><code>npm install @knxw/web-sdk</code></p>
        </div>

        <div class="doc-section">
            <h3>GameDev SDK (Unity & Unreal)</h3>
            <p>Specialized SDKs for game developers with player psychology analysis, motivation tracking, and adaptive difficulty features.</p>
        </div>

        <h2>Advanced Psychographics</h2>
        <div class="doc-section">
            <h3>Next-Generation Intelligence</h3>
            <ul>
                <li><strong>Cognitive Bias Detection</strong>: Identify anchoring, confirmation, recency, and loss aversion biases</li>
                <li><strong>Emotional Shift Analysis</strong>: Track subtle mood changes with volatility scoring</li>
                <li><strong>Custom Dimensions</strong>: Define industry-specific psychographic traits</li>
                <li><strong>Psychographic Trends</strong>: Visualize how user psychology evolves over time</li>
                <li><strong>Data Provenance</strong>: Full transparency on inference sources and confidence scores</li>
            </ul>
        </div>

        <h2>Marketing Platform Integrations</h2>
        <div class="doc-section">
            <h3>Connect Your Marketing Stack</h3>
            <ul>
                <li><strong>Marketo</strong>: Sync psychographic profiles to lead records</li>
                <li><strong>Pardot</strong>: Update prospect custom fields with psychological traits</li>
                <li><strong>Segment CDP</strong>: Stream psychographic traits as user properties</li>
                <li><strong>Salesforce Marketing Cloud</strong>: Enrich subscriber attributes</li>
                <li><strong>Adobe Analytics</strong>: Send psychographics as custom eVars</li>
                <li><strong>HubSpot</strong>: Sync psychographic data to CRM contacts</li>
                <li><strong>Meta (Facebook) Ads</strong>: Enhanced conversion tracking with psychological insights</li>
                <li><strong>Google Analytics 4</strong>: Enrich GA4 events with psychographic dimensions</li>
                <li><strong>Stripe</strong>: Payment behavior analysis and churn prediction</li>
                <li><strong>Webhooks</strong>: Real-time event notifications to any endpoint</li>
            </ul>
        </div>

        <h2>Engagement Marketplace</h2>
        <div class="doc-section">
            <h3>Pre-Built Templates</h3>
            <p>Access 100+ proven engagement templates tailored for specific industries:</p>
            <ul>
                <li><strong>E-commerce</strong>: Cart abandonment, product recommendations, loyalty programs</li>
                <li><strong>SaaS</strong>: Feature discovery, onboarding flows, upgrade prompts</li>
                <li><strong>Healthcare</strong>: Patient check-ins, appointment reminders, wellness programs</li>
                <li><strong>Finance</strong>: Risk-appropriate product recommendations, investment guidance</li>
                <li><strong>Gaming</strong>: Player retention, reward optimization, difficulty adaptation</li>
                <li><strong>Education</strong>: Adaptive learning paths, progress motivation, course recommendations</li>
            </ul>
        </div>

        <h2>Webhooks</h2>
        <div class="doc-section">
            <h3>Real-time Event Notifications</h3>
            <p>Configure webhooks to receive real-time notifications when psychographic profiles update, insights are generated, or engagement triggers fire.</p>
            <p>Webhook events are signed with HMAC-SHA256 for security verification.</p>
        </div>

        <h2>Advanced Features</h2>
        <div class="doc-section">
            <h3>A/B Testing with Psychographics</h3>
            <p>Run more effective experiments by segmenting users based on psychological profiles rather than just demographics.</p>
        </div>

        <div class="doc-section">
            <h3>Batch Analytics</h3>
            <p>Process large datasets to uncover trends, clusters, and market intelligence from aggregated psychographic data.</p>
        </div>

        <h2>Support</h2>
        <p>For additional help, explore our <a href="${baseUrl}/InteractiveDemo">Interactive Demo</a>, check the <a href="${baseUrl}/Blog">Blog</a>, or contact support through your dashboard.</p>

        <p style="text-align: center; margin-top: 40px; font-size: 0.9em; color: #666;">
            &copy; 2025 knXw. All rights reserved. | <a href="${baseUrl}/">Home</a> | <a href="${baseUrl}/Privacy">Privacy</a> | <a href="${baseUrl}/Terms">Terms</a>
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
    console.error('Error serving documentation page:', error);
    return new Response('Error serving documentation page.', { status: 500 });
  }
});