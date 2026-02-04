import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/dashboard/',
                '/api/',
                '/checkout-simulation/',
                '/vault-simulation/',
                '/stress-test/',
            ],
        },
        sitemap: 'https://clinkar.com/sitemap.xml',
    };
}
