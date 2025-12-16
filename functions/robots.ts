// Serve robots.txt for search engine crawlers
Deno.serve((req) => {
  const robotsTxt = `# knXw - Universal Intelligence Layer
User-agent: *
Allow: /
Allow: /Documentation
Allow: /Blog
Allow: /Pricing
Allow: /InteractiveDemo
Disallow: /Dashboard
Disallow: /Settings
Disallow: /api/

# Sitemap
Sitemap: ${new URL('/sitemap', req.url).href}

# Crawl-delay for polite bots
Crawl-delay: 1
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
});