import toast from 'react-hot-toast';

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

// TODO add 3rd party logging
function sendToThirdParty(payload: ReturnType<typeof normalizeError>) {
    // For now, just log to console in a structured way
    // eslint-disable-next-line no-console
    console.error('[ErrorReport]', payload);
}

export function reportError(err: any, context?: ErrorContext, opts?: ReportOptions) {
    const payload = normalizeError(err, context);
    if (!opts?.silent) {
        toast.error(opts?.userMessage ?? payload.message);
    }
    sendToThirdParty(payload);
    return payload;
}


