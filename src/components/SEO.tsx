"use client";
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

  // In Next.js App Router, we should use the Metadata API instead of react-helmet-async.
  // Returning null here prevents the crash caused by missing HelmetProvider.
  // The global metadata is already handled in app/layout.tsx.
  // TODO: Migrate individual page metadata to generateMetadata in page.tsx files.

  return null;
}
