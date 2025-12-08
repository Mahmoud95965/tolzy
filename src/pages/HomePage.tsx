import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import Hero from '../components/home/Hero';
import PopularToolsSection from '../components/home/PopularToolsSection';
import AIToolCategories from '../components/home/AIToolCategories';
import CallToAction from '../components/home/CallToAction';
import { useTools } from '../hooks/useTools';
import { Loader } from 'lucide-react';
import SEO from '../components/SEO';

const HomePage: React.FC = () => {
  const { isLoading, error, featuredTools, newTools } = useTools();

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO
        title="Tolzy - المنصة العربية الأولى لأدوات الذكاء الاصطناعي والتعليم | +200 أداة وكورس مجاني"
        description="اكتشف أقوى منصة عربية لأدوات الذكاء الاصطناعي. دليل شامل لأكثر من 200 أداة (ChatGPT, Gemini, Claude, Midjourney). كورسات تعليمية مجانية في البرمجة والذكاء الاصطناعي. أدوات للطلاب، الباحثين، المبرمجين، والمصممين. مقارنات حقيقية، تقييمات موثوقة، وتحديثات يومية. ابدأ رحلة التعلم والإنتاجية مع Tolzy الآن مجاناً!"
        keywords="tolzy, تولزي, أدوات ذكاء اصطناعي, AI tools 2025, ChatGPT 4, Google Gemini Pro, Claude 3 Opus, Midjourney v6, DALL-E 3, Stable Diffusion, أدوات تعليمية مجانية, كورسات برمجة مجانية, تعلم الذكاء الاصطناعي, أدوات البحث العلمي, Consensus, Elicit, SciSpace, أدوات الكتابة, Jasper, Copy.ai, Grammarly, أدوات التصميم, Canva AI, Leonardo.ai, أدوات البرمجة, GitHub Copilot, Cursor IDE, أدوات الفيديو, Runway, HeyGen, Sora, أدوات الإنتاجية, Notion AI, أدوات الطلاب, حل الواجبات بالذكاء الاصطناعي, تلخيص الملفات, تحويل النص إلى كلام, تحويل الكلام إلى نص, أفضل مواقع الذكاء الاصطناعي, دليل أدوات AI, تطبيقات ذكاء اصطناعي للأندرويد والايفون, تعلم الآلة, علم البيانات, هندسة الأوامر, Prompt Engineering, فري لانسر, العمل الحر, الربح من الذكاء الاصطناعي"
        url="/"
      />
      <Hero />

      <PopularToolsSection
        popularTools={featuredTools}
        newTools={newTools}
      />

      <AIToolCategories />

      <CallToAction />
    </PageLayout>
  );
};

export default HomePage;
