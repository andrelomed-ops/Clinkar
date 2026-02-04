import Stripe from 'stripe';
import { version } from '../../package.json';

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
    console.warn("⚠️ STRIPE_SECRET_KEY is missing. Stripe features will fail globally. Using Mock for startup safety.");
}

export const stripe = new Stripe(stripeKey || 'sk_test_mock_1234567890', {
    apiVersion: '2024-12-18.acacia' as any,
    typescript: true,
    appInfo: {
        name: 'Clinkar',
        version: version || '0.1.0',
        url: 'https://clinkar.com',
    },
});
