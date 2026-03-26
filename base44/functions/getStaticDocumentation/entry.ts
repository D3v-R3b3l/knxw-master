import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve((req) => {
  try {
    // This endpoint is PUBLIC - no auth required for scraping services
    const url = new URL(req.url);
    const section = url.searchParams.get('section') || 'all';
    
    // Generate static HTML content
    const staticContent = generateStaticDocumentationHTML(section);
    
    return new Response(staticContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error) {
    console.error('Static docs error:', error);
    return new Response(`
<!DOCTYPE html>
<html>
<head><title>knXw Documentation</title></head>
<body>
<h1>knXw Documentation</h1>
<p>knXw is a psychographic intelligence platform that helps you understand user psychology and behavior.</p>
<p>For full documentation, visit: https://knxw.app/documentation</p>
</body>
</html>
    `, { 
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
});

function generateStaticDocumentationHTML(section) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>knXw Documentation - Psychographic Intelligence Platform</title>
    <meta name="description" content="Complete documentation for knXw psychographic intelligence platform including SDK integration, AI insights, and growth strategies.">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #1a1a1a; margin-top: 2em; }
        h1 { font-size: 2.5em; margin-top: 0; }
        h2 { font-size: 2em; border-bottom: 2px solid #00d4ff; padding-bottom: 0.3em; }
        h3 { font-size: 1.5em; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
        code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
        ul, ol { margin: 1em 0; }
        li { margin: 0.5em 0; }
        .highlight { background: linear-gradient(135deg, #00d4ff, #0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    </style>
</head>
<body>

<h1><span class="highlight">knXw Platform</span> Documentation</h1>

<p>knXw is the world's first comprehensive psychographic intelligence platform. We help you understand the "why" behind user actions by analyzing behavioral data through psychological frameworks, enabling unprecedented personalization and optimization.</p>

<h2>What is Psychographic Intelligence?</h2>
<p>Unlike traditional analytics that tell you <em>what</em> users do, knXw reveals <em>why</em> they do it by analyzing:</p>
<ul>
    <li><strong>Personality Traits:</strong> Big Five personality dimensions that predict long-term behavior patterns</li>
    <li><strong>Motivation Stack:</strong> The primary psychological drivers that compel user action (achievement, security, social connection, creativity, autonomy)</li>
    <li><strong>Emotional States:</strong> Current mood, confidence, and energy levels affecting immediate decisions</li>
    <li><strong>Cognitive Styles:</strong> How users prefer to process information (analytical, intuitive, systematic, creative)</li>
    <li><strong>Risk Profiles:</strong> Comfort with uncertainty and willingness to try new solutions</li>
</ul>

<h2>Platform Overview</h2>
<p>knXw combines multiple layers of intelligence to create a comprehensive understanding of your users:</p>

<h3>🧠 Real-Time Psychographic Analysis</h3>
<p>Capture and analyze user behavior as it happens, building psychological profiles that become more accurate over time through continuous learning and temporal decay weighting.</p>

<h3>🎯 Audience Builder</h3>
<p>Create highly specific segments based on psychological traits, not just demographics. Build audiences like "High-conscientiousness achievement-motivated users showing hesitation signals" for unprecedented targeting precision.</p>

<h3>🚀 Adaptive Engagement Engine</h3>
<p>Deploy intelligent experiences that adapt in real-time based on user psychology. Trigger personalized content, modals, and interactions when users show specific psychological states.</p>

<h3>🤖 AI Agents</h3>
<p>Autonomous AI agents that optimize your growth, ensure compliance, and create personalized content based on psychological insights.</p>

<h3>📊 Executive Dashboard</h3>
<p>Board-ready insights with automated reporting that shows not just performance metrics, but the psychological drivers behind your business results.</p>

<h2>Quick Start Integration</h2>
<p>Get started with knXw in under 5 minutes:</p>

<h3>1. Install the SDK</h3>
<p>Add to your website with a single script tag:</p>
<pre><code>&lt;script async src="https://cdn.knxw.app/sdk/v1/knxw.js"&gt;&lt;/script&gt;
&lt;script&gt;
  window.knXw = window.knXw || [];
  knXw('init', 'YOUR_API_KEY');
  knXw('track', 'page_view');
&lt;/script&gt;</code></pre>

<p>Or install via npm for React/Node.js:</p>
<pre><code>npm install @knxw/sdk

import knXw from '@knxw/sdk';
knXw.init('YOUR_API_KEY');
knXw.track('page_view');

// Track custom events with psychological context
knXw.track('feature_used', {
  feature: 'dashboard',
  duration: 120,
  user_state: 'exploring'
});</code></pre>

<h3>2. Configure Analysis Rules</h3>
<p>Set up your first psychographic analysis rules to start understanding user psychology:</p>
<pre><code>knXw.track('engagement_rule', {
  trigger: 'high_conscientiousness_user',
  condition: 'pricing_page_visit',
  action: 'show_detailed_comparison'
});</code></pre>

<h3>3. Build Your First Audience</h3>
<p>Use the Audience Builder to create psychological segments:</p>
<ul>
    <li>Navigate to Audience Builder in the knXw dashboard</li>
    <li>Define psychological criteria (e.g., "High Openness" + "Achievement Motivation")</li>
    <li>Add behavioral conditions (e.g., "Viewed pricing page in last 7 days")</li>
    <li>Export to your ad platforms or CRM</li>
</ul>

<h2>Core Use Cases</h2>

<h3>E-commerce Personalization</h3>
<p>Personalize product recommendations, pricing strategies, and checkout experiences based on user psychology. High-conscientiousness users get detailed feature comparisons, while high-openness users see creative product applications.</p>

<h3>SaaS Onboarding & Retention</h3>
<p>Guide users through personalized onboarding flows based on their learning style and motivation. Trigger retention campaigns when users show psychological patterns predictive of churn.</p>

<h3>Content & Media Optimization</h3>
<p>Recommend content that matches user cognitive styles and emotional states. Analytical users get data-driven articles, while intuitive users receive story-based content.</p>

<h3>Revenue-First Ad Optimization</h3>
<p>Move beyond click-based metrics to optimize for customer lifetime value and profit margins using psychological segmentation. Target high-value personality profiles with premium messaging.</p>

<h2>Key Features</h2>

<h3>🎯 Psychographic Targeting</h3>
<p>Target users based on personality, motivation, and cognitive style rather than just demographics. Create campaigns for "Security-motivated analytical thinkers" or "Achievement-driven creative personalities."</p>

<h3>📈 Predictive Analytics</h3>
<p>Predict user behavior, churn risk, and lifetime value using psychological profiles. Our AI models achieve 85%+ accuracy in predicting user actions.</p>

<h3>🔄 Real-Time Adaptation</h3>
<p>Websites and apps that adapt in real-time based on user psychology. Show different content, pricing, and calls-to-action based on psychological state.</p>

<h3>📊 Explainable AI</h3>
<p>Every insight comes with detailed reasoning explaining why the AI made specific psychological inferences. Full transparency in all recommendations.</p>

<h3>🔒 Enterprise Security</h3>
<p>SOC2 Type II compliant with encryption at rest and in transit. Built-in consent management and data sovereignty controls.</p>

<h3>🌐 Global Scale</h3>
<p>Multi-region deployment with edge processing capabilities. Handle millions of events while maintaining sub-100ms response times.</p>

<h2>Integration Ecosystem</h2>

<h3>CRM Platforms</h3>
<ul>
    <li><strong>HubSpot:</strong> Sync psychological profiles to contact properties for advanced lead scoring</li>
    <li><strong>Salesforce:</strong> Enrich leads with motivation and personality data</li>
    <li><strong>Pipedrive:</strong> Personalize sales outreach based on psychological insights</li>
</ul>

<h3>Ad Platforms</h3>
<ul>
    <li><strong>Meta (Facebook/Instagram):</strong> Create lookalike audiences based on psychological traits</li>
    <li><strong>Google Ads:</strong> Optimize for psychological value rather than just conversions</li>
    <li><strong>LinkedIn:</strong> Target based on professional psychology and career motivations</li>
</ul>

<h3>Email Marketing</h3>
<ul>
    <li><strong>Mailchimp:</strong> Segment based on personality for higher engagement</li>
    <li><strong>Customer.io:</strong> Trigger behavioral emails based on psychological state changes</li>
    <li><strong>Klaviyo:</strong> Personalize e-commerce messaging using buyer psychology</li>
</ul>

<h3>Analytics Platforms</h3>
<ul>
    <li><strong>Google Analytics:</strong> Enhance GA4 data with psychological context</li>
    <li><strong>Mixpanel:</strong> Add psychological properties to event tracking</li>
    <li><strong>Amplitude:</strong> Analyze user journeys through psychological lens</li>
</ul>

<h2>Advanced Features</h2>

<h3>AI Agents</h3>
<p>Deploy autonomous AI agents that work 24/7 to optimize your business:</p>
<ul>
    <li><strong>Growth Orchestrator:</strong> Automatically optimizes user journeys based on psychological insights</li>
    <li><strong>Churn Prevention Agent:</strong> Identifies at-risk users and deploys intervention strategies</li>
    <li><strong>Content Personalization Agent:</strong> Dynamically generates personalized content for each user</li>
    <li><strong>Compliance Officer:</strong> Ensures all psychological profiling adheres to privacy regulations</li>
</ul>

<h3>Journey Builder</h3>
<p>Create sophisticated multi-step user flows that adapt based on psychological state changes:</p>
<ul>
    <li>Visual drag-and-drop interface for complex journey design</li>
    <li>Psychological triggers and conditions</li>
    <li>Multi-channel orchestration (email, SMS, push, in-app)</li>
    <li>A/B testing with psychological segmentation</li>
</ul>

<h3>Batch Analytics</h3>
<p>Run comprehensive psychological analysis on your entire user base:</p>
<ul>
    <li>Psychographic clustering and segmentation</li>
    <li>Behavioral trend analysis with psychological context</li>
    <li>Churn prediction with psychological risk factors</li>
    <li>Customer lifetime value prediction by personality type</li>
</ul>

<h2>API Reference</h2>

<h3>Event Tracking</h3>
<pre><code>// Track page views with psychological context
knXw.track('page_view', {
  url: '/pricing',
  section: 'enterprise',
  user_intent: 'comparison_shopping'
});

// Track custom events
knXw.track('feature_interaction', {
  feature: 'dashboard',
  interaction_type: 'deep_exploration',
  duration: 180
});

// Track conversion events
knXw.track('conversion', {
  type: 'purchase',
  value: 299.99,
  product: 'pro_plan',
  psychological_trigger: 'achievement_motivation'
});</code></pre>

<h3>User Identification</h3>
<pre><code>// Identify users for cross-device tracking
knXw.identify('user_123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'pro'
});

// Track user properties that influence psychology
knXw.identify('user_123', {
  industry: 'technology',
  role: 'founder',
  company_size: '50-100',
  decision_making_role: 'primary'
});</code></pre>

<h3>Real-time Personalization</h3>
<pre><code>// Get real-time psychological insights
knXw.getProfile('user_123').then(profile => {
  if (profile.motivation_stack.includes('achievement') && 
      profile.personality_traits.conscientiousness > 0.7) {
    // Show detailed, data-driven content
    showDetailedFeatures();
  } else if (profile.cognitive_style === 'creative') {
    // Show visual, inspiration-focused content
    showCreativeShowcase();
  }
});</code></pre>

<h2>Getting Started</h2>

<h3>1. Sign Up</h3>
<p>Create your free knXw account at <a href="https://knxw.app">https://knxw.app</a></p>

<h3>2. Get Your API Key</h3>
<p>Find your API key in the knXw dashboard under Settings → Integration</p>

<h3>3. Install the SDK</h3>
<p>Add the knXw SDK to your website or application using the code examples above</p>

<h3>4. Start Tracking</h3>
<p>Begin tracking user events and watch as psychological profiles build automatically</p>

<h3>5. Build Your First Audience</h3>
<p>Create your first psychological segment and export it to your preferred marketing platform</p>

<h2>Support & Resources</h2>

<h3>Documentation</h3>
<ul>
    <li>Complete SDK Reference: <a href="https://knxw.app/documentation#sdk">SDK Documentation</a></li>
    <li>API Reference: <a href="https://knxw.app/documentation#api">API Documentation</a></li>
    <li>Integration Guides: <a href="https://knxw.app/documentation#integrations">Integration Documentation</a></li>
</ul>

<h3>Community & Support</h3>
<ul>
    <li>Email Support: support@knxw.app</li>
    <li>Community Forum: Available in the knXw dashboard</li>
    <li>Status Page: <a href="https://status.knxw.app">status.knxw.app</a></li>
</ul>

<h3>Professional Services</h3>
<p>Need help with implementation? Our team of psychographic intelligence experts can help you:</p>
<ul>
    <li>Design psychological segmentation strategies</li>
    <li>Implement advanced use cases</li>
    <li>Optimize for maximum ROI</li>
    <li>Train your team on psychological marketing</li>
</ul>

<p>Contact us at enterprise@knxw.app for more information.</p>

<hr style="margin: 3em 0; border: none; border-top: 1px solid #ddd;">

<p><em>knXw - Understanding the Psychology Behind Every Click</em></p>
<p>© 2024 knXw. All rights reserved. | <a href="https://knxw.app/privacy">Privacy Policy</a> | <a href="https://knxw.app/terms">Terms of Service</a></p>

</body>
</html>`;
}