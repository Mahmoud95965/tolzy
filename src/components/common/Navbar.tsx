import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Menu,
  X,
  Moon,
  Sun,
  CircleUserRound,
  BrainCircuit,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import SearchAutocomplete from './SearchAutocomplete';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import UserProfile from '../auth/UserProfile';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();

  // Detect scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  // Close search on ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isSearchOpen]);

  const categories = [
    { name: 'الكتابة', icon: '✍️', path: '/tools?category=Writing' },
    { name: 'التصميم', icon: '🎨', path: '/tools?category=Design' },
    { name: 'البرمجة', icon: '💻', path: '/tools?category=Programming' },
    { name: 'الفيديو', icon: '🎬', path: '/tools?category=Video' },
    { name: 'الإنتاجية', icon: '⚡', path: '/tools?category=Productivity' },
    { name: 'البحث', icon: '🔬', path: '/tools?category=Research' }
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl border-b border-slate-200/50 dark:border-slate-700/50'
        : 'bg-white dark:bg-slate-900 shadow-md border-b border-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">          <Link to="/" className="flex-shrink-0 flex items-center group">
          <div className="relative">
            <img
              src="/image/tools/Hero.png"
              alt="Tolzy Logo"
              className="h-10 w-auto transition-all duration-300 group-hover:scale-110"
              onError={(e) => {
                // Fallback to icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <div className="hidden">
              <BrainCircuit className="h-8 w-8 text-indigo-600 dark:text-indigo-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            </div>
            <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          {/* <span className="hidden md:inline-block mr-2 text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold animate-pulse">AI</span> */}
        </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:justify-center flex-1">
            <div className="flex space-x-8 space-x-reverse">
              <Link
                to="/"
                className="group relative text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center px-3 py-2 text-sm font-semibold transition-all duration-300"
              >
                <span className="relative">
                  {t('nav.home')}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-slate-700 to-slate-600 dark:from-slate-400 dark:to-slate-500 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>

              {/* Categories Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsCategoriesOpen(true)}
                onMouseLeave={() => setIsCategoriesOpen(false)}
              >
                <button
                  className="group relative text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold transition-all duration-300"
                  aria-expanded={isCategoriesOpen}
                  aria-haspopup="true"
                >
                  <Zap className="w-4 h-4" />
                  <span className="relative">
                    {t('nav.tools')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-slate-700 to-slate-600 dark:from-slate-400 dark:to-slate-500 group-hover:w-full transition-all duration-300"></span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu - Only shows on hover */}
                <div
                  className={`absolute top-full left-0 mt-2 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 ${isCategoriesOpen
                      ? 'opacity-100 visible translate-y-0 scale-100'
                      : 'opacity-0 invisible -translate-y-4 scale-95 pointer-events-none'
                    }`}
                >
                  <div className="p-2">
                    <Link
                      to="/tools"
                      onClick={() => setIsCategoriesOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 group"
                    >
                      <TrendingUp className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <span>جميع الأدوات</span>
                    </Link>
                    <div className="my-2 border-t border-slate-200 dark:border-slate-700"></div>
                    {categories.map((cat, index) => (
                      <Link
                        key={index}
                        to={cat.path}
                        onClick={() => setIsCategoriesOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all duration-200"
                      >
                        <span className="text-lg">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                to="/news"
                className="group relative text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center px-3 py-2 text-sm font-semibold transition-all duration-300"
              >
                <span className="relative">
                  الأخبار
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-slate-700 to-slate-600 dark:from-slate-400 dark:to-slate-500 group-hover:w-full transition-all duration-300"></span>
                </span>
                <span className="mr-1 flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </Link>

              <Link
                to="/projects"
                className="group relative text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center px-3 py-2 text-sm font-semibold transition-all duration-300"
              >
                <span className="relative">
                  مشاريعنا
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-slate-700 to-slate-600 dark:from-slate-400 dark:to-slate-500 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>

              <Link
                to="/about"
                className="group relative text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center px-3 py-2 text-sm font-semibold transition-all duration-300"
              >
                <span className="relative">
                  {t('nav.about')}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-slate-700 to-slate-600 dark:from-slate-400 dark:to-slate-500 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex sm:items-center sm:ml-6 sm:space-x-4 sm:space-x-reverse">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 transition-all duration-300 hover:scale-110 hover:rotate-12"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={toggleSearch}
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 transition-all duration-300 hover:scale-110"
            >
              <Search className="h-5 w-5" />
            </button>

            {user ? (
              <UserProfile />
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              >
                <CircleUserRound className="ml-2 h-5 w-5" />
                ابدأ الآن
              </Link>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 sm:hidden">
            {!user && (
              <Link
                to="/auth"
                className="inline-flex items-center p-2 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-md"
                aria-label="تسجيل الدخول"
              >
                <CircleUserRound className="h-5 w-5" />
              </Link>
            )}
            <button
              onClick={toggleSearch}
              className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-gray-700 transition-all"
              aria-label="البحث"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/tools"
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                {t('nav.tools')}
              </Link>
              <Link
                to="/news"
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                الأخبار
              </Link>
              <Link
                to="/projects"
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                مشاريعنا
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                {t('nav.about')}
              </Link>
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-5 w-5 ml-2" />
                    الوضع النهاري
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5 ml-2" />
                    الوضع الليلي
                  </>
                )}
              </button>
            </div>
            {user && (
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <UserProfile />
              </div>
            )}
          </div>
        )}

        {/* Search Overlay */}
        {isSearchOpen && (
          <div className="absolute inset-x-0 top-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border-b border-slate-200 dark:border-slate-700 p-6 animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <SearchAutocomplete />
                <button
                  onClick={toggleSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label="إغلاق البحث"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">اضغط ESC للإغلاق</p>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
