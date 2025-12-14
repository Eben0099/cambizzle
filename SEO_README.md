# SEO Optimization Guide - Cambizzle

## 📋 Overview
This document explains the SEO implementation for Cambizzle and how to maintain it.

## 🔧 Implementation

### 1. React Helmet Async
- **Package**: `react-helmet-async`
- **Provider**: Configured in `src/main.jsx`
- **Purpose**: Manage document head tags dynamically

### 2. Components Created

#### `src/components/SEO.jsx`
Reusable component for managing meta tags on all pages.

**Usage**:
```jsx
import SEO from '../components/SEO';

<SEO
  title="Page Title | Cambizzle"
  description="Page description (150-160 chars)"
  image="/path/to/image.jpg"
  url="/page-url"
  type="website" // or "product" for ads
  keywords="keyword1, keyword2, keyword3"
/>
```

#### `src/components/StructuredData.jsx`
Schema.org JSON-LD structured data components.

**Available Schemas**:
- `OrganizationSchema` - For homepage
- `WebsiteSchema` - For homepage with search action
- `ProductSchema` - For ad detail pages
- `BreadcrumbSchema` - For navigation breadcrumbs
- `SearchResultsSchema` - For search results pages

**Usage**:
```jsx
import { ProductSchema } from '../components/StructuredData';

<ProductSchema ad={adData} />
```

### 3. Pages with SEO

#### ✅ Home Page (`src/pages/Home.jsx`)
- SEO component with home-specific meta tags
- OrganizationSchema
- WebsiteSchema

#### ✅ Ad Detail Page (`src/pages/AdDetail.jsx`)
- Dynamic SEO based on ad data
- ProductSchema with pricing and availability
- BreadcrumbSchema for navigation

#### ✅ Search Page (`src/pages/Search.jsx`)
- Dynamic SEO based on search query
- SearchResultsSchema when query exists

### 4. Static Files

#### `public/robots.txt`
```
User-agent: *
Disallow:
Sitemap: https://cambizzle.com/sitemap.xml
```

#### `public/sitemap.xml`
Basic sitemap with main pages. **Needs to be generated dynamically from backend**.

## 🚀 Next Steps (Backend Implementation)

### Dynamic Sitemap Generation

Create a backend endpoint to generate sitemap dynamically:

```javascript
// Backend: /api/sitemap.xml
app.get('/api/sitemap.xml', async (req, res) => {
  const ads = await Ad.findAll({ 
    where: { status: 'active' },
    attributes: ['slug', 'title', 'updatedAt']
  });
  
  const categories = await Category.findAll({
    include: [{ model: Subcategory }]
  });
  
  const sitemap = generateSitemap({
    baseUrl: 'https://cambizzle.com',
    ads,
    categories,
    staticPages: [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/search', priority: 0.9, changefreq: 'daily' },
      { url: '/create-ad', priority: 0.8, changefreq: 'monthly' }
    ]
  });
  
  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});
```

Use the utility: `src/utils/sitemapGenerator.js`

### Update Frontend Sitemap
Once backend endpoint is ready, update your nginx/apache config to serve:
```
https://cambizzle.com/sitemap.xml -> Backend API: /api/sitemap.xml
```

## 📊 SEO Checklist

### Meta Tags (All pages)
- ✅ Title (50-60 characters)
- ✅ Description (150-160 characters)
- ✅ Keywords
- ✅ Canonical URL
- ✅ OpenGraph tags (Facebook, WhatsApp, LinkedIn)
- ✅ Twitter Cards
- ✅ Viewport meta tag
- ✅ Theme color

### Structured Data
- ✅ Organization Schema (Home)
- ✅ Website Schema (Home)
- ✅ Product Schema (Ad Details)
- ✅ Breadcrumb Schema (Ad Details)
- ✅ SearchResults Schema (Search page)

### Files
- ✅ robots.txt
- ✅ sitemap.xml (static - needs dynamic generation)

### Performance
- ⚠️ Image optimization (use WebP, lazy loading)
- ⚠️ Code splitting
- ⚠️ SSR/SSG consideration for better SEO

## 🔍 Testing Your SEO

### Tools to Use:
1. **Google Search Console**: Submit sitemap
2. **Google Rich Results Test**: Test structured data
3. **Facebook Sharing Debugger**: Test OpenGraph tags
4. **Twitter Card Validator**: Test Twitter cards
5. **Lighthouse**: Test performance and SEO score

### Manual Tests:
```bash
# Check meta tags in browser console
document.querySelector('meta[property="og:title"]').content

# View structured data
JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)
```

## 📱 Social Media Sharing

All pages are optimized for sharing on:
- Facebook
- WhatsApp
- LinkedIn
- Twitter
- Telegram

Each ad detail page will show:
- Ad title
- Ad description (first 150 chars)
- Ad image
- Proper preview card

## 🎯 Best Practices

### For New Pages:
1. Import and use `<SEO />` component
2. Add appropriate structured data if needed
3. Ensure unique title and description
4. Use descriptive, keyword-rich content

### For Ad Titles/Descriptions:
- Keep titles under 60 characters
- Write clear, descriptive titles
- Include relevant keywords naturally
- Add location when relevant

### For Images:
- Use descriptive alt text
- Optimize file sizes
- Use proper dimensions (recommended: 1200x630 for OG images)

## 📈 Monitoring

Regularly check:
- Google Search Console for indexing issues
- Page load speeds (use Lighthouse)
- Mobile usability
- Core Web Vitals
- Click-through rates from search results

## 🔄 Maintenance

### Weekly:
- Check for crawl errors in Search Console
- Monitor search rankings

### Monthly:
- Update sitemap (automated with backend)
- Review and update keywords based on search trends
- Analyze top-performing pages

### Quarterly:
- Full SEO audit
- Update structured data if schema.org updates
- Review competitor SEO strategies

## 📞 Support

For SEO questions or issues, refer to:
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org)
- [OpenGraph Protocol](https://ogp.me)
