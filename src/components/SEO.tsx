import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  structuredData?: object;
}

// Get current domain dynamically
const getCurrentDomain = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://tolzy.me';
};

export default function SEO({
  title = 'Tolzy - أفضل أدوات الذكاء الاصطناعي والتعليمية المجانية 2025',
  description = 'Tolzy - المنصة الرئيسية لأدوات الذكاء الاصطناعي. اكتشف دليلنا الشامل لأكثر من 400 أداة (ChatGPT, Gemini, Claude, Midjourney). منتجات إضافية: Tolzy Learn (كورسات تعليمية مجانية)، Tolzy Stack (مشاريع GitHub مفتوحة المصدر). محتوى عربي عالي الجودة من إنتاج Tolzy. ابدأ مجاناً!',
  keywords = 'tolzy, تولزي, Tolzy Tools, Tolzy Learn, Tolzy Stack, منصة تولزي, أدوات ذكاء اصطناعي, AI tools, ChatGPT, Google Gemini, Claude AI, Midjourney, DALL-E, Stable Diffusion, أدوات تعليمية مجانية, كورسات برمجة, مشاريع GitHub, أدوات للطلاب, أدوات البرمجة, GitHub Copilot, تصميم بالذكاء الاصطناعي, Canva AI, أدوات الكتابة, Grammarly, QuillBot, Jasper AI, Copy.ai, أدوات البحث العلمي, Consensus, Elicit, أدوات الإنتاجية, Notion AI, تعلم اللغات, Duolingo, Khan Academy, Coursera, أدوات مجانية, free AI tools, educational tools, learning tools, productivity tools, AI للطلاب, AI للمعلمين, أدوات الذكاء الاصطناعي العربية, أفضل أدوات AI 2025, منصات تعليمية عربية',
  image = '/src/Zakerly.png',
  url = '',
  type = 'website',
  noindex = false,
  structuredData,
}: SEOProps) {
  const currentDomain = getCurrentDomain();
  const siteName = 'Tolzy';

  // Build full title with site name
  const fullTitle = title.includes('Tolzy')
    ? title
    : `${title} | ${siteName}`;

  // Build full URL
  const fullUrl = url.startsWith('http') ? url : `${currentDomain}${url}`;

  // Build full image URL
  const fullImage = image.startsWith('http') ? image : `${currentDomain}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Robots Meta Tag */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <meta name="bingbot" content={noindex ? "noindex, nofollow" : "index, follow"} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Alternate URLs */}
      <link rel="alternate" href={fullUrl} hrefLang="ar" />
      <link rel="alternate" href={fullUrl} hrefLang="x-default" />

      {/* Open Graph / Facebook Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:secure_url" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content="ar_AR" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@tolzytools" />
      <meta name="twitter:creator" content="@tolzytools" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={title} />

      {/* Additional SEO Tags */}
      <meta name="author" content={siteName} />
      <meta name="language" content="Arabic" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
