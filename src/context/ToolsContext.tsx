"use client";
import React, { createContext, useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Tool, FilterOptions } from '../types/index';
import { filterTools } from '../utils/filterTools';
import { convertFirestoreDoc } from '../services/tools.service';

interface ToolsContextType {
  tools: Tool[];
  isLoading: boolean;
  error: string | null;
  featuredTools: Tool[];
  popularTools: Tool[];
  newTools: Tool[];
  getToolById: (id: string) => Tool | undefined;
  getRelatedTools: (tool: Tool, limit?: number) => Tool[];
  filterToolsByOptions: (options: FilterOptions) => Tool[];
}

export const ToolsContext = createContext<ToolsContextType | null>(null);

export const ToolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 Starting to load tools from Firebase...');

    let timeoutId: NodeJS.Timeout | null = null;

    // Timeout to ensure not stuck in loading forever
    timeoutId = setTimeout(() => {
      console.warn('⏰ Tools loading timeout reached (30s)');
      setIsLoading(false);
      setError('حدث خطأ أثناء تحميل الأدوات. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
    }, 30000); // 30 seconds timeout

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      collection(db, 'tools'),
      (snapshot) => {
        // Cancel timeout on success
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        console.log(`📦 Received ${snapshot.docs.length} documents from Firestore`);
        const updatedTools = snapshot.docs
          .map(convertFirestoreDoc)
          .sort((a, b) => {
            // Sort by rating and review count
            return (b.rating * b.reviewCount) - (a.rating * a.reviewCount);
          });
        setTools(updatedTools);
        setIsLoading(false);
        setError(null);
        console.log(`✅ Loaded ${updatedTools.length} tools successfully`);
      },
      (err) => {
        // Cancel timeout on error
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        console.error('❌ Error listening to tools updates:', err);
        console.error('Error details:', {
          code: (err as any).code,
          message: err.message,
          name: err.name
        });
        setError('حدث خطأ في تحميل الأدوات. يرجى التحقق من إعدادات Firebase.');
        setIsLoading(false);
      }
    );

    return () => {
      console.log('🧹 Cleaning up tools listener');
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      unsubscribe();
    };
  }, []);

  const featuredTools = tools.filter(tool => tool.isFeatured);

  // Popular tools: by rating, review count, and popularity
  const popularTools = tools
    .filter(tool => tool.status === 'approved')
    .sort((a, b) => {
      // Calculate popularity score: (rating × reviews) + (isPopular × 1000)
      const scoreA = (a.rating * a.reviewCount) + (a.isPopular ? 1000 : 0);
      const scoreB = (b.rating * b.reviewCount) + (b.isPopular ? 1000 : 0);
      return scoreB - scoreA;
    })
    .slice(0, 8);

  // Recently added tools: by actual submission date
  const newTools = tools
    .filter(tool => tool.status === 'approved' && tool.submittedAt)
    .sort((a, b) => {
      const dateA = new Date(a.submittedAt || '').getTime();
      const dateB = new Date(b.submittedAt || '').getTime();
      return dateB - dateA;
    })
    .slice(0, 8);

  const getToolById = (id: string) => {
    const normalizedId = id.toString().padStart(3, '0');
    return tools.find(tool => tool.id === normalizedId);
  };

  const getRelatedTools = (tool: Tool, limit: number = 3) => {
    const toolCategories = Array.isArray(tool.category) ? tool.category : [tool.category];

    return tools
      .filter(t => {
        if (t.id === tool.id) return false;

        const tCategories = Array.isArray(t.category) ? t.category : [t.category];
        const hasCommonCategory = tCategories.some(cat => toolCategories.includes(cat));
        const hasCommonTag = t.tags.some(tag => tool.tags.includes(tag));

        return hasCommonCategory || hasCommonTag;
      })
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  };

  const filterToolsByOptions = (options: FilterOptions) => {
    return filterTools(tools, options);
  };

  const value: ToolsContextType = {
    tools,
    isLoading,
    error,
    featuredTools,
    popularTools,
    newTools,
    getToolById,
    getRelatedTools,
    filterToolsByOptions
  };

  return (
    <ToolsContext.Provider value={value}>
      {children}
    </ToolsContext.Provider>
  );
};
