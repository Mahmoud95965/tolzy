"use client";
import React from 'react';
import PageLayout from '../components/layout/PageLayout';

import Hero from '../components/home/Hero';
import LoggedInHome from '../components/home/LoggedInHome'; // New dashboard component
import PopularToolsSection from '../components/home/PopularToolsSection';
import AIToolCategories from '../components/home/AIToolCategories';
import CallToAction from '../components/home/CallToAction';
import { useTools } from '../hooks/useTools';
import { useAuth } from '../context/AuthContext'; // Import Auth Context
import { Loader } from 'lucide-react';
import SEO from '../components/SEO';

const HomePage: React.FC = () => {
  const { isLoading, error, featuredTools, newTools } = useTools();
  const { user } = useAuth(); // Get auth state

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

  // If user is logged in, show the personalized dashboard
  if (user) {
    return (
      <PageLayout>
        <SEO
          title="Tolzy - لوحة التحكم"
          description="لوحة التحكم الخاصة بك في Tolzy. استكشف أحدث الأدوات والأخبار."
          keywords="tolzy, dashboard, tools, news"
          url="/"
        />
        <LoggedInHome />
      </PageLayout>
    );
  }

  // Default Landing Page for Guests
  return (
    <PageLayout>
      <SEO
        title="Tolzy - المنصة الرئيسية لأدوات الذكاء الاصطناعي | 400+ أداة وكورس مجاني"
        description="Tolzy - المنصة الرئيسية لدليل أدوات الذكاء الاصطناعي. اكتشف أكثر من 400 أداة احترافية (ChatGPT, Gemini, Claude, Midjourney). منتجات Tolzy الإضافية: Tolzy Learn (كورسات برمجة مجانية)، Tolzy Stack (مشاريع GitHub مفتوحة المصدر). أدوات للطلاب، الباحثين، المبرمجين، والمصممين. من إنتاج Tolzy. ابدأ مجاناً!"
        keywords="tolzy, تولزي, tolzy tools, tolzy learn, tolzy stack, منصة تولزي, أدوات ذكاء اصطناعي, AI tools 2025, ChatGPT 4, Google Gemini Pro, Claude 3 Opus, Midjourney v6, DALL-E 3, كورسات برمجة مجانية, تعلم الذكاء الاصطناعي, مشاريع GitHub, أدوات البحث العلمي, Consensus, Elicit, أدوات الكتابة, Jasper, Copy.ai, Grammarly, أدوات التصميم, Canva AI, Leonardo.ai, أدوات البرمجة, GitHub Copilot, Cursor IDE, أدوات الفيديو, Runway, HeyGen, أدوات الإنتاجية, Notion AI, أدوات الطلاب, حل الواجبات بالذكاء الاصطناعي, تلخيص الملفات, أفضل مواقع الذكاء الاصطناعي, دليل أدوات AI, تطبيقات ذكاء اصطناعي, Prompt Engineering, فري لانسر, العمل الحر, الربح من الذكاء الاصطناعي, منصات تعليمية عربية, تعلم البرمجة, دورات تفاعلية"
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
