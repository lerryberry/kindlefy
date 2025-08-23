// Simple console logger that works in both dev and production builds
const isLoggingEnabled = import.meta.env.VITE_ENABLE_LOGS === 'true';
const logLevel = import.meta.env.VITE_LOG_LEVEL || 'info';

const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

function shouldLog(level: keyof typeof logLevels): boolean {
    if (!isLoggingEnabled) return false;
    return logLevels[level] <= logLevels[logLevel as keyof typeof logLevels];
}

export const consoleLogger = {
    error: (message: string, ...args: any[]) => {
        if (shouldLog('error')) {
            console.error(`[ERROR] ${message}`, ...args);
        }
    },

    warn: (message: string, ...args: any[]) => {
        if (shouldLog('warn')) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    },

    info: (message: string, ...args: any[]) => {
        if (shouldLog('info')) {
            console.info(`[INFO] ${message}`, ...args);
        }
    },

    debug: (message: string, ...args: any[]) => {
        if (shouldLog('debug')) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    },

    // API specific logging
    api: {
        request: (method: string, url: string, data?: any) => {
            consoleLogger.debug(`API Request: ${method} ${url}`, data);
        },
        response: (method: string, url: string, status: number, data?: any) => {
            consoleLogger.debug(`API Response: ${method} ${url} - ${status}`, data);
        },
        error: (method: string, url: string, error: any) => {
            consoleLogger.error(`API Error: ${method} ${url}`, error);
        }
    },

    // Auth specific logging
    auth: {
        event: (event: string, data?: any) => {
            consoleLogger.debug(`Auth Event: ${event}`, data);
        }
    }
};
