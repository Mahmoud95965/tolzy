import type { Metadata } from 'next';
import { Noto_Sans_Arabic } from 'next/font/google';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { ToolsProvider } from '@/src/context/ToolsContext';
import '@/src/index.css';

const notoSansArabic = Noto_Sans_Arabic({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
    variable: '--font-noto-sans-arabic',
});

export const metadata: Metadata = {
    metadataBase: new URL('https://www.tolzy.me'),
    title: {
        default: 'Tolzy - دليلك الشامل لأفضل 400+ أداة ذكاء اصطناعي مجانية 2025',
        template: '%s | Tolzy',
    },
    description: 'Tolzy - المنصة الرئيسية لأدوات الذكاء الاصطناعي. اكتشف دليلنا الشامل لأكثر من 400 أداة (ChatGPT, Gemini, Claude, Midjourney). منتجات إضافية: Tolzy Learn (كورسات برمجة مجانية)، Tolzy Stack (مشاريع GitHub مفتوحة المصدر). من إنتاج Tolzy. ابدأ مجاناً!',
    keywords: [
        'tolzy',
        'تولزي',
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
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl" className={notoSansArabic.variable}>
            <head>
                <link rel="icon" type="image/png" href="/image/tools/Hero.png" />
                <link rel="apple-touch-icon" href="/image/tools/Hero.png" />
                <meta name="theme-color" content="#4F46E5" />
            </head>
            <body className="antialiased">
                <ThemeProvider>
                    <AuthProvider>
                        <ToolsProvider>
                            {children}
                        </ToolsProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
