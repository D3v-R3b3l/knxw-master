import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Generates XML sitemap for search engines
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const baseUrl = new URL(req.url).origin;
    
    // Static high-priority pages
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/Landing', priority: '1.0', changefreq: 'daily' },
      { loc: '/ai', priority: '1.0', changefreq: 'monthly' },
      { loc: '/Documentation', priority: '0.9', changefreq: 'weekly' },
      { loc: '/Developers', priority: '0.9', changefreq: 'weekly' },
      { loc: '/Pricing', priority: '0.9', changefreq: 'monthly' },
      { loc: '/Privacy', priority: '0.8', changefreq: 'monthly' },
      { loc: '/Terms', priority: '0.8', changefreq: 'monthly' },
      { loc: '/Blog', priority: '0.8', changefreq: 'daily' },
      { loc: '/Agents', priority: '0.7', changefreq: 'weekly' },
      { loc: '/lowdown', priority: '0.7', changefreq: 'weekly' },
      { loc: '/Support', priority: '0.6', changefreq: 'monthly' },
      { loc: '/Glossary', priority: '0.6', changefreq: 'monthly' }
    ];
    
    // Fetch published blog posts
    let blogPosts = [];
    try {
      blogPosts = await base44.asServiceRole.entities.BlogPost.filter(
        { published: true },
        '-published_date',
        100
      );
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
    }
    
    // Build XML
    const urls = [
      ...staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`),
      ...blogPosts.map(post => `  <url>
    <loc>${baseUrl}/BlogPost?slug=${post.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>${post.published_date ? new Date(post.published_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
  </url>`)
    ].join('\n');
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
    
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
});