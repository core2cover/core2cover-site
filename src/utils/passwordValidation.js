/**
 * Password validation utility
 * Enforces production-level password strength requirements
 */

/**
 * Validates password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 * 
 * @param {string} password - The password to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (!password) {
    return { valid: false, errors: ["Password is required"] };
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*()_+-=[]{}etc.)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates and throws error if password is weak
 * @param {string} password - The password to validate
 * @throws {Error} - If password is weak
 */
export function requireStrongPassword(password) {
  const validation = validatePasswordStrength(password);
  if (!validation.valid) {
    throw new Error(`Password validation failed: ${validation.errors.join(", ")}`);
  }
}
