import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 dark:from-indigo-900 dark:via-indigo-800 dark:to-blue-900 overflow-hidden min-h-[85vh]">
      {/* Background decoration - larger circles for better effect */}
      <div className="absolute inset-0 opacity-20 dark:opacity-30">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-indigo-400 dark:bg-indigo-500 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-400 dark:bg-blue-500 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-400 dark:bg-purple-500 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center">
          {/* Top badge */}
          <div className="inline-flex items-center justify-center mb-8 px-6 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="text-white font-medium text-sm">انضم إلى 350,000+ من المطورين والمحترفين</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6">
            كل ما يحتاجه عملك<br />
            <span className="block mt-2">لإتقان أحدث التقنيات، كل شيء في مكان واحد.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-white/90 leading-relaxed">
            استكشف أفضل الأدوات التقنية وتعلم كيفية استخدامها بفعالية.
          </p>

          {/* CTA Button */}
          <div className="mt-10 flex items-center justify-center">
            <Link
              to="/tools"
              className="bg-white hover:bg-gray-100 transition-colors text-indigo-700 px-8 py-4 rounded-lg text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              انضم مجاناً
            </Link>
          </div>

          {/* Trusted by section */}
          <div className="mt-20">
            <p className="text-white/60 text-sm font-medium tracking-wider uppercase mb-8">
              موثوق به من قبل
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-80">
              {/* Tolvix */}
              <div className="text-white font-bold text-xl tracking-wide">
                Tolvix
              </div>
              {/* Neurovia */}
              <div className="text-white font-bold text-xl tracking-wide">
                Neurovia
              </div>
              {/* Mindora */}
              <div className="text-white font-bold text-xl tracking-wide">
                Mindora
              </div>
              {/* Datavix */}
              <div className="text-white font-bold text-xl tracking-wide">
                Datavix
              </div>
              {/* Flowtica */}
              <div className="text-white font-bold text-xl tracking-wide">
                Flowtica
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;