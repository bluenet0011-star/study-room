import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/'], // Hide API and Admin routes
        },
        // sitemap: 'https://study.dghs.kr/sitemap.xml', // Domain not final yet
    };
}
