/**
 * Serves robots.txt for crawler directives
 */
Deno.serve((req) => {
  const robotsTxt = `# knXw Robots.txt
User-agent: *
Allow: /
Allow: /Landing
Allow: /Documentation
Allow: /Developers
Allow: /ai
Allow: /Pricing
Allow: /Privacy
Allow: /Terms
Allow: /Blog
Allow: /BlogPost
Allow: /Agents
Allow: /lowdown
Allow: /Support

# Rate limiting for aggressive crawlers
Crawl-delay: 1

# Sitemap
Sitemap: ${new URL('/sitemap', req.url).href}

# Disallow admin and internal pages
Disallow: /Dashboard
Disallow: /Settings
Disallow: /Profiles
Disallow: /Events
Disallow: /Insights
Disallow: /Engagements
Disallow: /BatchAnalytics
Disallow: /Integrations
Disallow: /DemoData
Disallow: /Onboarding
Disallow: /OrgAdmin
Disallow: /SystemHealth
Disallow: /MyApps
Disallow: /assistant

# Security
Disallow: /api/
Disallow: /functions/
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
});