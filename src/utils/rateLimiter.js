/**
 * Rate limiting middleware for API routes
 * Prevents brute force attacks by limiting requests per IP address
 */

// In-memory store for rate limiting (for production, use Redis or similar)
const rateLimitStore = new Map();

/**
 * Cleans up expired entries from the rate limit store
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Rate limiting function
 * @param {string} identifier - Unique identifier (usually IP address)
 * @param {number} maxAttempts - Maximum number of attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} - { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(identifier, maxAttempts, windowMs) {
  const now = Date.now();
  const key = identifier;

  // Get or create entry
  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // Create new entry
    entry = {
      attempts: 0,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, entry);
  }

  // Increment attempts
  entry.attempts++;

  const allowed = entry.attempts <= maxAttempts;
  const remaining = Math.max(0, maxAttempts - entry.attempts);

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    attemptsUsed: entry.attempts,
  };
}

/**
 * Resets rate limit for a specific identifier
 * @param {string} identifier - Unique identifier to reset
 */
export function resetRateLimit(identifier) {
  rateLimitStore.delete(identifier);
}

/**
 * Gets client IP address from request
 * @param {Request} request - Next.js request object
 * @returns {string} - Client IP address
 */
export function getClientIp(request) {
  // Check various headers for IP address
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to a default value
  return "unknown";
}

/**
 * Creates a rate limit middleware for Next.js API routes
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMinutes - Time window in minutes
 * @param {string} type - Type of rate limit (for error messages)
 * @returns {Function} - Middleware function
 */
export function createRateLimiter(maxAttempts, windowMinutes, type = "request") {
  const windowMs = windowMinutes * 60 * 1000;

  return (request) => {
    const ip = getClientIp(request);
    const identifier = `${type}:${ip}`;
    
    const result = checkRateLimit(identifier, maxAttempts, windowMs);

    if (!result.allowed) {
      const resetTimeMinutes = Math.ceil((result.resetTime - Date.now()) / 1000 / 60);
      throw new Error(
        `Too many ${type} attempts. Please try again in ${resetTimeMinutes} minute${resetTimeMinutes !== 1 ? "s" : ""}.`
      );
    }

    return result;
  };
}

// Pre-configured rate limiters for different endpoints
export const loginRateLimiter = createRateLimiter(5, 5, "login");
export const forgotPasswordRateLimiter = createRateLimiter(3, 5, "password reset");
export const otpRateLimiter = createRateLimiter(5, 5, "OTP");
export const resetPasswordRateLimiter = createRateLimiter(5, 5, "password reset");
