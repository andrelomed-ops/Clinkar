import { BaseService } from './BaseService';

declare global {
    interface Window {
        posthog?: {
            capture: (event: string, properties?: Record<string, any>) => void;
            identify: (userId: string, properties?: Record<string, any>) => void;
            reset: () => void;
        };
    }
}

export class AnalyticsService extends BaseService {
    private static initialized = false;

    static init() {
        if (this.initialized || typeof window === 'undefined') return;

        const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
        
        if (posthogKey) {
            const script = document.createElement('script');
            script.innerHTML = `
                !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s){if(!s){s={};s.host=location.host;}var a=t.createElement("script");a.type="text/javascript",a.async=!0,a.src="https://cdn.jsdelivr.net/npm/posthog-js/dist/posthog.min.js",a.onload=function(){window.posthog.init("${posthogKey}",s)}},t.getElementsByTagName("head")[0].appendChild(a))}}(document,window.posthog||[]);
            `;
            document.head.appendChild(script);
            this.initialized = true;
        }
    }

    static track(event: string, properties?: Record<string, any>) {
        if (typeof window !== 'undefined' && window.posthog) {
            window.posthog.capture(event, {
                ...properties,
                timestamp: new Date().toISOString(),
            });
        }
    }

    static identify(userId: string, properties?: Record<string, any>) {
        if (typeof window !== 'undefined' && window.posthog) {
            window.posthog.identify(userId, properties);
        }
    }

    static reset() {
        if (typeof window !== 'undefined' && window.posthog) {
            window.posthog.reset();
        }
    }

    static trackPageView(pageName: string) {
        this.track('page_view', { page: pageName });
    }

    static trackSignUp(method: 'email' | 'google') {
        this.track('sign_up', { method });
    }

    static trackTransactionStarted(carId: string, price: number) {
        this.track('transaction_started', { car_id: carId, price });
    }

    static trackTransactionCompleted(transactionId: string, amount: number) {
        this.track('transaction_completed', { transaction_id: transactionId, amount });
    }

    static trackReferralApplied(code: string) {
        this.track('referral_applied', { code });
    }

    static trackReferralCompleted(referrerId: string, rewardAmount: number) {
        this.track('referral_completed', { referrer_id: referrerId, reward_amount: rewardAmount });
    }

    static trackServiceSelected(serviceType: string, price: number) {
        this.track('service_selected', { service_type: serviceType, price });
    }

    static trackError(errorType: string, details: string) {
        this.track('error', { error_type: errorType, details });
    }
}