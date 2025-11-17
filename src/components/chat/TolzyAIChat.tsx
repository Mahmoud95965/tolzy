import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Send, Loader, Brain, Sparkles, Minimize2, Maximize2, Trash2, ExternalLink } from 'lucide-react';
import { tolzyAI, ChatMessage } from '../../services/tolzy-ai.service';
import { chatHistoryService } from '../../services/chat-history.service';
import { useAuth } from '../../context/AuthContext';

const TolzyAIChat: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // إخفاء رسالة الترحيب بعد 10 ثواني أو عند فتح الشات
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeTooltip(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowWelcomeTooltip(false);
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from Firebase when user is authenticated
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) {
        // إذا لم يكن المستخدم مسجل الدخول، استخدم localStorage كبديل
        try {
          const savedHistory = localStorage.getItem('tolzy_ai_chat_history');
          if (savedHistory) {
            const parsedHistory = JSON.parse(savedHistory);
            const messagesWithDates = parsedHistory.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
            setMessages(messagesWithDates);
            console.log('✅ تم تحميل المحادثات من localStorage (غير مسجل الدخول)');
          }
        } catch (error) {
          console.error('❌ خطأ في تحميل المحادثات من localStorage:', error);
        }
        return;
      }

      // تحميل المحادثات من Firebase للمستخدم المسجل
      try {
        const firebaseMessages = await chatHistoryService.getMessages(user.uid);
        if (firebaseMessages.length > 0) {
          setMessages(firebaseMessages);
        }
      } catch (error) {
        console.error('❌ خطأ في تحميل المحادثات من Firebase:', error);
      }
    };

    loadChatHistory();
  }, [user]);

  // Save chat history to Firebase or localStorage
  useEffect(() => {
    if (messages.length === 0) return;

    const saveMessages = async () => {
      if (user) {
        // حفظ في Firebase للمستخدمين المسجلين
        // لا نحفظ كل مرة، فقط عند إضافة رسالة جديدة
        // سيتم الحفظ في handleSendMessage
      } else {
        // حفظ في localStorage للمستخدمين غير المسجلين
        try {
          localStorage.setItem('tolzy_ai_chat_history', JSON.stringify(messages));
          console.log('💾 تم حفظ المحادثة في localStorage');
        } catch (error) {
          console.error('❌ خطأ في حفظ المحادثات:', error);
        }
      }
    };

    saveMessages();
  }, [messages, user]);

  // Initialize Tolzy AI when chat opens (only if no history)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  const initializeChat = async () => {
    setIsInitializing(true);
    try {
      await tolzyAI.initialize();
      
      // تحديث قاعدة بيانات الأدوات عند فتح الشات
      const updateInfo = tolzyAI.getLastUpdateInfo();
      console.log(`📊 Tolzy AI: ${updateInfo.toolsCount} أداة متاحة`);
      if (updateInfo.lastUpdate) {
        console.log(`🕒 آخر تحديث: ${updateInfo.lastUpdate.toLocaleString('ar-EG')}`);
      }
      
      // Welcome message
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `مرحباً! 👋 أنا **Tolzy AI**، مساعدك الذكي في عالم أدوات الذكاء الاصطناعي.

🎯 **كيف يمكنني مساعدتك؟**

يمكنني:
✨ اقتراح أفضل الأدوات لاحتياجاتك
🔍 البحث عن أدوات محددة
💡 شرح مميزات أي أداة
⚖️ المقارنة بين الأدوات المختلفة

**جرّب سؤالي:**
- "ما هي أفضل أداة لكتابة المحتوى؟"
- "أريد أداة مجانية للتصميم"
- "أدوات لتحسين الإنتاجية"

📊 لدي معلومات عن **${updateInfo.toolsCount}** أداة محدثة!`,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // حفظ رسالة المستخدم في Firebase
    if (user) {
      try {
        await chatHistoryService.saveMessage(user.uid, userMessage);
      } catch (error) {
        console.error('خطأ في حفظ رسالة المستخدم:', error);
      }
    }

    try {
      const response = await tolzyAI.chat(inputMessage, messages);
      
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // حفظ رد الـ AI في Firebase
      if (user) {
        try {
          await chatHistoryService.saveMessage(user.uid, aiMessage);
        } catch (error) {
          console.error('خطأ في حفظ رد AI:', error);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // دالة لتحويل النصوص إلى روابط قابلة للنقر
  const renderMessageContent = (content: string) => {
    // البحث عن روابط الأدوات في النص (مثل: /tools/123 أو https://www.tolzy.me/tools/123)
    const toolLinkRegex = /(?:https?:\/\/[^\s]+)?\/tools\/([a-zA-Z0-9-]+)/g;
    // البحث عن روابط خارجية
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let toolMatch: RegExpExecArray | null;
    let urlMatch: RegExpExecArray | null;

    // معالجة روابط الأدوات أولاً
    const tempContent = content;
    const toolMatches: Array<{ index: number; length: number; toolId: string; fullMatch: string }> = [];
    
    while ((toolMatch = toolLinkRegex.exec(tempContent)) !== null) {
      toolMatches.push({
        index: toolMatch.index,
        length: toolMatch[0].length,
        toolId: toolMatch[1],
        fullMatch: toolMatch[0]
      });
    }

    // معالجة روابط خارجية
    const urlMatches: Array<{ index: number; length: number; url: string }> = [];
    urlRegex.lastIndex = 0;
    
    while ((urlMatch = urlRegex.exec(tempContent)) !== null) {
      // تجاهل الروابط التي هي جزء من روابط الأدوات
      const isToolLink = toolMatches.some(tm => 
        urlMatch!.index >= tm.index && urlMatch!.index < tm.index + tm.length
      );
      
      if (!isToolLink) {
        urlMatches.push({
          index: urlMatch.index,
          length: urlMatch[0].length,
          url: urlMatch[0]
        });
      }
    }

    // دمج جميع المطابقات وترتيبها
    const allMatches = [
      ...toolMatches.map(m => ({ ...m, type: 'tool' as const })),
      ...urlMatches.map(m => ({ ...m, type: 'url' as const }))
    ].sort((a, b) => a.index - b.index);

    // بناء المحتوى النهائي
    allMatches.forEach((match, i) => {
      // إضافة النص قبل الرابط
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${i}`}>
            {tempContent.substring(lastIndex, match.index)}
          </span>
        );
      }

      // إضافة الرابط
      if (match.type === 'tool') {
        const toolMatch = match as typeof toolMatches[0] & { type: 'tool' };
        parts.push(
          <Link
            key={`tool-${i}`}
            to={`/tools/${toolMatch.toolId}`}
            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium"
            onClick={() => setIsOpen(false)}
          >
            <span>عرض الأداة</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        );
      } else {
        const urlMatch = match as typeof urlMatches[0] & { type: 'url' };
        parts.push(
          <a
            key={`url-${i}`}
            href={urlMatch.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            <span>{urlMatch.url}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      }

      lastIndex = match.index + match.length;
    });

    // إضافة النص المتبقي
    if (lastIndex < tempContent.length) {
      parts.push(
        <span key="text-end">
          {tempContent.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : content;
  };

  const handleClearHistory = async () => {
    if (!window.confirm('هل أنت متأكد من حذف جميع المحادثات؟')) return;

    try {
      if (user) {
        // حذف من Firebase
        await chatHistoryService.clearMessages(user.uid);
      } else {
        // حذف من localStorage
        localStorage.removeItem('tolzy_ai_chat_history');
      }
      
      setMessages([]);
      console.log('🗑️ تم مسح المحادثات');
      
      // Re-initialize with welcome message
      initializeChat();
    } catch (error) {
      console.error('خطأ في مسح المحادثات:', error);
      alert('حدث خطأ أثناء مسح المحادثات');
    }
  };

  if (!isOpen) {
    return (
      <>
        {/* Welcome Tooltip */}
        {showWelcomeTooltip && (
          <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 animate-fade-in">
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setShowWelcomeTooltip(false)}
                className="absolute -top-2 -left-2 w-6 h-6 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-10"
                aria-label="Close welcome message"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Welcome Card */}
              <div className="relative bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border-2 border-blue-200 dark:border-blue-800 p-5 max-w-xs sm:max-w-sm overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-2xl animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-indigo-400 to-pink-400 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                {/* Content */}
                <div className="relative">
                  {/* Header with Icon */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
                        Tolzy AI
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                      </h3>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">مساعدك الشخصي</p>
                    </div>
                  </div>

                  {/* Message */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-right">
                    مرحباً بك! معك <span className="font-bold text-blue-600 dark:text-blue-400">Tolzy AI</span> مساعدك الشخصي في هذا العالم 🌟
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>اكتشف أفضل الأدوات</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                      <span>احصل على توصيات ذكية</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <span>إجابات فورية على أسئلتك</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => setIsOpen(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>ابدأ المحادثة</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>

                {/* Arrow pointing to chat button */}
                <div className="absolute -bottom-2 right-8 w-4 h-4 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 border-r-2 border-b-2 border-blue-200 dark:border-blue-800 transform rotate-45"></div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Button with Label */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          {/* Label Strip - Mobile Only */}
          <div className="sm:hidden flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 animate-slide-in-right mb-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Tolzy AI</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">مساعدك الشخصي</span>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>

          {/* Desktop: Button with Label Side by Side */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Label Strip */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 animate-slide-in-right">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-gray-900 dark:text-white">Tolzy AI</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">مساعدك الشخصي</span>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>

            {/* Chat Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 group"
              aria-label="Open Tolzy AI Chat"
            >
              <div className="relative">
                <Brain className="h-6 w-6" />
                <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
              </div>
            </button>
          </div>

          {/* Mobile: Button Only */}
          <button
            onClick={() => setIsOpen(true)}
            className="sm:hidden bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-full p-3 shadow-2xl transition-all duration-300 hover:scale-110 group"
            aria-label="Open Tolzy AI Chat"
          >
            <div className="relative">
              <Brain className="h-5 w-5" />
              <Sparkles className="h-2.5 w-2.5 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            </div>
          </button>
        </div>
      </>
    );
  }

  return (
    <div 
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized 
          ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-72 sm:w-80 h-16' 
          : 'inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[600px] sm:max-h-[80vh]'
      }`}
    >
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-white font-bold text-base sm:text-lg flex items-center gap-1">
                Tolzy AI
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs hidden sm:block">مساعدك الشخصي</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleClearHistory}
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 sm:p-2 rounded-lg transition-colors"
              aria-label="Clear chat history"
              title="مسح المحادثات"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 sm:p-2 rounded-lg transition-colors hidden sm:block"
              aria-label={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 sm:p-2 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              {isInitializing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">جاري التحميل...</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                              <Brain className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Tolzy AI</span>
                          </div>
                        )}
                        <div className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed" dir="rtl">
                          {renderMessageContent(message.content)}
                        </div>
                        <div className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Loader className="h-4 w-4 animate-spin text-blue-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">جاري الكتابة...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Quick Suggestions */}
            {messages.length === 1 && !isLoading && (
              <div className="px-3 sm:px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2.5 text-right">💡 اقتراحات سريعة:</p>
                <div className="flex flex-wrap gap-2">
                  {tolzyAI.getQuickSuggestions().slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSuggestion(suggestion)}
                      className="text-xs px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 border border-blue-200 dark:border-blue-800 hover:shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 px-3 py-2.5 sm:px-4 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white text-right transition-all"
                  disabled={isLoading}
                  dir="rtl"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md hover:shadow-lg disabled:shadow-none"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2.5 text-center flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>مدعوم بـ OpenAI - ChatGPT</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TolzyAIChat;
