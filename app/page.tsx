import HomePage from '@/src/pages/HomePage';
import Script from 'next/script';

export default function Home() {
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Tolzy",
        "alternateName": ["تولزي", "Tolzy Tools"],
        "url": "https://www.tolzy.me/",
        "logo": "https://www.tolzy.me/image/tools/Hero.png",
        "description": "Tolzy - شركة تقنية تعليمية متخصصة في تطوير منصات الذكاء الاصطناعي والتعليم التفاعلي. المنصة الرئيسية (tolzy.me) هي دليل شامل لأكثر من 400 أداة ذكاء اصطناعي.",
        "foundingDate": "2024",
        "founder": {
            "@type": "Person",
            "name": "محمود موسى"
        },
        "sameAs": [
            "https://twitter.com/tolzytools"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "availableLanguage": ["Arabic", "English"]
        },
        "makesOffer": [
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Product",
                    "name": "Tolzy Tools",
                    "description": "المنصة الرئيسية - دليل شامل لأكثر من 400 أداة ذكاء اصطناعي مع تقييمات ومقارنات احترافية",
                    "url": "https://www.tolzy.me/tools",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD",
                        "availability": "https://schema.org/InStock"
                    },
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.8",
                        "reviewCount": "1200"
                    }
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Product",
                    "name": "Tolzy Learn",
                    "description": "منصة تعليمية تفاعلية تقدم دورات وكورسات مجانية في البرمجة والذكاء الاصطناعي والتصميم",
                    "url": "https://www.tolzy.me/tolzy-learn",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD",
                        "availability": "https://schema.org/InStock"
                    },
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.7",
                        "reviewCount": "850"
                    }
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Product",
                    "name": "Tolzy Stack",
                    "description": "مكتبة متخصصة لاستكشاف والتعلم من مشاريع GitHub مفتوحة المصدر",
                    "url": "https://www.tolzy.me/tolzy-stack",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD",
                        "availability": "https://schema.org/InStock"
                    },
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.6",
                        "reviewCount": "620"
                    }
                }
            }
        ]
    };

    return (
        <>
            <Script
                id="organization-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <HomePage />
        </>
    );
}
