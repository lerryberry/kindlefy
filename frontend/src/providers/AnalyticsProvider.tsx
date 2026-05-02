import React, { useEffect } from 'react';
import posthog from 'posthog-js';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    // Initialize PostHog
    if (typeof window !== 'undefined' && !posthog.__loaded) {
      posthog.init('phc_Ju4K4bBXyI79wej0tzGRdMnJTYovgalsSVigfm0clOJ', {
        api_host: 'https://us.i.posthog.com',
        person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
        capture_pageview: true, // automatically capture pageviews
        capture_pageleave: true, // capture when users leave the page
      });
    }
  }, []);

  return <>{children}</>;
}

export default AnalyticsProvider;
