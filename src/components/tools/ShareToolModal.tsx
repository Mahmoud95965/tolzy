import React, { useState } from 'react';
import { X, Link as LinkIcon, Twitter, Facebook, MessageCircle, Copy, Check } from 'lucide-react';
import { Tool } from '../../types';

interface ShareToolModalProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
}

const ShareToolModal: React.FC<ShareToolModalProps> = ({ tool, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Handle closing modal with Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shareUrl = window.location.href;
  const shareTitle = `اكتشف ${tool.name} - أداة ذكاء اصطناعي قوية لتطوير تعليمك وإنتاجيتك 🚀`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareButtons = [
    {
      name: 'نسخ الرابط',
      icon: copied ? Check : Copy,
      onClick: handleCopyLink,
      className: copied 
        ? 'bg-green-100 hover:bg-green-200 dark:bg-green-800/50 dark:hover:bg-green-700/50 text-green-800 dark:text-green-200'
        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
    },
    {
      name: 'تويتر',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      className: 'bg-sky-500 hover:bg-sky-600 text-white'
    },
    {
      name: 'فيسبوك',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      className: 'bg-blue-600 hover:bg-blue-700 text-white'
    },    {
      name: 'واتساب',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(shareTitle + '\n' + shareUrl)}`,
      className: 'bg-green-500 hover:bg-green-600 text-white'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-40" 
          onClick={onClose}
          aria-hidden="true"
        />
        
        <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 
              id="modal-title"
              className="text-lg font-medium text-gray-900 dark:text-white"
            >
              مشاركة الأداة
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <LinkIcon className="h-5 w-5 text-gray-400" />
              <div className="flex-1 text-sm text-gray-600 dark:text-gray-300 truncate" dir="ltr">
                {shareUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  copied
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300'
                }`}
                aria-label={copied ? 'تم نسخ الرابط' : 'نسخ الرابط'}
              >
                {copied ? 'تم النسخ!' : 'نسخ'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {shareButtons.map((button) => (
                button.href ? (
                  <a
                    key={button.name}
                    href={button.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors ${button.className}`}
                    aria-label={`مشاركة على ${button.name}`}
                  >
                    <button.icon className="h-5 w-5 ml-2" />
                    {button.name}
                  </a>
                ) : (
                  <button
                    key={button.name}
                    onClick={button.onClick}
                    className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors ${button.className}`}
                    aria-label={button.name}
                  >
                    <button.icon className="h-5 w-5 ml-2" />
                    {button.name}
                  </button>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareToolModal;