export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

export interface LogContext {
  correlationId?: string;
  userId?: string;
  orgId?: string;
  divisionId?: string;
  franchiseId?: string;
  branchId?: string;
  route?: string;
  method?: string;
  durationMs?: number;
  [key: string]: any;
}

const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'bearer',
  'authorization',
  'apikey',
  'api_key',
  'gemini_api_key',
  'razorpay_key_secret',
  'private_key',
  'privatekey',
];

export class LoggerService {
  public static sanitize(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map((item) => LoggerService.sanitize(item));

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some((s) => lowerKey.includes(s))) {
        sanitized[key] = '[REDACTED_SENSITIVE_DATA]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = LoggerService.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private static log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? LoggerService.sanitize(context) : {};

    const logEntry = {
      timestamp,
      severity: level,
      message,
      service: 'fabriq-enterprise-api',
      ...sanitizedContext,
    };

    const formattedLog = JSON.stringify(logEntry);

    if (level === LogLevel.ERROR) {
      console.error(formattedLog);
    } else if (level === LogLevel.WARN) {
      console.warn(formattedLog);
    } else {
      console.log(formattedLog);
    }
  }

  public static info(message: string, context?: LogContext) {
    LoggerService.log(LogLevel.INFO, message, context);
  }

  public static warn(message: string, context?: LogContext) {
    LoggerService.log(LogLevel.WARN, message, context);
  }

  public static error(message: string, context?: LogContext) {
    LoggerService.log(LogLevel.ERROR, message, context);
  }

  public static debug(message: string, context?: LogContext) {
    LoggerService.log(LogLevel.DEBUG, message, context);
  }
}
