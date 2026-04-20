'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
        const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

        if (key && typeof window !== 'undefined') {
            posthog.init(key, {
                api_host: host,
                person_profiles: 'identified_only',
                capture_pageview: false, // Handled manually in Next.js to avoid double counting
                capture_pageleave: true,
            })
        }
    }, [])

    return <PHProvider client={posthog}>{children}</PHProvider>
}
