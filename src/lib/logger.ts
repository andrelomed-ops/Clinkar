

type LogLevel = 'info' | 'warn' | 'error' | 'trace';

class LoggerService {
    private isProd = process.env.NODE_ENV === 'production';

    private log(level: LogLevel, message: string, data?: any) {
        const timestamp = new Date().toISOString();
        const prefix = `[CLINKAR-${level.toUpperCase()}]`;
        const color = level === 'error' ? 'color: #ff4d4d' : level === 'warn' ? 'color: #ffcc00' : 'color: #66b2ff';

        if (!this.isProd) {
            console.log(`%c${prefix} [${timestamp}] ${message}`, color, data || '');
        } else {
            // In production, this would send to Sentry, LogRocket, or a custom endpoint
            // Example: Sentry.captureMessage(message, { level, extra: data });
            if (level === 'error') {
                console.error(prefix, message, data);
            }
        }
    }

    info(message: string, data?: any) { this.log('info', message, data); }
    warn(message: string, data?: any) { this.log('warn', message, data); }
    error(message: string, data?: any) { this.log('error', message, data); }
    trace(label: string, startTime: number) {
        const duration = performance.now() - startTime;
        this.log('trace', `${label} completed in ${duration.toFixed(2)}ms`);
    }
}

export const Logger = new LoggerService();
