import React from 'react';
import { Sparkles, Calendar, Code, Palette, MessageSquare, Image } from 'lucide-react';

const TolzyComingSoon: React.FC = () => {
  const upcomingTools = [
    { icon: Code, name: 'Tolzy Code', color: 'from-blue-500 to-cyan-500' },
    { icon: Palette, name: 'Tolzy Design', color: 'from-purple-500 to-pink-500' },
    { icon: MessageSquare, name: 'Tolzy Chat', color: 'from-green-500 to-emerald-500' },
    { icon: Image, name: 'Tolzy Image', color: 'from-orange-500 to-red-500' }
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              أدوات Tolzy القادمة
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>الإطلاق: بداية 2026</span>
            </div>
          </div>
        </div>

        {/* Tools Icons */}
        <div className="flex items-center gap-2">
          {upcomingTools.map((tool, index) => (
            <div
              key={index}
              className={`flex items-center justify-center w-10 h-10 bg-gradient-to-br ${tool.color} rounded-lg hover:scale-110 transition-transform`}
              title={tool.name}
            >
              <tool.icon className="h-5 w-5 text-white" />
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold py-2 px-6 rounded-lg transition-all duration-300 hover:scale-105 shadow-md">
          تابع التحديثات
        </button>
      </div>
    </div>
  );
};

export default TolzyComingSoon;
