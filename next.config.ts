import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Enable React strict mode for better error catching
    reactStrictMode: true,

    // Image optimization
    images: {
        domains: [
            'firebasestorage.googleapis.com',
            'lh3.googleusercontent.com',
            'www.tolzy.me',
            'tolzy.me',
        ],
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // Optimize production builds
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Headers for SEO and security
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                ],
            },
        ];
    },

    // Redirects
    async redirects() {
        return [
            {
                source: '/home',
                destination: '/',
                permanent: true,
            },
        ];
    },

    // Output configuration for Vercel
    output: 'standalone',

    // Experimental features
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion'],
    },
};

export default nextConfig;
