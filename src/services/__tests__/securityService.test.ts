import { securityService } from '../securityService';

describe('SecurityService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('validateApiKey', () => {
    it('should validate OpenAI API keys correctly', () => {
      expect(securityService.validateApiKey('openai', 'sk-1234567890abcdefghijklmnop')).toEqual({
        isValid: true
      });

      expect(securityService.validateApiKey('openai', 'invalid-key')).toEqual({
        isValid: false,
        error: 'Invalid openai API key format. Please check your key.'
      });

      expect(securityService.validateApiKey('openai', '')).toEqual({
        isValid: false,
        error: 'API key cannot be empty'
      });
    });

    it('should validate Anthropic API keys correctly', () => {
      const validKey = 'sk-ant-' + 'a'.repeat(95);
      expect(securityService.validateApiKey('anthropic', validKey)).toEqual({
        isValid: true
      });

      expect(securityService.validateApiKey('anthropic', 'sk-ant-short')).toEqual({
        isValid: false,
        error: 'Invalid anthropic API key format. Please check your key.'
      });
    });

    it('should validate Google API keys correctly', () => {
      const validKey = 'A'.repeat(40);
      expect(securityService.validateApiKey('google', validKey)).toEqual({
        isValid: true
      });

      expect(securityService.validateApiKey('google', 'short')).toEqual({
        isValid: false,
        error: 'Invalid google API key format. Please check your key.'
      });
    });

    it('should validate Hugging Face API keys correctly', () => {
      const validKey = 'hf_' + 'a'.repeat(34);
      expect(securityService.validateApiKey('huggingface', validKey)).toEqual({
        isValid: true
      });

      expect(securityService.validateApiKey('meta', validKey)).toEqual({
        isValid: true
      });
    });

    it('should validate Mistral API keys correctly', () => {
      const validKey = 'a'.repeat(32);
      expect(securityService.validateApiKey('mistral', validKey)).toEqual({
        isValid: true
      });

      expect(securityService.validateApiKey('mistralai', validKey)).toEqual({
        isValid: true
      });
    });

    it('should handle unknown providers gracefully', () => {
      expect(securityService.validateApiKey('unknown', 'any-key')).toEqual({
        isValid: true,
        warning: 'Unknown provider - cannot validate key format'
      });
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML and special characters', () => {
      expect(securityService.sanitizeInput('<script>alert("xss")</script>')).toBe(
        '<script>alert("xss")</script>'
      );

      expect(securityService.sanitizeInput('Hello "world" & \'test\'')).toBe(
        'Hello "world" & \'test''
      );

      expect(securityService.sanitizeInput('  spaced input  ')).toBe('spaced input');
    });

    it('should handle non-string inputs', () => {
      expect(securityService.sanitizeInput(null as any)).toBe('');
      expect(securityService.sanitizeInput(undefined as any)).toBe('');
      expect(securityService.sanitizeInput(123 as any)).toBe('');
      expect(securityService.sanitizeInput({} as any)).toBe('');
    });
  });

  describe('validateTaskData', () => {
    const validTask = {
      name: 'Test Task',
      prompt: 'Test prompt',
      description: 'Test description',
      category: 'general',
      difficulty: 'medium',
      expectedOutput: 'Test output'
    };

    it('should validate valid task data', () => {
      expect(securityService.validateTaskData(validTask)).toEqual({
        isValid: true
      });
    });

    it('should reject invalid or missing data', () => {
      expect(securityService.validateTaskData(null)).toEqual({
        isValid: false,
        error: 'Invalid task data format'
      });

      expect(securityService.validateTaskData({})).toEqual({
        isValid: false,
        error: 'name is required and cannot be empty'
      });

      expect(securityService.validateTaskData({ name: '', prompt: 'test' })).toEqual({
        isValid: false,
        error: 'name is required and cannot be empty'
      });

      expect(securityService.validateTaskData({ name: 'test', prompt: '' })).toEqual({
        isValid: false,
        error: 'prompt is required and cannot be empty'
      });
    });

    it('should enforce length limits', () => {
      expect(securityService.validateTaskData({
        ...validTask,
        name: 'a'.repeat(201)
      })).toEqual({
        isValid: false,
        error: 'Task name cannot exceed 200 characters'
      });

      expect(securityService.validateTaskData({
        ...validTask,
        prompt: 'a'.repeat(10001)
      })).toEqual({
        isValid: false,
        error: 'Task prompt cannot exceed 10,000 characters'
      });

      expect(securityService.validateTaskData({
        ...validTask,
        description: 'a'.repeat(501)
      })).toEqual({
        isValid: false,
        error: 'Task description cannot exceed 500 characters'
      });

      expect(securityService.validateTaskData({
        ...validTask,
        expectedOutput: 'a'.repeat(2001)
      })).toEqual({
        isValid: false,
        error: 'Expected output cannot exceed 2,000 characters'
      });
    });

    it('should validate category and difficulty values', () => {
      expect(securityService.validateTaskData({
        ...validTask,
        category: 'invalid'
      })).toEqual({
        isValid: false,
        error: 'Invalid task category'
      });

      expect(securityService.validateTaskData({
        ...validTask,
        difficulty: 'invalid'
      })).toEqual({
        isValid: false,
        error: 'Invalid difficulty level'
      });
    });
  });

  describe('secureStore and secureRetrieve', () => {
    it('should store and retrieve data with integrity checks', () => {
      const testData = { key1: 'value1', key2: 'value2' };
      
      securityService.secureStore('test-key', testData);
      const retrieved = securityService.secureRetrieve('test-key');
      
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      expect(securityService.secureRetrieve('non-existent')).toBeNull();
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('test-corrupted', 'invalid-json');
      expect(securityService.secureRetrieve('test-corrupted')).toBeNull();
    });

    it('should validate data integrity with checksum', () => {
      const testData = { test: 'data' };
      securityService.secureStore('test-integrity', testData);
      
      // Manually corrupt the data
      const stored = JSON.parse(localStorage.getItem('test-integrity')!);
      stored.checksum = 'corrupted';
      localStorage.setItem('test-integrity', JSON.stringify(stored));
      
      expect(securityService.secureRetrieve('test-integrity')).toBeNull();
      expect(localStorage.getItem('test-integrity')).toBeNull(); // Should be cleared
    });

    it('should handle expired data', () => {
      const testData = { test: 'data' };
      securityService.secureStore('test-expired', testData);
      
      // Manually set old timestamp
      const stored = JSON.parse(localStorage.getItem('test-expired')!);
      stored.timestamp = Date.now() - (31 * 24 * 60 * 60 * 1000); // 31 days ago
      localStorage.setItem('test-expired', JSON.stringify(stored));
      
      expect(securityService.secureRetrieve('test-expired')).toBeNull();
    });

    it('should handle storage errors gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage full');
      });

      expect(() => securityService.secureStore('test-error', {})).toThrow('Storage operation failed');
      
      localStorage.setItem = originalSetItem;
    });
  });

  describe('sanitizeError', () => {
    it('should sanitize error messages with sensitive information', () => {
      const sensitiveError = new Error('API key sk-1234567890 is invalid');
      expect(securityService.sanitizeError(sensitiveError)).toBe('API key API_KEY_REDACTED is invalid');

      const bearerError = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 token invalid';
      expect(securityService.sanitizeError(bearerError)).toBe('BEARER_TOKEN_REDACTED token invalid');
    });

    it('should handle different error types', () => {
      expect(securityService.sanitizeError('string error')).toBe('string error');
      expect(securityService.sanitizeError(null)).toBe('An unknown error occurred');
      expect(securityService.sanitizeError(undefined)).toBe('An unknown error occurred');
      expect(securityService.sanitizeError({})).toBe('An unexpected error occurred');
    });
  });

  describe('checkEnvironmentSecurity', () => {
    it('should detect insecure HTTP in production', () => {
      Object.defineProperty(window, 'location', {
        value: { protocol: 'http:', hostname: 'example.com' },
        writable: true
      });

      const result = securityService.checkEnvironmentSecurity();
      expect(result.isSecure).toBe(false);
      expect(result.warnings).toContain('Application is not served over HTTPS. API keys may be vulnerable to interception.');
    });

    it('should allow HTTP on localhost', () => {
      Object.defineProperty(window, 'location', {
        value: { protocol: 'http:', hostname: 'localhost' },
        writable: true
      });

      const result = securityService.checkEnvironmentSecurity();
      expect(result.isSecure).toBe(true);
    });

    it('should detect CSP implementation', () => {
      // Add CSP meta tag
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Security-Policy');
      meta.setAttribute('content', 'default-src self');
      document.head.appendChild(meta);

      const result = securityService.checkEnvironmentSecurity();
      expect(result.warnings).not.toContain('Content Security Policy not detected. XSS protection may be limited.');

      document.head.removeChild(meta);
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests within rate limit', () => {
      expect(securityService.checkRateLimit('test-provider', 5, 60000)).toBe(true);
      expect(securityService.checkRateLimit('test-provider', 5, 60000)).toBe(true);
    });

    it('should block requests when rate limit exceeded', () => {
      const provider = 'rate-limit-test';
      
      // Use up the rate limit
      for (let i = 0; i < 5; i++) {
        expect(securityService.checkRateLimit(provider, 5, 60000)).toBe(true);
      }
      
      // Should be blocked now
      expect(securityService.checkRateLimit(provider, 5, 60000)).toBe(false);
    });

    it('should reset rate limit after time window', () => {
      const provider = 'reset-test';
      
      // Use up the rate limit with short window
      for (let i = 0; i < 3; i++) {
        expect(securityService.checkRateLimit(provider, 3, 1)).toBe(true);
      }
      
      // Should be blocked
      expect(securityService.checkRateLimit(provider, 3, 1)).toBe(false);
      
      // Wait for reset (simulate time passage)
      setTimeout(() => {
        expect(securityService.checkRateLimit(provider, 3, 1)).toBe(true);
      }, 2);
    });
  });

  describe('clearAllSecurityData', () => {
    it('should clear all security-related data', () => {
      localStorage.setItem('llm-lab-api-keys', 'test');
      localStorage.setItem('llm-lab-custom-tasks', 'test');
      localStorage.setItem('other-data', 'should-remain');

      securityService.clearAllSecurityData();

      expect(localStorage.getItem('llm-lab-api-keys')).toBeNull();
      expect(localStorage.getItem('llm-lab-custom-tasks')).toBeNull();
      expect(localStorage.getItem('other-data')).toBe('should-remain');
    });
  });

  describe('generateSecurityReport', () => {
    it('should generate comprehensive security report', () => {
      // Store some test data
      securityService.secureStore('llm-lab-api-keys', { openai: 'test-key' });
      securityService.secureStore('llm-lab-custom-tasks', [{ id: '1', name: 'test' }]);

      const report = securityService.generateSecurityReport();

      expect(report).toHaveProperty('environment');
      expect(report).toHaveProperty('storage');
      expect(report).toHaveProperty('session');

      expect(report.storage.apiKeysStored).toBe(true);
      expect(report.storage.customTasksStored).toBe(true);
      expect(report.storage.storageSize).toBeGreaterThan(0);

      expect(report.session.timestamp).toBeCloseTo(Date.now(), -2);
      expect(report.session.userAgent).toBeDefined();
      expect(report.session.secure).toBeDefined();
    });
  });
});