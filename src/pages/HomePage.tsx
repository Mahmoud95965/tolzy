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
        title="Tolzy - أفضل أدوات الذكاء الاصطناعي والتعليمية المجانية 2025"
        description="اكتشف أكثر من 150+ أداة ذكاء اصطناعي مجانية ومدفوعة. ChatGPT, Google Gemini, Midjourney, DALL-E, Claude, Copilot. أدوات تعليمية للطلاب والمعلمين. أدوات الكتابة، التصميم، البرمجة، البحث العلمي. ابدأ مجاناً!"
        keywords="tolzy, أدوات ذكاء اصطناعي, AI tools, ChatGPT, Google Gemini, Claude AI, Midjourney, DALL-E, أدوات تعليمية مجانية, أدوات للطلاب, أدوات البرمجة, تصميم بالذكاء الاصطناعي, أدوات الكتابة, أدوات البحث العلمي, أدوات الإنتاجية, تعلم اللغات, أدوات مجانية, free AI tools, educational tools, AI للطلاب, AI للمعلمين, أفضل أدوات AI 2025"
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
