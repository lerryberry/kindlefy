import { useEffect } from 'react';
import posthog from 'posthog-js';

export function usePostHog() {
    useEffect(() => {
        // Ensure PostHog is loaded
        if (typeof window !== 'undefined' && !posthog.__loaded) {
            const posthogKey = import.meta.env.VITE_POSTHOG_KEY || 'phc_Ju4K4bBXyI79wej0tzGRdMnJTYovgalsSVigfm0clOJ';
            const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

            if (posthogKey) {
                posthog.init(posthogKey, {
                    api_host: posthogHost,
                    person_profiles: 'identified_only',
                    capture_pageview: true,
                    capture_pageleave: true,
                });
            }
        }
    }, []);

    return {
        capture: (event: string, properties?: Record<string, any>) => {
            posthog.capture(event, properties);
        },
        identify: (userId: string, properties?: Record<string, any>) => {
            posthog.identify(userId, properties);
        },
        reset: () => {
            posthog.reset();
        },
        setPersonProperties: (properties: Record<string, any>) => {
            posthog.setPersonProperties(properties);
        },
        group: (groupType: string, groupKey: string, properties?: Record<string, any>) => {
            posthog.group(groupType, groupKey, properties);
        },
    };
}
