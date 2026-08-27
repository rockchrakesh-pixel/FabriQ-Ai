import { LoggerService } from './loggerService';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  firebaseProjectId?: string;
  corsAllowedOrigins: string[];
  shutdownTimeoutMs: number;
  durableAuditEnabled: boolean;
  rateLimitingEnabled: boolean;
}

export interface ConfigValidationResult {
  valid: boolean;
  sanitizedConfig: Record<string, any>;
  errors: string[];
  warnings: string[];
}

export class ConfigValidationService {
  /**
   * Validates production configuration safely without leaking secrets.
   */
  public static validateEnvironment(env: Record<string, string | undefined> = process.env): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const nodeEnv = env.NODE_ENV || 'development';
    const isProd = nodeEnv === 'production';

    // Port validation
    let port = 3000;
    if (env.PORT) {
      const parsedPort = parseInt(env.PORT, 10);
      if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
        errors.push(`Invalid PORT value '${env.PORT}': must be between 1 and 65535`);
      } else {
        port = parsedPort;
      }
    }

    // Firebase configuration validation
    const firebaseProjectId = env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || 'ai-studio-fabriqai-2948c91c-e823-4c6a-b513-1eddc091e687';
    if (isProd && !firebaseProjectId) {
      errors.push('Missing required FIREBASE_PROJECT_ID in production environment');
    }

    // CORS configuration validation
    const allowedOrigins = env.CORS_ALLOWED_ORIGINS
      ? env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : ['*'];

    if (isProd && allowedOrigins.includes('*')) {
      warnings.push('CORS_ALLOWED_ORIGINS contains wildcard in production');
    }

    // Shutdown timeout validation
    let shutdownTimeoutMs = 10000;
    if (env.SHUTDOWN_TIMEOUT_MS) {
      const parsedTimeout = parseInt(env.SHUTDOWN_TIMEOUT_MS, 10);
      if (isNaN(parsedTimeout) || parsedTimeout < 500 || parsedTimeout > 60000) {
        errors.push(`Invalid SHUTDOWN_TIMEOUT_MS '${env.SHUTDOWN_TIMEOUT_MS}': must be between 500 and 60000 ms`);
      } else {
        shutdownTimeoutMs = parsedTimeout;
      }
    }

    // Durable audit configuration
    const durableAuditEnabled = env.DURABLE_AUDIT_ENABLED !== 'false';

    // Build sanitized config (strictly no secrets or private keys)
    const sanitizedConfig: Record<string, any> = {
      nodeEnv,
      port,
      firebaseProjectId: firebaseProjectId ? `${firebaseProjectId.substring(0, 12)}...` : undefined,
      corsAllowedOrigins: allowedOrigins,
      shutdownTimeoutMs,
      durableAuditEnabled,
      rateLimitingEnabled: env.RATE_LIMIT_ENABLED !== 'false',
    };

    const valid = errors.length === 0;

    if (!valid) {
      LoggerService.error(`[ConfigValidationService] Configuration validation failed with ${errors.length} errors`, {
        errors,
        warnings,
      });
    } else if (warnings.length > 0) {
      LoggerService.warn(`[ConfigValidationService] Configuration validation passed with warnings`, {
        warnings,
      });
    }

    return {
      valid,
      sanitizedConfig,
      errors,
      warnings,
    };
  }

  /**
   * Asserts environment configuration is valid or throws sanitized error in production.
   */
  public static assertValidEnvironment(env: Record<string, string | undefined> = process.env): void {
    const result = this.validateEnvironment(env);
    if (!result.valid && (env.NODE_ENV === 'production' || env.STRICT_CONFIG === 'true')) {
      throw new Error(`Startup aborted due to configuration errors: ${result.errors.join('; ')}`);
    }
  }
}
