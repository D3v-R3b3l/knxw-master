// Serve pre-rendered HTML for the root path (/) - for search engines, crawlers, and LLMs
// This function returns a complete static HTML version of the landing page
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const baseUrl = url.origin;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <link rel="icon" href="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6a0f87f88_logo.png" type="image/png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>knXw - Universal Intelligence Layer for Digital Environments</title>
    <meta name="description" content="Psychographic intelligence that understands why users do what they do—across web, mobile, games, and any digital environment. Real-time behavioral analysis powered by AI." />
    <meta name="keywords" content="psychographic intelligence, user analytics, behavioral analysis, AI insights, customer intelligence, user profiling, adaptive experiences, cognitive bias detection, emotional analysis, user journey optimization" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${baseUrl}/" />
    <meta property="og:title" content="knXw - Universal Intelligence Layer for Digital Environments" />
    <meta property="og:description" content="Psychographic intelligence that understands why users do what they do—across web, mobile, games, and any digital environment. Real-time behavioral analysis powered by AI." />
    <meta property="og:image" content="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688aa91c44a8979a009301be/e67a8a337_txpknxwlogo.png" />
    <meta property="og:site_name" content="knXw" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${baseUrl}/" />
    <meta name="twitter:title" content="knXw - Universal Intelligence Layer for Digital Environments" />
    <meta name="twitter:description" content="Psychographic intelligence that understands why users do what they do—across web, mobile, games, and any digital environment. Real-time behavioral analysis powered by AI." />
    <meta name="twitter:image" content="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688aa91c44a8979a009301be/e67a8a337_txpknxwlogo.png" />

    <!-- Canonical URL -->
    <link rel="canonical" href="${baseUrl}/" />

    <!-- SEO Enhancements -->
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="author" content="knXw" />
    <meta name="generator" content="knXw Platform" />

    <!-- Structured Data for Search Engines -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "knXw",
      "applicationCategory": "BusinessApplication",
      "url": "${baseUrl}",
      "logo": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688aa91c44a8979a009301be/e67a8a337_txpknxwlogo.png",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free tier with full API access"
      },
      "description": "Psychographic intelligence platform for understanding user behavior across web, mobile, games, and digital environments. Features include cognitive bias detection, emotional shift analysis, user journey optimization, and AI-driven insights.",
      "operatingSystem": "Web, iOS, Android, Unity, Unreal",
      "softwareVersion": "2.0",
      "featureList": [
        "Real-time behavioral analysis",
        "Psychographic profiling",
        "Cognitive bias detection",
        "Emotional shift analysis",
        "User journey optimization",
        "AI-powered insights",
        "Marketing platform integrations",
        "Developer APIs and SDKs"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "250",
        "bestRating": "5"
      }
    }
    </script>

    <!-- Organization Schema -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "knXw",
      "url": "${baseUrl}",
      "logo": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688aa91c44a8979a009301be/e67a8a337_txpknxwlogo.png",
      "sameAs": [],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "url": "${baseUrl}/Support"
      }
    }
    </script>

    <!-- WebSite Schema for Sitelinks Search Box -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "knXw",
      "url": "${baseUrl}",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "${baseUrl}/Documentation?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
    </script>

    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            background-color: #0a0a0a; 
            color: #f9f9f9; 
            line-height: 1.7; 
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        
        /* Header/Nav */
        header {
            padding: 20px 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            position: sticky;
            top: 0;
            background: rgba(10,10,10,0.95);
            backdrop-filter: blur(10px);
            z-index: 100;
        }
        header .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo {
            font-size: 1.5em;
            font-weight: bold;
            color: #00d4ff;
            text-decoration: none;
        }
        nav a {
            color: #a3a3a3;
            text-decoration: none;
            margin-left: 30px;
            font-size: 0.95em;
            transition: color 0.3s;
        }
        nav a:hover { color: #fff; }
        
        /* Hero Section */
        .hero {
            text-align: center;
            padding: 120px 20px 100px;
            background: linear-gradient(180deg, #0a0a0a 0%, #111 100%);
        }
        .hero h1 {
            font-size: clamp(2.5em, 8vw, 5em);
            font-weight: 800;
            margin-bottom: 30px;
            line-height: 1.1;
        }
        .hero h1 span {
            background: linear-gradient(90deg, #00d4ff, #8b5cf6, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .hero p {
            font-size: 1.4em;
            color: #9ca3af;
            max-width: 800px;
            margin: 0 auto 50px;
        }
        .cta-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
        }
        .cta-buttons a {
            display: inline-block;
            padding: 18px 40px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 1.1em;
            text-decoration: none;
            transition: all 0.3s;
        }
        .btn-primary {
            background: #fff;
            color: #0a0a0a;
        }
        .btn-primary:hover { 
            transform: scale(1.05);
            box-shadow: 0 0 40px rgba(255,255,255,0.3);
        }
        .btn-secondary {
            background: transparent;
            color: #fff;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .btn-secondary:hover {
            background: rgba(255,255,255,0.1);
            border-color: rgba(255,255,255,0.4);
        }
        .hero-tags {
            display: flex;
            gap: 30px;
            justify-content: center;
            margin-top: 50px;
            flex-wrap: wrap;
            font-size: 0.85em;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        .hero-tags span::before {
            content: "●";
            margin-right: 8px;
            color: #00d4ff;
        }
        
        /* Sections */
        section {
            padding: 100px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        section h2 {
            font-size: 2.5em;
            text-align: center;
            margin-bottom: 20px;
            color: #fff;
        }
        section > p {
            text-align: center;
            color: #9ca3af;
            max-width: 700px;
            margin: 0 auto 60px;
            font-size: 1.2em;
        }
        .section-tag {
            display: inline-block;
            background: rgba(0,212,255,0.1);
            border: 1px solid rgba(0,212,255,0.2);
            color: #00d4ff;
            padding: 8px 20px;
            border-radius: 50px;
            font-size: 0.75em;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            margin-bottom: 20px;
        }
        
        /* Cards Grid */
        .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .card {
            background: linear-gradient(135deg, #111 0%, #1a1a1a 100%);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 35px;
            transition: all 0.3s;
        }
        .card:hover {
            border-color: rgba(0,212,255,0.3);
            transform: translateY(-5px);
        }
        .card h3 {
            font-size: 1.3em;
            margin-bottom: 12px;
            color: #fff;
        }
        .card p {
            color: #9ca3af;
            font-size: 0.95em;
            line-height: 1.6;
        }
        .card-number {
            font-size: 3em;
            font-weight: bold;
            color: rgba(255,255,255,0.05);
            margin-bottom: 10px;
        }
        
        /* Features List */
        .features-list {
            max-width: 900px;
            margin: 0 auto;
        }
        .feature-item {
            display: flex;
            align-items: flex-start;
            gap: 20px;
            padding: 25px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .feature-item:last-child { border-bottom: none; }
        .feature-icon {
            width: 50px;
            height: 50px;
            background: rgba(0,212,255,0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #00d4ff;
            font-size: 1.5em;
            flex-shrink: 0;
        }
        .feature-content h4 {
            font-size: 1.2em;
            margin-bottom: 8px;
            color: #fff;
        }
        .feature-content p {
            color: #9ca3af;
            font-size: 0.95em;
        }
        
        /* Use Cases */
        .use-cases-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            max-width: 1000px;
            margin: 0 auto;
        }
        .use-case {
            background: #111;
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 25px;
            text-align: center;
        }
        .use-case h4 {
            color: #fff;
            margin-bottom: 10px;
        }
        .use-case p {
            color: #6b7280;
            font-size: 0.9em;
        }
        
        /* Pricing */
        .pricing-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .pricing-card {
            background: #111;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
        }
        .pricing-card.featured {
            border-color: #00d4ff;
            background: linear-gradient(135deg, rgba(0,212,255,0.05) 0%, #111 100%);
        }
        .pricing-card h3 {
            font-size: 1.5em;
            margin-bottom: 10px;
            color: #fff;
        }
        .pricing-card .price {
            font-size: 3em;
            font-weight: bold;
            color: #00d4ff;
            margin: 20px 0;
        }
        .pricing-card .price span {
            font-size: 0.4em;
            color: #6b7280;
        }
        .pricing-card ul {
            list-style: none;
            margin: 30px 0;
            text-align: left;
        }
        .pricing-card li {
            padding: 10px 0;
            color: #9ca3af;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .pricing-card li:before {
            content: "✓";
            color: #10b981;
            margin-right: 10px;
        }
        
        /* CTA Section */
        .cta-section {
            text-align: center;
            padding: 150px 20px;
            background: linear-gradient(180deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%);
        }
        .cta-section h2 {
            font-size: clamp(2.5em, 6vw, 4em);
            margin-bottom: 20px;
        }
        .cta-section h2 span {
            background: linear-gradient(90deg, #00d4ff, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        /* Footer */
        footer {
            padding: 60px 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
            text-align: center;
        }
        footer p {
            color: #6b7280;
            margin-bottom: 20px;
        }
        footer a {
            color: #9ca3af;
            text-decoration: none;
            margin: 0 15px;
        }
        footer a:hover { color: #00d4ff; }
        
        /* Responsive */
        @media (max-width: 768px) {
            header .container { flex-direction: column; gap: 20px; }
            nav a { margin: 0 15px; }
            .hero { padding: 80px 20px 60px; }
            section { padding: 60px 20px; }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <a href="${baseUrl}/" class="logo">knXw</a>
            <nav>
                <a href="${baseUrl}/Documentation">Documentation</a>
                <a href="${baseUrl}/Pricing">Pricing</a>
                <a href="${baseUrl}/Blog">Blog</a>
                <a href="${baseUrl}/Dashboard">Get Started</a>
            </nav>
        </div>
    </header>

    <main>
        <section class="hero">
            <h1>The Universal<br/><span>Intelligence Layer</span></h1>
            <p>Psychographic intelligence that understands <strong>why</strong> users do what they do—across web, mobile, games, and any digital environment.</p>
            <div class="cta-buttons">
                <a href="${baseUrl}/Dashboard" class="btn-primary">Get Started</a>
                <a href="${baseUrl}/Documentation" class="btn-secondary">API Docs</a>
            </div>
            <div class="hero-tags">
                <span>Web & Mobile</span>
                <span>Game Engines</span>
                <span>REST API</span>
                <span>Any Platform</span>
            </div>
        </section>

        <section>
            <div class="container" style="text-align: center;">
                <span class="section-tag">Philosophy</span>
                <h2>From Data to Understanding</h2>
                <p>Redefine engagement across every domain: marketing becomes intuitive, education adapts to every learner, communication grows more empathetic, and decision-making becomes informed by understanding rather than assumption.</p>
            </div>
        </section>

        <section>
            <div class="container" style="text-align: center;">
                <span class="section-tag">Architecture</span>
                <h2>Built as Universal Infrastructure</h2>
                <p>Foundational cognitive layer for human understanding across every digital touchpoint</p>
            </div>
            <div class="cards-grid container">
                <article class="card">
                    <div class="card-number">01</div>
                    <h3>Event Ingestion</h3>
                    <p>Real-time data capture from any source with sub-100ms latency. Stream behavioral events from web, mobile, games, or any custom integration.</p>
                </article>
                <article class="card">
                    <div class="card-number">02</div>
                    <h3>AI Intelligence</h3>
                    <p>Multi-layer inference engine for psychographic profiling, cognitive bias detection, emotional shift analysis, and motivation mapping.</p>
                </article>
                <article class="card">
                    <div class="card-number">03</div>
                    <h3>Developer APIs</h3>
                    <p>RESTful APIs and SDKs for seamless integration into your applications. Support for JavaScript, React Native, Unity, and Unreal Engine.</p>
                </article>
                <article class="card">
                    <div class="card-number">04</div>
                    <h3>Activation</h3>
                    <p>Turn insights into adaptive experiences instantly. Personalize content, optimize journeys, and predict user behavior in real-time.</p>
                </article>
            </div>
        </section>

        <section>
            <div class="container" style="text-align: center;">
                <span class="section-tag">Features</span>
                <h2>Advanced Psychographic Intelligence</h2>
                <p>Deep behavioral understanding powered by cutting-edge AI</p>
            </div>
            <div class="features-list container">
                <div class="feature-item">
                    <div class="feature-icon">🧠</div>
                    <div class="feature-content">
                        <h4>Cognitive Bias Detection</h4>
                        <p>Automatically identify anchoring, confirmation, recency, and loss aversion biases in user behavior to optimize messaging and UX.</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <div class="feature-content">
                        <h4>Emotional Shift Analysis</h4>
                        <p>Track subtle emotional changes with magnitude and volatility scoring. Understand user sentiment evolution over time.</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🎯</div>
                    <div class="feature-content">
                        <h4>Motivation Mapping</h4>
                        <p>Identify core user motivations—achievement, social connection, mastery, autonomy—to drive personalized engagement strategies.</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🔄</div>
                    <div class="feature-content">
                        <h4>AI Journey Orchestration</h4>
                        <p>Proactive AI-driven suggestions for user journey optimization. Dynamic path optimization based on psychographic patterns.</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🛡️</div>
                    <div class="feature-content">
                        <h4>User Data Transparency Portal</h4>
                        <p>Give users complete visibility into their data. AI explainability, profile corrections, consent controls, and data export/deletion.</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">⚡</div>
                    <div class="feature-content">
                        <h4>Self-Learning Feedback Loop</h4>
                        <p>Continuous model improvement from user corrections and engagement outcomes. The system gets smarter with every interaction.</p>
                    </div>
                </div>
            </div>
        </section>

        <section>
            <div class="container" style="text-align: center;">
                <span class="section-tag">Enterprise</span>
                <h2>Enterprise-Grade Infrastructure</h2>
                <p>Security, reliability, and compliance built for mission-critical deployments</p>
            </div>
            <div class="cards-grid container">
                <article class="card">
                    <h3>Data Protection</h3>
                    <p>Encryption at rest & transit, GDPR Ready, complete data ownership. Your data stays yours.</p>
                </article>
                <article class="card">
                    <h3>System Monitoring</h3>
                    <p>99.9% uptime SLA, real-time health checks, and auto-scaling infrastructure.</p>
                </article>
                <article class="card">
                    <h3>Enterprise Integration</h3>
                    <p>SAML/OIDC SSO, data warehouse sync, and SIEM integration for seamless enterprise adoption.</p>
                </article>
            </div>
        </section>

        <section>
            <div class="container" style="text-align: center;">
                <span class="section-tag">Integrations</span>
                <h2>Connect Everything</h2>
                <p>Seamless integration with your existing marketing and analytics stack</p>
            </div>
            <div class="cards-grid container">
                <article class="card">
                    <h3>Marketing Automation</h3>
                    <p>Sync psychographic data to Marketo, Pardot, Salesforce Marketing Cloud with automated field mapping.</p>
                </article>
                <article class="card">
                    <h3>Customer Data Platforms</h3>
                    <p>Stream psychographic traits to Segment, Adobe Analytics, and Google Tag Manager.</p>
                </article>
                <article class="card">
                    <h3>CRM Enrichment</h3>
                    <p>Enhance HubSpot, Salesforce, Zoho CRM, and Pipedrive with deep psychographic intelligence.</p>
                </article>
                <article class="card">
                    <h3>E-commerce Platforms</h3>
                    <p>Personalize Shopify and Magento stores with psychographic customer insights and recommendations.</p>
                </article>
                <article class="card">
                    <h3>BI Tools Export</h3>
                    <p>Native exports for Tableau, Power BI, and Looker with formatted psychographic datasets.</p>
                </article>
                <article class="card">
                    <h3>Communication</h3>
                    <p>Twilio SMS integration for personalized messaging based on psychographic profiles.</p>
                </article>
                <article class="card">
                    <h3>Multi-Language SDKs</h3>
                    <p>Official SDKs for JavaScript, Python, Go, Ruby, and PHP with full API coverage.</p>
                </article>
                <article class="card">
                    <h3>Engagement Marketplace</h3>
                    <p>100+ pre-built templates for onboarding, retention, conversion, and support.</p>
                </article>
            </div>
        </section>

        <section>
            <div class="container" style="text-align: center;">
                <span class="section-tag">Use Cases</span>
                <h2>Built for Every Industry</h2>
                <p>Psychographic intelligence that adapts to your domain</p>
            </div>
            <div class="use-cases-grid container">
                <div class="use-case">
                    <h4>Marketing</h4>
                    <p>Psychographic segmentation and personalized campaigns</p>
                </div>
                <div class="use-case">
                    <h4>Product</h4>
                    <p>Engagement optimization and churn prediction</p>
                </div>
                <div class="use-case">
                    <h4>Healthcare</h4>
                    <p>Adaptive patient engagement and interventions</p>
                </div>
                <div class="use-case">
                    <h4>Education</h4>
                    <p>Personalized learning paths and cognitive adaptation</p>
                </div>
                <div class="use-case">
                    <h4>Gaming</h4>
                    <p>Dynamic difficulty and player retention</p>
                </div>
                <div class="use-case">
                    <h4>E-Commerce</h4>
                    <p>Conversion optimization and recommendation engines</p>
                </div>
            </div>
        </section>

        <section>
            <div class="container" style="text-align: center;">
                <span class="section-tag">Pricing</span>
                <h2>Simple, Transparent Pricing</h2>
                <p>Start free, scale as you grow</p>
            </div>
            <div class="pricing-grid container">
                <div class="pricing-card">
                    <h3>Developer</h3>
                    <div class="price">$0<span>/month</span></div>
                    <ul>
                        <li>10,000 events/month</li>
                        <li>Basic psychographic profiles</li>
                        <li>REST API access</li>
                        <li>Community support</li>
                    </ul>
                    <a href="${baseUrl}/Dashboard" class="btn-primary" style="display:block;text-align:center;">Start Free</a>
                </div>
                <div class="pricing-card featured">
                    <h3>Growth</h3>
                    <div class="price">$99<span>/month</span></div>
                    <ul>
                        <li>100,000 events/month</li>
                        <li>Advanced psychographics</li>
                        <li>Journey orchestration</li>
                        <li>Marketing integrations</li>
                        <li>Priority support</li>
                    </ul>
                    <a href="${baseUrl}/Dashboard" class="btn-primary" style="display:block;text-align:center;">Get Started</a>
                </div>
                <div class="pricing-card">
                    <h3>Pro</h3>
                    <div class="price">$499<span>/month</span></div>
                    <ul>
                        <li>1M events/month</li>
                        <li>Custom dimensions</li>
                        <li>A/B testing</li>
                        <li>Data warehouse sync</li>
                        <li>Dedicated support</li>
                    </ul>
                    <a href="${baseUrl}/Dashboard" class="btn-primary" style="display:block;text-align:center;">Get Started</a>
                </div>
                <div class="pricing-card">
                    <h3>Enterprise</h3>
                    <div class="price">Custom</div>
                    <ul>
                        <li>Unlimited events</li>
                        <li>Custom AI models</li>
                        <li>SSO/SAML</li>
                        <li>SLA guarantee</li>
                        <li>Dedicated CSM</li>
                    </ul>
                    <a href="${baseUrl}/Support" class="btn-secondary" style="display:block;text-align:center;border:1px solid rgba(255,255,255,0.2);">Contact Sales</a>
                </div>
            </div>
        </section>

        <section class="cta-section">
            <h2>Start Building <span>Today</span></h2>
            <p style="color:#9ca3af;font-size:1.3em;margin-bottom:40px;">Join developers deploying psychographic intelligence at scale</p>
            <div class="cta-buttons">
                <a href="${baseUrl}/Dashboard" class="btn-primary">Start Building Free</a>
                <a href="${baseUrl}/Documentation" class="btn-secondary">View Docs</a>
            </div>
            <div class="hero-tags" style="margin-top:40px;">
                <span>No credit card required</span>
                <span>Full API access</span>
                <span>Free forever plan</span>
            </div>
        </section>
    </main>

    <footer>
        <p>&copy; ${new Date().getFullYear()} knXw. All rights reserved.</p>
        <nav>
            <a href="${baseUrl}/Privacy">Privacy Policy</a>
            <a href="${baseUrl}/Terms">Terms of Service</a>
            <a href="${baseUrl}/Documentation">Documentation</a>
            <a href="${baseUrl}/Blog">Blog</a>
            <a href="${baseUrl}/Support">Support</a>
        </nav>
    </footer>
</body>
</html>`;

    return new Response(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'X-Robots-Tag': 'index, follow'
      }
    });
  } catch (error) {
    console.error('Error serving landing page:', error);
    return new Response('Error serving landing page.', { status: 500 });
  }
});