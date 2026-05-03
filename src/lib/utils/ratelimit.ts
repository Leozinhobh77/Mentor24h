import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRule {
  maxRequests: number;
  windowMs: number;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple in-memory rate limiting for auth endpoints
 * In production, use Redis or Vercel's ratelimit
 */
export function rateLimit(
  identifier: string,
  rule: RateLimitRule
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now >= entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + rule.windowMs,
    });
    return {
      allowed: true,
      remaining: rule.maxRequests - 1,
      resetTime: now + rule.windowMs,
    };
  }

  if (entry.count >= rule.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: rule.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Extract client IP from request (supports X-Forwarded-For)
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const geo = (request as any).geo?.ip;
  return geo || 'unknown';
}

/**
 * Helper to check rate limit and return error if exceeded
 */
export function checkRateLimit(
  request: NextRequest,
  rule: RateLimitRule
): { exceeded: boolean; response?: NextResponse } {
  const clientIp = getClientIp(request);
  const result = rateLimit(clientIp, rule);

  if (!result.allowed) {
    const resetDate = new Date(result.resetTime).toISOString();
    return {
      exceeded: true,
      response: NextResponse.json(
        {
          success: false,
          error: 'Muitas tentativas. Tente novamente mais tarde.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Reset': resetDate,
          },
        }
      ),
    };
  }

  return { exceeded: false };
}
