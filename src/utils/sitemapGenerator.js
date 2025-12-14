/**
 * Sitemap Generator for Cambizzle
 * 
 * This utility can be used to generate a dynamic sitemap
 * based on your database content.
 * 
 * BACKEND IMPLEMENTATION RECOMMENDED:
 * Create an API endpoint (e.g., GET /api/sitemap.xml) that:
 * 1. Fetches all active ads from database
 * 2. Fetches all categories and subcategories
 * 3. Generates XML sitemap dynamically
 * 4. Returns with proper XML content-type header
 * 
 * Example usage in backend (Node.js/Express):
 * 
 * app.get('/api/sitemap.xml', async (req, res) => {
 *   const ads = await Ad.findAll({ where: { status: 'active' } });
 *   const categories = await Category.findAll();
 *   
 *   const sitemap = generateSitemap({
 *     baseUrl: 'https://cambizzle.com',
 *     ads,
 *     categories,
 *     staticPages: [
 *       { url: '/', priority: 1.0, changefreq: 'daily' },
 *       { url: '/search', priority: 0.9, changefreq: 'daily' },
 *       { url: '/create-ad', priority: 0.8, changefreq: 'monthly' }
 *     ]
 *   });
 *   
 *   res.header('Content-Type', 'application/xml');
 *   res.send(sitemap);
 * });
 */

export const generateSitemap = ({ baseUrl, ads = [], categories = [], staticPages = [] }) => {
  const now = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Add static pages
  staticPages.forEach(page => {
    xml += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq || 'monthly'}</changefreq>
    <priority>${page.priority || 0.5}</priority>
    <lastmod>${now}</lastmod>
  </url>`;
  });

  // Add ads
  ads.forEach(ad => {
    xml += `
  <url>
    <loc>${baseUrl}/ad/${ad.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${ad.updatedAt || now}</lastmod>`;
    
    // Add image if available
    if (ad.photos && ad.photos[0]) {
      xml += `
    <image:image>
      <image:loc>${ad.photos[0].url || ad.photos[0].originalUrl}</image:loc>
      <image:title>${escapeXml(ad.title)}</image:title>
    </image:image>`;
    }
    
    xml += `
  </url>`;
  });

  // Add categories
  categories.forEach(category => {
    xml += `
  <url>
    <loc>${baseUrl}/search?category=${category.id}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <lastmod>${now}</lastmod>
  </url>`;
    
    // Add subcategories if available
    if (category.subcategories) {
      category.subcategories.forEach(sub => {
        xml += `
  <url>
    <loc>${baseUrl}/search?subcategory=${sub.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <lastmod>${now}</lastmod>
  </url>`;
      });
    }
  });

  xml += `
</urlset>`;

  return xml;
};

// Helper function to escape special XML characters
const escapeXml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export default generateSitemap;
