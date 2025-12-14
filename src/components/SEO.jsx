import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG, getOgImage, formatTitle, formatDescription, getFullUrl } from '../config/seo';

const SEO = ({
  title,
  description,
  image,
  url = '',
  type = 'website',
  keywords,
  author = SEO_CONFIG.siteName
}) => {
  const pageTitle = formatTitle(title);
  const pageDescription = formatDescription(description);
  const pageImage = getOgImage(image);
  const fullUrl = getFullUrl(url);
  const pageKeywords = keywords || SEO_CONFIG.defaultKeywords;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={fullUrl} />

      {/* OpenGraph / Facebook / WhatsApp / LinkedIn */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:locale" content={SEO_CONFIG.locale} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      <meta name="twitter:site" content={SEO_CONFIG.social.twitterHandle} />
      <meta name="twitter:creator" content={SEO_CONFIG.social.twitterHandle} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="theme-color" content={SEO_CONFIG.themeColor} />
    </Helmet>
  );
};

export default SEO;
