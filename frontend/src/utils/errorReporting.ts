import toast from 'react-hot-toast';
import posthog from 'posthog-js';

export interface ErrorContext {
    feature?: string;
    action?: string;
    entity?: string;
    extras?: Record<string, unknown>;
}

export interface ReportOptions {
    userMessage?: string;
    silent?: boolean;
    level?: 'info' | 'warn' | 'error';
}

export function extractServerErrorMessage(err: any): string {
    return (
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong'
    );
}

export function normalizeError(err: any, context?: ErrorContext) {
    return {
        message: extractServerErrorMessage(err),
        httpStatus: err?.response?.status,
        code: err?.code,
        stack: err?.stack,
        context: context || {},
        raw: err
    };
}

// Send errors to PostHog for tracking and analysis
function sendToThirdParty(payload: ReturnType<typeof normalizeError>) {
    // Log to console for debugging
    // eslint-disable-next-line no-console
    console.error('[ErrorReport]', payload);

    // Send to PostHog for error tracking
    if (typeof window !== 'undefined' && posthog.__loaded) {
        // Create a proper Error object for captureException
        const error = new Error(payload.message);
        if (payload.stack) {
            error.stack = payload.stack;
        }

        posthog.captureException(error, {
            feature: payload.context.feature,
            action: payload.context.action,
            entity: payload.context.entity,
            error_code: payload.code,
            http_status: payload.httpStatus,
            error_type: 'client_error',
            ...payload.context.extras
        });
    }
}

export function reportError(err: any, context?: ErrorContext, opts?: ReportOptions) {
    const payload = normalizeError(err, context);
    if (!opts?.silent) {
        toast.error(opts?.userMessage ?? payload.message);
    }
    sendToThirdParty(payload);
    return payload;
}


