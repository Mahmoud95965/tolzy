import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Google Gemini API Configuration
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
const genAI = GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY' ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
// OpenAI API Configuration
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string | string[];
  pricing: string;
  features: string[];
  tags: string[];
  url: string; // الرابط الخارجي للأداة
  link?: string; // الرابط الداخلي في الموقع (من Firestore)
  rating: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

class TolzyAIService {
  private tools: Tool[] = [];
  private isInitialized = false;
  private lastUpdate: Date | null = null;


  /**
   * تهيئة Tolzy AI وتحميل جميع الأدوات من Firebase
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🤖 Initializing Tolzy AI...');
      await this.refreshTools();
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Error initializing Tolzy AI:', error);
      throw error;
    }
  }

  /**
   * تحديث قاعدة بيانات الأدوات من Firebase
   */
  async refreshTools(): Promise<void> {
    try {
      console.log('🔄 Refreshing tools database...');
      const toolsRef = collection(db, 'tools');
      const snapshot = await getDocs(toolsRef);

      this.tools = snapshot.docs.map(doc => {
        const data = doc.data();
        // استخدام document ID من Firestore كرابط الأداة
        // doc.id هو الـ ID العشوائي مثل 0Ma88PI9wMMXMQlkxBds
        return {
          ...data,
          id: data.id || doc.id, // الـ ID الداخلي للبيانات
          link: `/tools/${doc.id}` // الرابط الفعلي باستخدام document ID
        } as Tool;
      });

      this.lastUpdate = new Date();
      console.log(`✅ Tools database updated with ${this.tools.length} tools at ${this.lastUpdate.toLocaleTimeString('ar-EG')}`);

      // طباعة بعض الأمثلة للتأكد من الروابط
      if (this.tools.length > 0) {
        console.log('📋 أمثلة من روابط الأدوات:');
        this.tools.slice(0, 5).forEach(tool => {
          console.log(`  - ${tool.name}: ${tool.link}`);
        });
      }
    } catch (error) {
      console.error('❌ Error refreshing tools:', error);
      throw error;
    }
  }




  /**
   * البحث عن أدوات مناسبة بناءً على الكلمات المفتاحية
   */
  private findRelevantTools(query: string, limit: number = 5): Tool[] {
    const queryLower = query.toLowerCase();

    // البحث في الاسم والوصف والفئات والتاجات
    const scoredTools = this.tools.map(tool => {
      let score = 0;

      // البحث في الاسم (أعلى أولوية)
      if (tool.name && tool.name.toLowerCase().includes(queryLower)) score += 10;

      // البحث في الوصف
      if (tool.description && tool.description.toLowerCase().includes(queryLower)) score += 5;

      // البحث في الفئات
      const categories = Array.isArray(tool.category) ? tool.category : [tool.category];
      if (categories.some(cat => cat.toLowerCase().includes(queryLower))) score += 7;

      // البحث في التاجات
      if (tool.tags?.some(tag => tag.toLowerCase().includes(queryLower))) score += 3;

      // البحث في المميزات
      if (tool.features?.some(feature => feature.toLowerCase().includes(queryLower))) score += 2;

      // إضافة نقاط للتقييم العالي
      score += (tool.rating || 0) * 0.5;

      return { tool, score };
    });

    // ترتيب حسب النقاط وإرجاع الأفضل
    return scoredTools
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.tool);
  }

  /**
   * نظام Tolzy AI مع Google Gemini
   */
  async chat(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    console.warn('⚠️ AI Service is temporarily disabled.');

    // Prevent unused variable errors
    if (false) {
      await this.generateOllamaResponse(userMessage, conversationHistory);
      await this.generateOpenAIResponse(userMessage, conversationHistory);
      this.generateLocalResponse(userMessage);
      this.generateErrorResponse();
    }

    return "عذراً، خدمة الدردشة الذكية متوقفة حالياً للصيانة. يرجى المحاولة لاحقاً.";
  }

  /**
   * توليد رد باستخدام Ollama (محلياً)
   */
  private async generateOllamaResponse(userMessage: string, conversationHistory: ChatMessage[]): Promise<string | null> {
    const OLLAMA_API_URL = 'http://localhost:11434/api/chat';
    const OLLAMA_MODEL = 'qwen2.5:1.5b';

    try {
      // بناء سياق النظام مع الأدوات
      const systemPrompt = this.createFullContext(userMessage) +
        '\n\nأنت مساعد ذكي. استخدم المعلومات أعلاه للإجابة على أسئلة المستخدم حول الأدوات. أجب دائماً باللغة العربية.';

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content: userMessage }
      ];

      const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: messages,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.message?.content || null;

    } catch (error) {
      // لا نرمي الخطأ هنا، بل نرجعه لكي يتم التعامل معه في الدالة الرئيسية والتحويل للبديل
      console.warn('⚠️ فشل الاتصال بـ Ollama:', error);
      return null;
    }
  }

  private async generateOpenAIResponse(userMessage: string, conversationHistory: ChatMessage[]): Promise<string> {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const systemPrompt = this.buildOpenAISystemPrompt();

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        temperature: 0.4
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      const error: any = new Error('OpenAI API error');
      error.status = response.status;
      error.body = errorBody;
      throw error;
    }

    const data = await response.json();
    const text: string | undefined = data.choices?.[0]?.message?.content;
    return (text || '').trim();
  }

  private buildOpenAISystemPrompt(): string {
    let toolsSection = '';

    if (this.tools.length === 0) {
      toolsSection = 'لا توجد أدوات متاحة حالياً في قاعدة البيانات.';
    } else {
      toolsSection = this.tools
        .map((tool) => {
          const categories = Array.isArray(tool.category) ? tool.category.join('، ') : tool.category;
          const internalLink = tool.link || `/tools/${tool.id}`;

          return [
            `- الاسم: ${tool.name}`,
            tool.description ? `  الوصف: ${tool.description}` : '',
            `  الفئة: ${categories}`,
            `  الرابط: ${internalLink}`
          ]
            .filter(Boolean)
            .join('\n');
        })
        .join('\n\n');
    }

    const basePrompt = `أنت مساعد ذكاء اصطناعي داخل موقع tolzy.me.

قائمة الأدوات التالية يتم جلبها مباشرة من Firestore، وتشمل:
- اسم الأداة
- وصفها
- فئتها
- رابطها الفعلي في الموقع

عند الإجابة:
- إذا ذكر المستخدم اسم أداة، استخدم الرابط الموجود معها في القائمة حرفيًا.
- لا تخمّن الروابط ولا تنشئ روابط جديدة.
- استخدم فقط الروابط التي يتم تمريرها لك ضمن بيانات الأدوات.

عند تلقي سؤال عن أداة:
- قدّم وصف الأداة
- اشرح طريقة استخدامها
- أرسل الرابط كما هو من Firestore

عند تلقي سؤال علمي أو عام:
- قدم أفضل شرح مبسط ودقيق وغير معقد.

هنا الأدوات المتاحة حاليًا:

[TOOLS_LIST_HERE]

ابدأ بالإجابة بناءً على سؤال المستخدم فقط.`;

    return basePrompt.replace('[TOOLS_LIST_HERE]', toolsSection);
  }

  /**
   * إنشاء سياق كامل مع جميع الأدوات
   */
  private createFullContext(userMessage: string): string {
    // تحضير البيانات بتنسيق JSON كما طلب المستخدم
    const toolsData = this.tools.map(tool => ({
      name: tool.name,
      id: tool.id,
      description: tool.description,
      category: tool.category,
      pricing: tool.pricing,
      rating: tool.rating,
      link: tool.link || `/tools/${tool.id}`,
      features: tool.features,
      external_url: tool.url
    }));

    console.log(`📊 Generating context with ${toolsData.length} tools.`);

    const prompt = `أنت "Tolzy AI"، نظام إجابة دقيق يعتمد فقط على البيانات المقدمة.

🔴 قاعدة صارمة: ممنوع استخدام أي معلومات من خارج البيانات التالية.
🔴 قاعدة صارمة: إذا لم تجد الإجابة في البيانات التالية، قل "عذراً، هذه المعلومة غير متوفرة في قاعدة بيانات Tolzy".

إحصائيات البيانات:
- عدد الأدوات المتاحة: ${toolsData.length}

البيانات المتاحة (Tools Database):
${JSON.stringify(toolsData, null, 2)}

تعليمات الإجابة:
1. ابحث عن الأداة المطلوبة في "البيانات المتاحة" أعلاه.
2. إذا سُئلت عن عدد الأدوات، استخدم الرقم المذكور في "إحصائيات البيانات".
3. إذا وجدتها، قدم المعلومات (الاسم، الوصف، الرابط) كما هي مكتوبة في البيانات.
4. الرابط يجب أن يكون حصراً من حقل "link" في البيانات.
5. لا تضف أي معلومات من ذاكرتك.
6. تحدث بأسلوب مساعد ومحترف باللغة العربية.

سؤال المستخدم: ${userMessage}
الإجابة:`;

    return prompt;
  }

  /**
   * رد محلي (Fallback)
   */
  private generateLocalResponse(userMessage: string): string {
    console.log('🏠 استخدام النظام المحلي...');
    const queryType = this.analyzeQuery(userMessage);
    const relevantTools = this.findRelevantTools(userMessage, 5);

    switch (queryType) {
      case 'search':
        return this.generateSearchResponse(userMessage, relevantTools);
      case 'compare':
        return this.generateComparisonResponse(userMessage, relevantTools);
      case 'recommend':
        return this.generateRecommendationResponse(userMessage, relevantTools);
      case 'info':
        return this.generateInfoResponse(userMessage, relevantTools);
      case 'greeting':
        return this.generateGreetingResponse();
      default:
        return this.generateGeneralResponse(userMessage, relevantTools);
    }
  }

  /**
   * تحليل نوع السؤال
   */
  private analyzeQuery(query: string): string {
    const lowerQuery = query.toLowerCase();

    // تحية
    if (/^(مرحب|هلا|السلام|صباح|مساء|أهلا|hi|hello)/.test(lowerQuery)) {
      return 'greeting';
    }

    // مقارنة
    if (/(قارن|مقارنة|الفرق|أفضل من|vs|versus|بين)/.test(lowerQuery)) {
      return 'compare';
    }

    // توصية
    if (/(أريد|أحتاج|اقترح|نصحني|ساعدني|أبحث عن|عاوز|محتاج)/.test(lowerQuery)) {
      return 'recommend';
    }

    // معلومات
    if (/(ما هو|ما هي|كيف|لماذا|متى|أين|شرح|معلومات|تفاصيل)/.test(lowerQuery)) {
      return 'info';
    }

    // بحث
    if (/(أداة|tool|برنامج|تطبيق|موقع)/.test(lowerQuery)) {
      return 'search';
    }

    return 'general';
  }

  /**
   * توليد رد البحث
   */
  private generateSearchResponse(query: string, tools: Tool[]): string {
    if (tools.length === 0) {
      return `عذراً، لم أجد أدوات مطابقة لبحثك "${query}".\n\nيمكنك:\n• تصفح جميع الأدوات\n• البحث بكلمات مختلفة\n• سؤالي عن فئة معينة`;
    }

    let response = `وجدت ${tools.length} ${tools.length === 1 ? 'أداة' : 'أدوات'} مناسبة:\n\n`;

    tools.forEach((tool, index) => {
      const categories = Array.isArray(tool.category) ? tool.category.join('، ') : tool.category;
      const features = tool.features && tool.features.length > 0
        ? tool.features.slice(0, 2).join('، ')
        : '';

      const toolLink = tool.link || `/tools/${tool.id}`;
      response += `**${index + 1}. ${tool.name}** ${toolLink} ⭐ ${tool.rating}/5\n`;
      response += `📂 ${categories} | 💰 ${this.translatePricing(tool.pricing)}\n`;
      if (tool.description) {
        response += `📝 ${tool.description.substring(0, 100)}${tool.description.length > 100 ? '...' : ''}\n`;
      }
      if (features) {
        response += `✨ ${features}\n`;
      }
      if (tool.url) {
        response += `🔗 الرابط الخارجي: ${tool.url}\n`;
      }
      response += `\n`;
    });

    response += `هل تريد معرفة المزيد عن أي أداة؟`;
    return response;
  }

  /**
   * توليد رد المقارنة
   */
  private generateComparisonResponse(_query: string, tools: Tool[]): string {
    if (tools.length < 2) {
      return `لإجراء مقارنة، أحتاج على الأقل أداتين. وجدت ${tools.length} أداة فقط.\n\nحاول أن تكون أكثر تحديداً في سؤالك.`;
    }

    const tool1 = tools[0];
    const tool2 = tools[1];

    let response = `**مقارنة بين ${tool1.name} و ${tool2.name}:**\n\n`;

    const tool1Link = tool1.link || `/tools/${tool1.id}`;
    response += `**${tool1.name}** ${tool1Link} ⭐ ${tool1.rating}/5\n`;
    response += `• التسعير: ${this.translatePricing(tool1.pricing)}\n`;
    if (tool1.features && tool1.features.length > 0) {
      response += `• المميزات: ${tool1.features.slice(0, 3).join('، ')}\n`;
    }
    if (tool1.url) {
      response += `• الرابط: ${tool1.url}\n`;
    }
    response += `\n`;

    const tool2Link = tool2.link || `/tools/${tool2.id}`;
    response += `**${tool2.name}** ${tool2Link} ⭐ ${tool2.rating}/5\n`;
    response += `• التسعير: ${this.translatePricing(tool2.pricing)}\n`;
    if (tool2.features && tool2.features.length > 0) {
      response += `• المميزات: ${tool2.features.slice(0, 3).join('، ')}\n`;
    }
    if (tool2.url) {
      response += `• الرابط: ${tool2.url}\n`;
    }
    response += `\n`;

    // التوصية
    if (tool1.rating > tool2.rating) {
      response += `💡 **التوصية:** ${tool1.name} (تقييم أعلى)`;
    } else if (tool2.rating > tool1.rating) {
      response += `💡 **التوصية:** ${tool2.name} (تقييم أعلى)`;
    } else {
      if (tool1.pricing === 'Free' && tool2.pricing !== 'Free') {
        response += `💡 **التوصية:** ${tool1.name} (مجاني)`;
      } else if (tool2.pricing === 'Free' && tool1.pricing !== 'Free') {
        response += `💡 **التوصية:** ${tool2.name} (مجاني)`;
      } else {
        response += `💡 كلاهما ممتاز! اختر حسب احتياجاتك.`;
      }
    }

    return response;
  }

  /**
   * توليد رد التوصية
   */
  private generateRecommendationResponse(_query: string, tools: Tool[]): string {
    if (tools.length === 0) {
      return `عذراً، لم أجد أدوات مناسبة لاحتياجك.\n\nيمكنك:\n• وصف احتياجك بشكل أوضح\n• تصفح الفئات المختلفة\n• سؤالي عن فئة محددة`;
    }

    const bestTool = tools[0];
    const categories = Array.isArray(bestTool.category) ? bestTool.category.join('، ') : bestTool.category;

    let response = `بناءً على طلبك، أنصحك بـ:\n\n`;
    const bestToolLink = bestTool.link || `/tools/${bestTool.id}`;
    response += `🌟 **${bestTool.name}** ${bestToolLink} (${bestTool.rating}/5 نجوم)\n\n`;
    response += `**لماذا هذه الأداة؟**\n`;
    response += `• التقييم: ${bestTool.rating}/5 ⭐\n`;
    response += `• التسعير: ${this.translatePricing(bestTool.pricing)} 💰\n`;
    response += `• الفئة: ${categories} 📂\n`;
    if (bestTool.url) {
      response += `• الرابط الخارجي: ${bestTool.url}\n`;
    }

    if (bestTool.description) {
      response += `\n**الوصف:**\n${bestTool.description}\n`;
    }

    if (bestTool.features && bestTool.features.length > 0) {
      response += `\n**المميزات الرئيسية:**\n`;
      bestTool.features.slice(0, 4).forEach(feature => {
        response += `✓ ${feature}\n`;
      });
    }

    if (tools.length > 1) {
      response += `\n**بدائل أخرى:**\n`;
      tools.slice(1, 3).forEach((tool, index) => {
        const altToolLink = tool.link || `/tools/${tool.id}`;
        response += `${index + 2}. ${tool.name} ${altToolLink} (${tool.rating}/5) - ${this.translatePricing(tool.pricing)}\n`;
      });
    }

    return response;
  }

  /**
   * توليد رد المعلومات
   */
  private generateInfoResponse(_query: string, tools: Tool[]): string {
    if (tools.length === 0) {
      return this.generateGeneralInfo();
    }

    const tool = tools[0];
    const categories = Array.isArray(tool.category) ? tool.category.join('، ') : tool.category;

    const toolLink = tool.link || `/tools/${tool.id}`;
    let response = `**معلومات عن ${tool.name}** ${toolLink}\n\n`;

    if (tool.description) {
      response += `📝 **الوصف:**\n${tool.description}\n\n`;
    }

    response += `📊 **التفاصيل:**\n`;
    response += `• التقييم: ${tool.rating}/5 ⭐\n`;
    response += `• التسعير: ${this.translatePricing(tool.pricing)} 💰\n`;
    response += `• الفئة: ${categories} 📂\n`;

    if (tool.features && tool.features.length > 0) {
      response += `\n✨ **المميزات:**\n`;
      tool.features.forEach(feature => {
        response += `• ${feature}\n`;
      });
    }

    response += `\nهل تريد معرفة المزيد أو مقارنتها بأداة أخرى؟`;
    return response;
  }

  /**
   * توليد رد الترحيب
   */
  private generateGreetingResponse(): string {
    const greetings = [
      `مرحباً! 👋 أنا Tolzy AI، مساعدك الذكي في عالم أدوات الذكاء الاصطناعي.\n\nكيف يمكنني مساعدتك اليوم؟`,
      `أهلاً وسهلاً! 🌟 أنا هنا لمساعدتك في إيجاد أفضل أدوات الذكاء الاصطناعي.\n\nما الذي تبحث عنه؟`,
      `مرحباً بك! 🎯 يمكنني مساعدتك في:\n• البحث عن أدوات\n• المقارنة بين الأدوات\n• اقتراح أفضل الأدوات\n\nما احتياجك؟`
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * توليد رد عام
   */
  private generateGeneralResponse(query: string, tools: Tool[]): string {
    if (tools.length > 0) {
      return this.generateSearchResponse(query, tools);
    }

    return `أنا Tolzy AI، متخصص في أدوات الذكاء الاصطناعي.\n\nيمكنني مساعدتك في:\n\n🔍 **البحث** - "أريد أداة للكتابة"\n⚖️ **المقارنة** - "قارن بين ChatGPT و Gemini"\n💡 **التوصية** - "أحتاج أداة للتصميم"\n📊 **المعلومات** - "ما هو ChatGPT؟"\n\nجرّب سؤالي عن أي شيء!`;
  }

  /**
   * معلومات عامة
   */
  private generateGeneralInfo(): string {
    const stats = this.getStats();
    return `**عن Tolzy:**\n\n📊 لدينا ${stats.totalTools} أداة ذكاء اصطناعي\n📂 ${stats.categories} فئة مختلفة\n⭐ متوسط التقييم: ${stats.averageRating}/5\n\nيمكنك سؤالي عن أي أداة أو فئة!`;
  }

  /**
   * رد الخطأ
   */
  private generateErrorResponse(): string {
    return `عذراً، حدث خطأ غير متوقع. 😔\n\nيمكنك:\n• إعادة صياغة سؤالك\n• تصفح الأدوات مباشرة\n• المحاولة مرة أخرى`;
  }

  /**
   * ترجمة التسعير
   */
  private translatePricing(pricing: string): string {
    const translations: { [key: string]: string } = {
      'Free': 'مجاني',
      'Freemium': 'مجاني مع مميزات مدفوعة',
      'Paid': 'مدفوع',
      'Subscription': 'اشتراك'
    };
    return translations[pricing] || pricing;
  }

  /**
   * الحصول على اقتراحات سريعة
   */
  getQuickSuggestions(): string[] {
    return [
      'ما هي أفضل أداة لكتابة المحتوى؟',
      'أريد أداة لتصميم الصور بالذكاء الاصطناعي',
      'ما هي الأدوات المجانية المتاحة؟',
      'أحتاج أداة للبرمجة والكود',
      'أدوات لتحسين الإنتاجية',
      'أفضل أدوات الفيديو والمونتاج'
    ];
  }

  /**
   * الحصول على إحصائيات
   */
  getStats() {
    return {
      totalTools: this.tools.length,
      categories: [...new Set(this.tools.flatMap(t =>
        Array.isArray(t.category) ? t.category : [t.category]
      ))].length,
      freeTools: this.tools.filter(t => t.pricing === 'Free').length,
      averageRating: (this.tools.reduce((sum, t) => sum + t.rating, 0) / this.tools.length).toFixed(1)
    };
  }

  /**
   * الحصول على معلومات آخر تحديث
   */
  getLastUpdateInfo(): { lastUpdate: Date | null; toolsCount: number; isInitialized: boolean } {
    return {
      lastUpdate: this.lastUpdate,
      toolsCount: this.tools.length,
      isInitialized: this.isInitialized
    };
  }

  /**
   * إجبار تحديث قاعدة البيانات
   */
  async forceRefresh(): Promise<void> {
    await this.refreshTools();
  }

  /**
   * ترجمة النص إلى العربية باستخدام Gemini
   */
  async translateToArabic(text: string): Promise<string> {
    if (!genAI) return text;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Translate the following text to Arabic. Maintain the professional tone and technical terms where appropriate. Only return the translated text.\n\nText: ${text}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  }

  /**
   * تحليل محتوى الكورس لاستخراج المعلومات
   */
  async analyzeCourseContent(_title: string, _description: string): Promise<{ isFree: boolean, platform: string, language: string, hasCertificate: boolean }> {
    console.warn('⚠️ AI Analysis is temporarily disabled.');
    return { isFree: false, platform: 'Unknown', language: 'English', hasCertificate: false };
  }
}

// تصدير instance واحد فقط (Singleton)
export const tolzyAI = new TolzyAIService();
