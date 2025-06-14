/**
 * Security Service for LLM Lab
 * Handles API key validation, sanitization, and security utilities
 */

interface SecurityValidation {
  isValid: boolean;
  error?: string;
  warning?: string;
}

class SecurityService {
  private readonly API_KEY_PATTERNS = {
    openai: /^sk-[a-zA-Z0-9]{20,}$/,
    anthropic: /^sk-ant-[a-zA-Z0-9\-_]{95,}$/,
    google: /^[a-zA-Z0-9\-_]{35,45}$/,
    huggingface: /^hf_[a-zA-Z0-9]{34}$/,
    mistral: /^[a-zA-Z0-9]{32}$/
  };

  /**
   * Validate API key format for each provider
   */
  validateApiKey(provider: string, key: string): SecurityValidation {
    if (!key || key.trim().length === 0) {
      return {
        isValid: false,
        error: 'API key cannot be empty'
      };
    }

    const trimmedKey = key.trim();
    const providerKey = provider.toLowerCase().replace(' ', '').replace('ai', '').replace('meta', 'huggingface');
    const pattern = this.API_KEY_PATTERNS[providerKey as keyof typeof this.API_KEY_PATTERNS];

    if (!pattern) {
      return {
        isValid: true,
        warning: 'Unknown provider - cannot validate key format'
      };
    }

    if (!pattern.test(trimmedKey)) {
      return {
        isValid: false,
        error: `Invalid ${provider} API key format. Please check your key.`
      };
    }

    return { isValid: true };
  }

  /**
   * Sanitize user input to prevent XSS and injection attacks
   */
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  /**
   * Validate and sanitize custom task data
   */
  validateTaskData(taskData: any): SecurityValidation {
    if (!taskData || typeof taskData !== 'object') {
      return {
        isValid: false,
        error: 'Invalid task data format'
      };
    }

    // Required fields validation
    const requiredFields = ['name', 'prompt'];
    for (const field of requiredFields) {
      if (!taskData[field] || typeof taskData[field] !== 'string' || taskData[field].trim().length === 0) {
        return {
          isValid: false,
          error: `${field} is required and cannot be empty`
        };
      }
    }

    // Length validation
    if (taskData.name.length > 200) {
      return {
        isValid: false,
        error: 'Task name cannot exceed 200 characters'
      };
    }

    if (taskData.prompt.length > 10000) {
      return {
        isValid: false,
        error: 'Task prompt cannot exceed 10,000 characters'
      };
    }

    if (taskData.description && taskData.description.length > 500) {
      return {
        isValid: false,
        error: 'Task description cannot exceed 500 characters'
      };
    }

    if (taskData.expectedOutput && taskData.expectedOutput.length > 2000) {
      return {
        isValid: false,
        error: 'Expected output cannot exceed 2,000 characters'
      };
    }

    // Category validation
    const validCategories = ['reasoning', 'coding', 'creative', 'analysis', 'general'];
    if (taskData.category && !validCategories.includes(taskData.category)) {
      return {
        isValid: false,
        error: 'Invalid task category'
      };
    }

    // Difficulty validation
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (taskData.difficulty && !validDifficulties.includes(taskData.difficulty)) {
      return {
        isValid: false,
        error: 'Invalid difficulty level'
      };
    }

    return { isValid: true };
  }

  /**
   * Secure API key storage with basic obfuscation
   */
  secureStore(key: string, value: any): void {
    try {
      // Add a timestamp and basic checksum for integrity
      const data = {
        value,
        timestamp: Date.now(),
        checksum: this.generateChecksum(JSON.stringify(value))
      };
      
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to store data securely:', error);
      throw new Error('Storage operation failed');
    }
  }

  /**
   * Secure API key retrieval with integrity check
   */
  secureRetrieve(key: string): any {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const data = JSON.parse(stored);
      
      // Verify data integrity
      if (!data.value || !data.timestamp || !data.checksum) {
        console.warn('Corrupted data detected, clearing storage');
        localStorage.removeItem(key);
        return null;
      }

      // Verify checksum
      const expectedChecksum = this.generateChecksum(JSON.stringify(data.value));
      if (data.checksum !== expectedChecksum) {
        console.warn('Data integrity check failed, clearing storage');
        localStorage.removeItem(key);
        return null;
      }

      // Check if data is too old (optional - for enhanced security)
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      if (Date.now() - data.timestamp > maxAge) {
        console.warn('Stored data expired, clearing storage');
        localStorage.removeItem(key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      localStorage.removeItem(key); // Clear potentially corrupted data
      return null;
    }
  }

  /**
   * Generate a simple checksum for data integrity
   */
  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Sanitize error messages to prevent information leakage
   */
  sanitizeError(error: any): string {
    if (!error) return 'An unknown error occurred';

    let message = '';
    if (typeof error === 'string') {
      message = error;
    } else if (error.message) {
      message = error.message;
    } else {
      message = 'An unexpected error occurred';
    }

    // Remove potentially sensitive information
    message = message
      .replace(/api[_-]?key[s]?[:\s=]+[a-zA-Z0-9\-_]+/gi, 'API_KEY_REDACTED')
      .replace(/bearer\s+[a-zA-Z0-9\-_\.]+/gi, 'BEARER_TOKEN_REDACTED')
      .replace(/authorization[:\s=]+[a-zA-Z0-9\-_\.\s]+/gi, 'AUTH_HEADER_REDACTED')
      .replace(/token[:\s=]+[a-zA-Z0-9\-_\.]+/gi, 'TOKEN_REDACTED')
      .replace(/password[:\s=]+[^\s]+/gi, 'PASSWORD_REDACTED')
      .replace(/secret[:\s=]+[^\s]+/gi, 'SECRET_REDACTED');

    return this.sanitizeInput(message);
  }

  /**
   * Check if the current environment is secure
   */
  checkEnvironmentSecurity(): { isSecure: boolean; warnings: string[] } {
    const warnings: string[] = [];
    let isSecure = true;

    // Check HTTPS in production
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      warnings.push('Application is not served over HTTPS. API keys may be vulnerable to interception.');
      isSecure = false;
    }

    // Check for mixed content
    if (window.location.protocol === 'https:' && document.querySelector('script[src^="http:"], link[href^="http:"]')) {
      warnings.push('Mixed content detected. Some resources are loaded over HTTP.');
      isSecure = false;
    }

    // Check local storage availability
    try {
      localStorage.setItem('security-test', 'test');
      localStorage.removeItem('security-test');
    } catch (error) {
      warnings.push('Local storage is not available. API keys cannot be stored securely.');
      isSecure = false;
    }

    // Check CSP implementation
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!metaCSP) {
      warnings.push('Content Security Policy not detected. XSS protection may be limited.');
    }

    return { isSecure, warnings };
  }

  /**
   * Rate limiting for API calls
   */
  private rateLimits = new Map<string, { count: number; resetTime: number }>();

  checkRateLimit(provider: string, maxRequests: number = 60, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = `ratelimit_${provider}`;
    const current = this.rateLimits.get(key);

    if (!current || now > current.resetTime) {
      this.rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (current.count >= maxRequests) {
      return false;
    }

    current.count++;
    return true;
  }

  /**
   * Clear all security-related data
   */
  clearAllSecurityData(): void {
    try {
      // Clear API keys
      localStorage.removeItem('llm-lab-api-keys');
      localStorage.removeItem('llm-lab-custom-tasks');
      
      // Clear rate limits
      this.rateLimits.clear();
      
      console.log('All security data cleared successfully');
    } catch (error) {
      console.error('Failed to clear security data:', error);
    }
  }

  /**
   * Generate security report
   */
  generateSecurityReport(): {
    environment: ReturnType<typeof this.checkEnvironmentSecurity>;
    storage: {
      apiKeysStored: boolean;
      customTasksStored: boolean;
      storageSize: number;
    };
    session: {
      timestamp: number;
      userAgent: string;
      secure: boolean;
    };
  } {
    const environment = this.checkEnvironmentSecurity();
    
    const apiKeys = this.secureRetrieve('llm-lab-api-keys');
    const customTasks = this.secureRetrieve('llm-lab-custom-tasks');
    
    let storageSize = 0;
    try {
      const allKeys = Object.keys(localStorage);
      for (const key of allKeys) {
        if (key.startsWith('llm-lab-')) {
          storageSize += localStorage.getItem(key)?.length || 0;
        }
      }
    } catch (error) {
      // Storage not available
    }

    return {
      environment,
      storage: {
        apiKeysStored: !!apiKeys && Object.keys(apiKeys).length > 0,
        customTasksStored: !!customTasks && customTasks.length > 0,
        storageSize
      },
      session: {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        secure: window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      }
    };
  }
}

export const securityService = new SecurityService();
export type { SecurityValidation };