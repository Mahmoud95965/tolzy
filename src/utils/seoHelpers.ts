// SEO Helper Functions for Dynamic Pages

export interface ToolSEO {
  title: string;
  description: string;
  keywords: string;
  structuredData: object;
}

/**
 * Generate SEO data for a tool page
 */
export const generateToolSEO = (tool: any): ToolSEO => {
  const title = `${tool.name} - أداة ${tool.category} | Tolzy`;
  const description = `${tool.description} - ${tool.longDescription?.substring(0, 150) || tool.description}. تقييم: ${tool.rating}/5 من ${tool.reviewCount} مراجعة. ${tool.pricing === 'Free' ? 'مجاني تماماً' : tool.pricing === 'Freemium' ? 'نسخة مجانية متاحة' : 'مدفوع'}.`;
  
  const keywords = [
    tool.name,
    ...tool.tags,
    tool.category,
    'أداة ذكاء اصطناعي',
    'AI tool',
    tool.pricing === 'Free' ? 'مجاني' : '',
    'tolzy',
    'أدوات AI'
  ].filter(Boolean).join(', ');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.description,
    "applicationCategory": tool.category,
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": tool.pricing === 'Free' ? "0" : tool.pricing === 'Freemium' ? "0" : "10",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": tool.rating,
      "reviewCount": tool.reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    },
    "url": tool.url,
    "image": tool.imageUrl,
    "featureList": tool.features?.join(', ') || '',
    "softwareVersion": "Latest",
    "author": {
      "@type": "Organization",
      "name": "Tolzy"
    }
  };

  return { title, description, keywords, structuredData };
};

/**
 * Generate SEO data for category pages
 */
export const generateCategorySEO = (category: string, toolCount: number) => {
  const categoryNames: Record<string, string> = {
    'Writing': 'الكتابة',
    'Design': 'التصميم',
    'Programming': 'البرمجة',
    'Research': 'البحث العلمي',
    'Productivity': 'الإنتاجية',
    'Language Learning': 'تعلم اللغات',
    'Studying': 'الدراسة',
    'Teaching': 'التدريس',
    'Test Prep': 'التحضير للاختبارات',
    'Education': 'التعليم',
    'Business': 'الأعمال',
    'Data Science': 'علم البيانات',
    'Creativity': 'الإبداع',
    'Communication': 'التواصل',
    'Collaboration': 'التعاون',
    'Project Management': 'إدارة المشاريع',
    'Automation': 'الأتمتة',
    '3D': 'النمذجة ثلاثية الأبعاد',
    'Video': 'الفيديو',
    'Math': 'الرياضيات',
    'Science': 'العلوم',
    'Reading': 'القراءة',
    'Memory': 'الذاكرة',
    'Games': 'الألعاب',
    'Gamification': 'اللعب التعليمي',
    'Lifestyle': 'نمط الحياة',
    'Technology': 'التكنولوجيا',
    'Electronics': 'الإلكترونيات',
    'Freelancing': 'العمل الحر',
    'Library': 'المكتبة',
    'Online Learning': 'التعلم عبر الإنترنت',
    'Other': 'أخرى'
  };

  const arabicCategory = categoryNames[category] || category;
  
  const title = `أفضل ${toolCount}+ أداة ${arabicCategory} بالذكاء الاصطناعي 2025 | Tolzy`;
  const description = `اكتشف أفضل ${toolCount} أداة ${arabicCategory} مدعومة بالذكاء الاصطناعي. أدوات مجانية ومدفوعة للطلاب والمحترفين. مراجعات وتقييمات حقيقية. ابدأ الآن مجاناً!`;
  const keywords = `أدوات ${arabicCategory}, ${category} tools, AI ${arabicCategory}, أدوات ذكاء اصطناعي ${arabicCategory}, أدوات مجانية ${arabicCategory}, tolzy, أدوات AI 2025`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "url": `https://www.tolzy.me/tools?category=${category}`,
    "numberOfItems": toolCount,
    "about": {
      "@type": "Thing",
      "name": arabicCategory
    }
  };

  return { title, description, keywords, structuredData };
};

/**
 * Generate breadcrumb structured data
 */
export const generateBreadcrumbData = (items: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

/**
 * Generate FAQ structured data
 */
export const generateFAQData = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

/**
 * Generate Organization structured data
 */
export const generateOrganizationData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Tolzy",
    "alternateName": ["Tolzy Tools", "أدوات تولزي"],
    "url": "https://tolzy.vercel.app",
    "logo": "https://www.tolzy.me/src/Zakerly.png",
    "description": "أفضل منصة عربية لأدوات الذكاء الاصطناعي والأدوات التعليمية المجانية - اكتشف ChatGPT, Gemini, Midjourney وأكثر من 150 أداة",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": ["Arabic", "English"]
    }
  };
};

/**
 * Generate WebPage structured data
 */
export const generateWebPageData = (title: string, description: string, url: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": url,
    "inLanguage": "ar",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Tolzy",
      "url": "https://tolzy.vercel.app"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Tolzy",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.tolzy.me/src/Zakerly.png"
      }
    }
  };
};
