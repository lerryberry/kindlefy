import { useEffect } from 'react';
import posthog from 'posthog-js';

export function usePostHog() {
    useEffect(() => {
        // Ensure PostHog is loaded
        if (typeof window !== 'undefined' && !posthog.__loaded) {
            posthog.init('phc_Ju4K4bBXyI79wej0tzGRdMnJTYovgalsSVigfm0clOJ', {
                api_host: 'https://app.posthog.com',
            });
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
