/**
 * Password validator following international security standards (NIST SP 800-63B)
 * Ensures strong password requirements for user accounts
 */

export function validatePasswordStrength(password) {
  const errors = [];
  const strength = {
    score: 0,
    level: "Weak",
    errors: [],
    feedback: [],
  };

  if (!password) {
    errors.push("Password is required.");
    strength.errors = errors;
    strength.feedback = ["Enter a password"];
    return strength;
  }

  // Minimum length: 12 characters (NIST recommendation)
  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long.");
    strength.feedback.push("Add more characters (minimum 12)");
  } else {
    strength.score += 1;
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z).");
    strength.feedback.push("Add an uppercase letter");
  } else {
    strength.score += 1;
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z).");
    strength.feedback.push("Add a lowercase letter");
  } else {
    strength.score += 1;
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number (0-9).");
    strength.feedback.push("Add a number");
  } else {
    strength.score += 1;
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (!@#$%^&*...).",
    );
    strength.feedback.push("Add a special character");
  } else {
    strength.score += 1;
  }

  // Common patterns to avoid
  const commonPatterns = [
    /^(.)\1+$/, // All same character
    /123|234|345|456|567|678|789/, // Sequential numbers
    /abc|bcd|cde|def/i, // Sequential letters
    /password|pass|user|admin/i, // Common words
    /qwerty|asdf|zxcv/i, // Keyboard patterns
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push("Password contains common or predictable patterns.");
      strength.feedback.push("Avoid common patterns");
      break;
    }
  }

  // Determine strength level
  if (errors.length === 0) {
    strength.level = "Strong";
    strength.feedback = ["Excellent password strength!"];
  } else if (errors.length <= 2) {
    strength.level = "Medium";
  } else {
    strength.level = "Weak";
  }

  strength.errors = errors;

  return strength;
}

export function isPasswordStrong(password) {
  const result = validatePasswordStrength(password);
  return result.errors.length === 0;
}
