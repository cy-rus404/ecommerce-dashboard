// Security utilities for production
export class Security {
  // Input sanitization
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential XSS
      .replace(/['"]/g, '') // Remove quotes
      .trim()
      .substring(0, 1000); // Limit length
  }

  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 100;
  }

  // Password strength validation
  static isStrongPassword(password: string): boolean {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password);
  }

  // Rate limiting check
  static checkRateLimit(key: string, maxRequests: number = 10): boolean {
    if (typeof window === 'undefined') return true;
    
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const requests = JSON.parse(localStorage.getItem(`rate_${key}`) || '[]');
    
    // Filter recent requests
    const recentRequests = requests.filter((time: number) => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    localStorage.setItem(`rate_${key}`, JSON.stringify(recentRequests));
    
    return true;
  }

  // CSRF token generation
  static generateCSRFToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Secure headers for API routes
  static getSecureHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }

  // Log security events
  static logSecurityEvent(event: string, details: any) {
    console.warn(`[SECURITY] ${event}:`, details);
    // In production, send to monitoring service
  }
}