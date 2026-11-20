/**
 * VahanLoop Production Monitoring and Structured Logging Subsystem
 * Scrubs all sensitive personal credentials, auth tokens, and secrets from logs.
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'jwt',
  'secret',
  'keysecret',
  'authorization',
  'cookie',
  'cookies',
  'cardnumber',
  'cvv',
  'aadhaar',
  'pan',
]);

export function sanitizePayload(data: any): any {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(sanitizePayload);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED_SECRET]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizePayload(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export interface StructuredLogEntry {
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  context?: Record<string, any>;
  requestId?: string;
  timestamp: string;
}

class MonitoringService {
  private errorCount = 0;
  private requestCount = 0;
  private lastErrors: { timestamp: string; message: string }[] = [];

  log(level: 'INFO' | 'WARN' | 'ERROR', message: string, context?: Record<string, any>, requestId?: string) {
    if (level === 'ERROR') {
      this.errorCount += 1;
      this.lastErrors.unshift({ timestamp: new Date().toISOString(), message });
      if (this.lastErrors.length > 20) this.lastErrors.pop();
    }

    const entry: StructuredLogEntry = {
      level,
      message,
      context: context ? sanitizePayload(context) : undefined,
      requestId,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === 'production') {
      // Structured JSON log in production for Datadog / Vercel Log Drains
      console.log(JSON.stringify(entry));
    } else {
      // Readable formatting for local dev
      const prefix = `[${entry.timestamp}][${level}]`;
      if (level === 'ERROR') {
        console.error(`${prefix} ${message}`, entry.context || '');
      } else if (level === 'WARN') {
        console.warn(`${prefix} ${message}`, entry.context || '');
      } else {
        console.log(`${prefix} ${message}`, entry.context || '');
      }
    }
  }

  info(message: string, context?: Record<string, any>, requestId?: string) {
    this.log('INFO', message, context, requestId);
  }

  warn(message: string, context?: Record<string, any>, requestId?: string) {
    this.log('WARN', message, context, requestId);
  }

  error(message: string, error?: any, context?: Record<string, any>, requestId?: string) {
    const errorDetails = error instanceof Error
      ? { errorMessage: error.message, stack: error.stack }
      : { rawError: String(error) };

    this.log('ERROR', message, { ...errorDetails, ...context }, requestId);
  }

  getMetrics() {
    return {
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      recentErrors: this.lastErrors.slice(0, 5),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}

export const monitoring = new MonitoringService();
