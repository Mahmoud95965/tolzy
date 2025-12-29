import HomePage from '@/src/views/HomePage';
import Script from 'next/script';

export default function Home() {
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Tolzy",
        "alternateName": ["تولزي", "Tolzy Tools"],
        "url": "https://tolzy.me/",
        "logo": "https://tolzy.me/image/tools/Hero.png",
        "description": "Tolzy - المنصة العربية الأولى لأدوات الذكاء الاصطناعي والتعليم التقني. نمكّن التعليم من خلال الذكاء الاصطناعي ونجعل موارد التعلم عالية الجودة متاحة للجميع. أكثر من 400 أداة AI، محتوى 100% عربي، مجتمع 350,000+ مطور ومحترف.",
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
                    "description": "دليل شامل وتفاعلي لأكثر من 400 أداة ذكاء اصطناعي مع تقييمات احترافية ومقارنات مفصلة. محتوى 100% عربي لمساعدة المطورين والمبدعين",
                    "url": "https://tolzy.me/tools",
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
                    "description": "منصة تعليمية تفاعلية لتمكين التعليم من خلال الذكاء الاصطناعي. كورسات مجانية في البرمجة، الذكاء الاصطناعي، والتصميم بمحتوى عربي عالي الجودة",
                    "url": "https://tolzy.me/tolzy-learn",
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
                    "url": "https://tolzy.me/tolzy-stack",
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
