import { Request, Response, NextFunction } from 'express';

const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/([a-zA-Z0-9-]+\.)*run\.app$/,
  /^https:\/\/([a-zA-Z0-9-]+\.)*google\.com$/,
  /^https:\/\/([a-zA-Z0-9-]+\.)*googleusercontent\.com$/,
  /^https:\/\/aistudio\.google\.com$/,
];

/**
 * Validates whether an incoming HTTP Origin header is in the approved origins list.
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // Same-origin or non-browser request (e.g. curl, server-to-server)

  // Custom environment origins
  const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : [];
  if (envOrigins.includes(origin)) {
    return true;
  }

  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
}

/**
 * Builds the Content-Security-Policy header string based on runtime dependencies.
 */
export function buildContentSecurityPolicy(isProduction = false): string {
  const frameAncestors = isProduction
    ? "'self' https://*.google.com https://*.run.app https://aistudio.google.com"
    : "'self' https://*.google.com https://*.run.app https://aistudio.google.com http://localhost:*";

  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://checkout.razorpay.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://images.unsplash.com https://lh3.googleusercontent.com https://*.googleusercontent.com https://maps.googleapis.com https://maps.gstatic.com",
    "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.razorpay.com https://generativelanguage.googleapis.com https://maps.googleapis.com https://*.run.app wss: ws:",
    "frame-src 'self' https://api.razorpay.com https://*.firebaseapp.com",
    `frame-ancestors ${frameAncestors}`,
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; ');
}

/**
 * Express Middleware to apply hardened Security Headers across all responses.
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  const isProd = process.env.NODE_ENV === 'production';

  // 1. MIME Type Sniffing Prevention
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // 2. Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 3. DNS Prefetch Control & Download Options
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');

  // 4. Permissions Policy (Restrict unneeded capabilities)
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(self)');

  // 5. Content Security Policy
  res.setHeader('Content-Security-Policy', buildContentSecurityPolicy(isProd));

  next();
}

/**
 * Express Middleware for strict CORS governance on API routes.
 * Strictly prevents wildcard CORS with credentials on enterprise endpoints.
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin as string | undefined;

  // Handle Preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    if (origin && !isAllowedOrigin(origin)) {
      res.status(403).json({
        error: 'Forbidden: Cross-Origin Request Blocked by CORS Policy.',
        code: 'CORS_ORIGIN_DENIED',
      });
      return;
    }

    if (origin && isAllowedOrigin(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Authorization, Content-Type, X-Correlation-ID, X-Fabriq-Role, X-Fabriq-Org-ID, X-Fabriq-Division-ID, X-Fabriq-Franchise-ID, X-Fabriq-Branch-ID'
    );
    res.setHeader('Access-Control-Expose-Headers', 'X-Correlation-ID');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(204).end();
    return;
  }

  // Regular Request CORS Headers
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Expose-Headers', 'X-Correlation-ID');
  }

  next();
}
