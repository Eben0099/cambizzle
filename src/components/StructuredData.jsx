import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG, getFullUrl, getOgImage } from '../config/seo';

/**
 * Structured Data Component for SEO
 * Adds JSON-LD structured data to pages for better search engine understanding
 */

// Organization Schema for Home Page
export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SEO_CONFIG.organization.name,
    "url": SEO_CONFIG.siteUrl,
    "logo": SEO_CONFIG.logoImage,
    "description": SEO_CONFIG.defaultDescription,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": SEO_CONFIG.organization.address.country
    },
    "sameAs": [
      SEO_CONFIG.social.facebook,
      SEO_CONFIG.social.twitter,
      SEO_CONFIG.social.instagram
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Product Schema for Ad Detail Page
export const ProductSchema = ({ ad }) => {
  if (!ad) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": ad.title,
    "description": ad.description,
    "image": getOgImage(ad.photos?.[0]?.url || ad.photos?.[0]?.originalUrl),
    "offers": {
      "@type": "Offer",
      "price": ad.price,
      "priceCurrency": "XAF",
      "availability": ad.status === 'active' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": ad.condition === 'new' ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
      "url": getFullUrl(`/ad/${ad.slug}`)
    },
    "brand": ad.brand?.name ? {
      "@type": "Brand",
      "name": ad.brand.name
    } : undefined,
    "category": ad.category?.name,
    "seller": {
      "@type": "Person",
      "name": `${ad.user?.firstName || ''} ${ad.user?.lastName || ''}`.trim()
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Breadcrumb Schema
export const BreadcrumbSchema = ({ items }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": getFullUrl(item.url)
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Search Results Schema
export const SearchResultsSchema = ({ query, numberOfResults }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "name": `Search results for "${query}"`,
    "url": getFullUrl(`/search?q=${encodeURIComponent(query)}`),
    "about": {
      "@type": "Thing",
      "name": query
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": numberOfResults
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Website Schema
export const WebsiteSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SEO_CONFIG.siteName,
    "url": SEO_CONFIG.siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": getFullUrl("/search?q={search_term_string}")
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default {
  OrganizationSchema,
  ProductSchema,
  BreadcrumbSchema,
  SearchResultsSchema,
  WebsiteSchema
};
