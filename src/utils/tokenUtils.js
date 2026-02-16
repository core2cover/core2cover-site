/**
 * Token generation and hashing utilities
 * Uses cryptographically secure methods for password reset tokens
 */
import crypto from "crypto";

/**
 * Generates a cryptographically secure random token
 * @param {number} bytes - Number of random bytes (default: 32)
 * @returns {string} - Hex string token
 */
export function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Hashes a token using SHA-256
 * This is used to store tokens securely in the database
 * @param {string} token - The raw token to hash
 * @returns {string} - Hashed token (hex string)
 */
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a password reset token with expiry
 * @param {number} expiryMinutes - Minutes until token expires (default: 15)
 * @returns {Object} - { token: string, hashedToken: string, expiry: Date }
 */
export function createPasswordResetToken(expiryMinutes = 15) {
  const token = generateSecureToken(32);
  const hashedToken = hashToken(token);
  const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000);

  return {
    token, // Raw token - send this in email, NEVER store in DB
    hashedToken, // Hashed token - store this in DB
    expiry,
  };
}

/**
 * Verifies if a token matches the stored hash and is not expired
 * @param {string} token - Raw token from user
 * @param {string} storedHash - Hashed token from database
 * @param {Date} expiry - Token expiry date from database
 * @returns {boolean} - true if token is valid and not expired
 */
export function verifyPasswordResetToken(token, storedHash, expiry) {
  if (!token || !storedHash || !expiry) {
    return false;
  }

  const hashedToken = hashToken(token);
  const isMatch = hashedToken === storedHash;
  const isNotExpired = new Date() < new Date(expiry);

  return isMatch && isNotExpired;
}
