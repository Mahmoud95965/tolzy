"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PageLayout from '../components/layout/PageLayout';
import ToolsGrid from '../components/tools/ToolsGrid';
import ToolFilters from '../components/tools/ToolFilters';
import AllCategoriesView from '../components/tools/AllCategoriesView';
import CategoryToolsView from '../components/tools/CategoryToolsView';
import TolzyComingSoon from '../components/tools/TolzyComingSoon';
import { FilterOptions, ToolCategory } from '../types/index';
import { useTools } from '../hooks/useTools';
import { Loader } from 'lucide-react';

const ToolsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const toolsContext = useTools();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Initialize filters from URL parameters
  const categoryParam = searchParams.get('category');
  const pricingParam = searchParams.get('pricing');
  const qParam = searchParams.get('q') || '';

  const [filters, setFilters] = useState<FilterOptions>({
    category: categoryParam as FilterOptions['category'] || 'All',
    pricing: (pricingParam as FilterOptions['pricing']) || 'All',
    searchQuery: qParam
  });

  // Update filters when URL changes
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const pricingParam = searchParams.get('pricing');
    const qParam = searchParams.get('q') || '';

    setFilters({
      category: categoryParam as FilterOptions['category'] || 'All',
      pricing: (pricingParam as FilterOptions['pricing']) || 'All',
      searchQuery: qParam
    });
  }, [searchParams]);

  const filteredTools = toolsContext.filterToolsByOptions(filters);

  // Check if no filters are applied
  const noFiltersApplied = filters.category === 'All' && filters.pricing === 'All' && !filters.searchQuery;

  // Check if only category is selected (no pricing filter or search)
  const onlyCategorySelected = filters.category !== 'All' && filters.pricing === 'All' && !filters.searchQuery;

  return (
    <PageLayout>
      {noFiltersApplied ? (
        // Show all categories view when no filters are applied
        <AllCategoriesView />
      ) : onlyCategorySelected ? (
        // Show category tools view with subcategories when only category is selected
        <CategoryToolsView category={filters.category as ToolCategory} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">جميع أدوات التعليم بالذكاء الاصطناعي</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              استكشف وفرز وابحث عن أدوات التعليم المناسبة لاحتياجاتك
            </p>
          </div>

          <ToolFilters
            filters={filters}
            setFilters={setFilters}
            showMobileFilters={showMobileFilters}
            setShowMobileFilters={setShowMobileFilters}
          />

          {/* Tolzy Coming Soon Section */}
          <div className="mb-8">
            <TolzyComingSoon />
          </div>

          {toolsContext.isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
          ) : toolsContext.error ? (
            <div className="text-center py-20">
              <p className="text-red-600 dark:text-red-400">حدث خطأ أثناء تحميل الأدوات. يرجى المحاولة مرة أخرى.</p>
            </div>
          ) : (
            <ToolsGrid tools={filteredTools} />
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default ToolsPage;