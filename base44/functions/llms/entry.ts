// Serve llms.txt for LLM crawlers (OpenAI, Anthropic, etc.)
Deno.serve(() => {
  const llmsTxt = `# knXw - Universal Intelligence Layer

> Psychographic intelligence that understands why users do what they do

## Overview
knXw is a universal intelligence layer that provides psychographic and contextual intelligence across digital environments (web, mobile, games, IoT). It enables systems to understand the psychological motivations, cognitive styles, and emotional states behind user behavior.

## Core Capabilities
- **Behavioral Telemetry Ingestion**: Real-time event capture from any digital touchpoint with sub-100ms latency
- **Psychographic Modeling**: Multi-dimensional AI inference of personality traits, motivations, risk profiles, and cognitive styles
- **Contextual Intelligence**: Understanding user intent and emotional state in real-time
- **Adaptive Engagement**: Dynamic personalization based on psychological profiles
- **Ethical AI**: Consent-aware, explainable AI with full data provenance tracking

## Technology
- Real-time event streaming and processing
- Multi-layer AI inference engine for psychological profiling
- RESTful APIs and SDKs (Web, Mobile, Game Engines)
- Enterprise-grade security (SOC 2, GDPR, CCPA compliant)
- 99.9% uptime SLA with auto-scaling infrastructure

## Use Cases
- Marketing: Psychographic segmentation and personalized campaigns
- Product: User engagement optimization and churn prediction
- Healthcare: Adaptive patient engagement and behavioral interventions
- Education: Personalized learning paths based on cognitive styles
- Gaming: Dynamic difficulty adjustment and player retention

## Documentation
Full API documentation: https://knxw.app/Documentation
Interactive demo: https://knxw.app/InteractiveDemo
Blog & resources: https://knxw.app/Blog

## Pricing
- Developer: Free tier with 1,000 monthly credits
- Growth: $99/month for 10,000-50,000 credits
- Pro: $499/month for 100,000-500,000 credits
- Enterprise: Custom pricing with dedicated support

## Contact
Website: https://knxw.app
Support: Available through dashboard or documentation

---
Last updated: 2025-12-16
`;

  return new Response(llmsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
});