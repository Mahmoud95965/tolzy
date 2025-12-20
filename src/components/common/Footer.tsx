import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Instagram, 
  Linkedin, 
  Heart,
  Facebook,
  BrainCircuit,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [isNavigationOpen, setIsNavigationOpen] = React.useState(false);
  const [isSupportOpen, setIsSupportOpen] = React.useState(false);

  const socialLinks = [
    { icon: X, href: 'https://x.com/tolzyofficial', label: 'X' },
    { icon: Instagram, href: 'https://www.facebook.com/tolzyai', label: 'Instagram' },
    { icon: Linkedin, href: 'www.linkedin.com/in/mahmoud-founder-tolzy', label: 'LinkedIn' },
    { icon: Facebook, href: 'https://www.facebook.com/tolzyai', label: 'Facebook' }
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white border-t border-slate-700/50">
      <div className="max-w-7xl mx-auto pt-16 pb-8 px-4 sm:px-6 lg:pt-20 lg:pb-12 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-6 sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-4 group w-fit">
              <div className="relative">
                {/* Animated rings */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 opacity-20 group-hover:opacity-40 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 opacity-10 group-hover:opacity-30 animate-ping"></div>
                
                {/* Logo container */}
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 p-0.5 shadow-2xl shadow-slate-500/30 group-hover:shadow-slate-500/50 transition-all duration-500">
                  <div className="w-full h-full rounded-2xl bg-slate-900 p-3 flex items-center justify-center overflow-hidden">
                    <img 
                      src="/image/tools/Logo.png" 
                      alt="Tolzy Logo" 
                      className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center">
                      <BrainCircuit className="w-10 h-10 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Brand name */}
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 transition-all duration-300 group-hover:tracking-wider">
                  Tolzy
                </span>
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors font-medium">
                  AI Tools Platform
                </span>
              </div>
            </Link>
            <p className="text-slate-300 text-base leading-relaxed max-w-md">
              {t('footer.about')}
            </p>
            <div className="flex items-center gap-3 rtl:space-x-reverse">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-lg hover:shadow-xl"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <button 
              onClick={() => setIsNavigationOpen(!isNavigationOpen)}
              className="w-full flex items-center justify-between text-sm font-bold text-slate-200 tracking-wider uppercase mb-6 lg:cursor-default"
            >
              <span>{t('footer.navigation')}</span>
              <span className="lg:hidden">
                {isNavigationOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </span>
            </button>
            <ul className={`space-y-4 overflow-hidden transition-all duration-300 lg:block ${isNavigationOpen ? 'block' : 'hidden'}`}>
              {[
                { to: '/', label: t('nav.home') },
                { to: '/tools', label: t('nav.tools') },
                { to: '/projects', label: 'مشاريعنا' },
                { to: '/about', label: t('nav.about') }
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to}
                    className="text-slate-400 hover:text-white transition-all duration-300 flex items-center group font-medium"
                  >
                    <span className="relative group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-transform">
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-400 group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <button 
              onClick={() => setIsSupportOpen(!isSupportOpen)}
              className="w-full flex items-center justify-between text-sm font-bold text-slate-200 tracking-wider uppercase mb-6 lg:cursor-default"
            >
              <span>{t('footer.support')}</span>
              <span className="lg:hidden">
                {isSupportOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </span>
            </button>
            <ul className={`space-y-4 overflow-hidden transition-all duration-300 lg:block ${isSupportOpen ? 'block' : 'hidden'}`}>
              {[
                { to: '/updates', label: 'التحديثات' },
                { to: '/faq', label: t('nav.faq') },
                { to: '/contact', label: t('nav.contact') },
                { to: '/privacy-policy', label: t('nav.privacy') },
                { to: '/terms', label: t('nav.terms') }
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to}
                    className="text-slate-400 hover:text-white transition-all duration-300 flex items-center group font-medium"
                  >
                    <span className="relative group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-transform">
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-400 group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-slate-400 text-sm text-center sm:text-start order-2 sm:order-1 font-medium">
              {t('footer.allRightsReserved')} لدي شركة Tolzy {currentYear} ©.
            </p>
            <div className="flex items-center gap-2 text-slate-400 text-sm whitespace-nowrap order-3 font-medium">
              <span>{t('footer.madeWith')}</span>
              <Heart className="h-4 w-4 text-red-500 animate-pulse fill-current" />
              <span>{t('footer.inEgypt')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
