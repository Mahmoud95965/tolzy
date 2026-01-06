import type { Metadata } from 'next';
import { Noto_Sans_Arabic } from 'next/font/google';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { ToolsProvider } from '@/src/context/ToolsContext';
import { I18nProvider } from '@/src/components/providers/I18nProvider';
import '@/src/index.css';

const notoSansArabic = Noto_Sans_Arabic({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
    variable: '--font-noto-sans-arabic',
});

export const metadata: Metadata = {
    metadataBase: new URL('https://tolzy.me'),
    title: {
        default: 'Tolzy - منصتك الأولى لأدوات الذكاء الاصطناعي التعليمية بالعربي',
        template: '%s | Tolzy',
    },
    description: 'Tolzy - المنصة العربية الأولى لأدوات الذكاء الاصطناعي والتعليم التقني. اكتشف أكثر من 400 أداة AI، تعلم البرمجة مع Tolzy Learn، واستكشف مشاريع مفتوحة المصدر. محتوى 100% عربي لتمكين التعليم من خلال الذكاء الاصطناعي.',
    keywords: [
        'Tolzy',
        'تولزي',
        'أدوات ذكاء اصطناعي بالعربي',
        'Tolzy Tools',
        'Tolzy Learn',
        'Tolzy Stack',
        'أدوات ذكاء اصطناعي',
        'AI tools 2025',
        'ChatGPT',
        'Google Gemini',
        'Claude AI',
        'Midjourney',
        'DALL-E 3',
        'كورسات برمجة مجانية',
        'مشاريع مفتوحة المصدر',
        'GitHub projects',
        'توليزي',
        'تولز',
        'موقع تولزي',
        'منصة تولزي',
        'Tolzy Website',
        'أفضل أدوات الذكاء الاصطناعي في مكان واحد',
        'تعلم البرمجة من الصفر',
        'كل ما يتعلق بالذكاء الاصطناعي',
        'دليل أدوات الذكاء الاصطناعي الشامل',
        'كورس برمجة للمبتدئين',
        'تولزي ليرن',
        'تولزي أدوات',
        'tolzy ai tools',
        'tolzy learning platform',
    ],
    authors: [{ name: 'Tolzy' }],
    creator: 'Tolzy',
    publisher: 'Tolzy',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'ar_AR',
        url: 'https://www.tolzy.me/',
        siteName: 'Tolzy',
        title: 'Tolzy - دليلك الشامل لأفضل 400+ أداة ذكاء اصطناعي مجانية 2025',
        description: 'اكتشف أكثر من 400 أداة ذكاء اصطناعي احترافية. ChatGPT, Gemini, Claude, Midjourney. أدوات الكتابة، التصميم، البرمجة، الفيديو، البحث العلمي.',
        images: [
            {
                url: '/image/tools/Hero.png',
                width: 1200,
                height: 630,
                alt: 'Tolzy - دليل شامل لأكثر من 400 أداة ذكاء اصطناعي',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@tolzytools',
        creator: '@tolzytools',
        title: 'Tolzy - دليلك الشامل لأفضل 400+ أداة ذكاء اصطناعي مجانية 2025',
        description: 'اكتشف أكثر من 400 أداة ذكاء اصطناعي احترافية. ChatGPT, Gemini, Claude, Midjourney.',
        images: ['/image/tools/Hero.png'],
    },
    verification: {
        google: 'lUfqNmDWmCOva3GfS1PV8qFVueNhAaARVXWN9_sth2c',
        other: {
            'msvalidate.01': 'EC6C9467B5FC8847928544F2987ABE66',
        },
    },
    alternates: {
        canonical: 'https://www.tolzy.me/',
        languages: {
            ar: 'https://www.tolzy.me/',
            'x-default': 'https://www.tolzy.me/',
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Organization JSON-LD for SEO
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Tolzy',
        'alternateName': 'تولزي',
        'url': 'https://tolzy.me',
        'logo': 'https://tolzy.me/Logo.png',
        'description': 'Tolzy - المنصة العربية الأولى لأدوات الذكاء الاصطناعي والتعليم التقني. نمكّن التعليم من خلال الذكاء الاصطناعي مع أكثر من 400 أداة ومحتوى 100% عربي',
        'sameAs': [
            'https://twitter.com/tolzy',
            'https://facebook.com/tolzy',
        ],
        'contactPoint': {
            '@type': 'ContactPoint',
            'contactType': 'customer support',
            'url': 'https://tolzy.me/contact',
        }
    };

    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <head>
                <link rel="icon" type="image/png" sizes="32x32" href="/image/tools/Logo.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/image/tools/Logo.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/image/tools/Logo.png" />
                <link rel="shortcut icon" href="/image/tools/Logo.png" />
                <meta name="theme-color" content="#4F46E5" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
            </head>
            <body className={`${notoSansArabic.variable} antialiased`}>
                <ThemeProvider>
                    <AuthProvider>
                        <ToolsProvider>
                            <I18nProvider>
                                {children}
                            </I18nProvider>
                        </ToolsProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
