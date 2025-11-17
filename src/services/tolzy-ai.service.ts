import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Google Gemini API Configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
const genAI = GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY' ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
// OpenAI API Configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

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
  private updateInterval = 5 * 60 * 1000; // تحديث كل 5 دقائق
  private geminiDisabledUntil: number | null = null;
  private readonly geminiCooldownMs = 30 * 60 * 1000; // تعطيل Gemini لمدة 30 دقيقة بعد الوصول للحد

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
   * التحقق من الحاجة لتحديث قاعدة البيانات
   */
  private shouldRefresh(): boolean {
    if (!this.lastUpdate) return true;
    const timeSinceUpdate = Date.now() - this.lastUpdate.getTime();
    return timeSinceUpdate > this.updateInterval;
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
    if (!this.isInitialized) {
      await this.initialize();
    }

    // تحديث قاعدة البيانات إذا مر وقت طويل
    if (this.shouldRefresh()) {
      try {
        await this.refreshTools();
      } catch (error) {
        console.warn('⚠️ فشل تحديث قاعدة البيانات، استخدام البيانات المخزنة');
      }
    }

    // إذا تم تهيئة OpenAI، استخدمه كمزوّد رئيسي للجيل
    if (OPENAI_API_KEY) {
      try {
        console.log('🤖 Tolzy AI (OpenAI) processing...');
        const openaiText = await this.generateOpenAIResponse(userMessage, conversationHistory);
        if (openaiText) {
          console.log('✅ OpenAI response received');
          return openaiText;
        }
        return this.generateLocalResponse(userMessage);
      } catch (error: any) {
        const status = error?.status || error?.response?.status;

        if (status === 429) {
          console.warn('⚠️ تم الوصول إلى حد استخدام OpenAI (429). سيتم استخدام نظام Tolzy المحلي لهذه الرسالة.', error);
        } else {
          console.warn('⚠️ OpenAI API فشل، التحويل للنظام المحلي...', error);
        }

        return this.generateLocalResponse(userMessage);
      }
    }

    // إذا تم تعطيل Gemini مؤقتاً بسبب تجاوز الحد، استخدم النظام المحلي مباشرة
    if (this.geminiDisabledUntil && Date.now() < this.geminiDisabledUntil) {
      console.warn('⚠️ تم تجاوز حد استخدام Gemini مؤخراً، Tolzy AI يعمل الآن في الوضع المحلي فقط.');
      return this.generateLocalResponse(userMessage);
    }

    // التحقق من API Key
    if (!genAI) {
      console.warn('⚠️ Gemini API غير متاح، استخدام النظام المحلي...');
      return this.generateLocalResponse(userMessage);
    }

    try {
      console.log('🤖 Tolzy AI (Gemini) processing...');
      
      // إرسال جميع الأدوات للسياق
      const context = this.createFullContext(userMessage);
      
      // استخدام Gemini 2.0 Flash
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const prompt = `${context}\n\nسؤال المستخدم: ${userMessage}\n\n⚠️ تذكير نهائي:\n- استخدم فقط IDs الموجودة في القاعدة أعلاه\n- لا تخترع أو تعدل أي ID\n- الرابط الصحيح: /tools/[exact-id-from-database]\n- مثال: إذا كان ID الأداة "chatgpt-4o" فالرابط /tools/chatgpt-4o\n\nأجب بالعربية بشكل مفيد ومختصر:`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        console.log('✅ Gemini response received');
        return text;
      }
      
      return this.generateLocalResponse(userMessage);
      
    } catch (error: any) {
      const status = error?.status || error?.response?.status;

      if (status === 429) {
        // Too Many Requests - تعطيل طلبات Gemini لفترة واستخدام النظام المحلي فقط
        this.geminiDisabledUntil = Date.now() + this.geminiCooldownMs;
        console.warn('⚠️ تم الوصول إلى حد استخدام Gemini (429). سيتم استخدام نظام Tolzy المحلي فقط لفترة زمنية.', error);
      } else {
        console.warn('⚠️ Gemini API فشل، التحويل للنظام المحلي...', error);
      }

      return this.generateLocalResponse(userMessage);
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
    let context = `أنت Tolzy AI، مساعد ذكي متخصص في أدوات الذكاء الاصطناعي.\n\n`;
    
    // إضافة قائمة بجميع IDs المتاحة أولاً
    context += `📋 قائمة IDs المتاحة فقط (استخدم هذه فقط):\n`;
    this.tools.forEach(tool => {
      context += `- ${tool.id} → ${tool.name}\n`;
    });
    context += `\n⚠️ هذه هي الـ IDs الوحيدة المسموحة. لا تستخدم أي ID آخر!\n\n`;
    
    context += `قاعدة بيانات الأدوات الكاملة (${this.tools.length} أداة):\n\n`;
    
    // إرسال جميع الأدوات
    this.tools.forEach((tool, index) => {
      const categories = Array.isArray(tool.category) ? tool.category.join('، ') : tool.category;
      
      context += `${index + 1}. ${tool.name}\n`;
      context += `   🆔 ID: ${tool.id}\n`;
      context += `   📂 الفئة: ${categories}\n`;
      context += `   💰 التسعير: ${this.translatePricing(tool.pricing)}\n`;
      context += `   ⭐ التقييم: ${tool.rating}/5\n`;
      
      if (tool.description) {
        context += `   📝 الوصف: ${tool.description}\n`;
      }
      
      if (tool.url) {
        context += `   🔗 الرابط الخارجي: ${tool.url}\n`;
      }
      
      // إضافة رابط داخلي للأداة - استخدام link من Firestore إذا كان موجوداً
      const internalLink = tool.link || `/tools/${tool.id}`;
      context += `   🔗 رابط الأداة في Tolzy: ${internalLink}\n`;
      
      if (tool.features && tool.features.length > 0) {
        context += `   ✨ المميزات:\n`;
        tool.features.forEach(feature => {
          context += `      • ${feature}\n`;
        });
      }
      
      if (tool.tags && tool.tags.length > 0) {
        context += `   🏷️ التاجات: ${tool.tags.join('، ')}\n`;
      }
      
      context += `\n`;
    });
    
    context += `\n⚠️ تعليمات صارمة - يجب الالتزام بها:\n`;
    context += `1. استخدم فقط الأدوات الموجودة في القاعدة أعلاه\n`;
    context += `2. لا تخترع أو تفترض وجود أدوات غير مذكورة\n`;
    context += `3. عند ذكر أي أداة، استخدم ID الصحيح من القاعدة\n`;
    context += `4. صيغة الرابط الإلزامية: /tools/[tool-id-from-database]\n`;
    context += `5. مثال صحيح: "ChatGPT /tools/chatgpt-4o"\n`;
    context += `6. مثال خاطئ: "ChatGPT /tools/chatgpt" (إذا كان ID الصحيح chatgpt-4o)\n`;
    context += `7. تحقق من ID الأداة قبل كتابة الرابط\n`;
    context += `8. إذا لم تجد الأداة في القاعدة، قل "لا توجد هذه الأداة حالياً"\n`;
    context += `9. لا تستخدم روابط خارجية إلا إذا كانت موجودة في حقل url\n`;
    context += `10. الروابط الداخلية فقط بصيغة /tools/[exact-tool-id]\n`;
    
    return context;
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
  private generateComparisonResponse(query: string, tools: Tool[]): string {
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
  private generateRecommendationResponse(query: string, tools: Tool[]): string {
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
  private generateInfoResponse(query: string, tools: Tool[]): string {
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
}

// تصدير instance واحد فقط (Singleton)
export const tolzyAI = new TolzyAIService();
