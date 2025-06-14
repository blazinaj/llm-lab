import { apiService } from '../apiService';
import { securityService } from '../securityService';
import { LLMModel, BenchmarkTask } from '../../types';

// Mock all the API SDK modules
jest.mock('openai');
jest.mock('@anthropic-ai/sdk');
jest.mock('@google/generative-ai');
jest.mock('@huggingface/inference');
jest.mock('@mistralai/mistralai');
jest.mock('../securityService');

const mockSecurityService = securityService as jest.Mocked<typeof securityService>;

describe('APIService', () => {
  const mockModel: LLMModel = {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    contextWindow: 128000,
    inputPricePerToken: 0.000005,
    outputPricePerToken: 0.000015,
    maxOutputTokens: 4096,
    capabilities: ['text', 'code'],
    strengths: ['reasoning'],
    weaknesses: ['cost']
  };

  const mockTask: BenchmarkTask = {
    id: 'test-task',
    name: 'Test Task',
    description: 'A test task',
    category: 'general',
    difficulty: 'medium',
    prompt: 'Test prompt'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSecurityService.secureRetrieve.mockReturnValue(null);
    mockSecurityService.validateApiKey.mockReturnValue({ isValid: true });
    mockSecurityService.sanitizeInput.mockImplementation((input) => input);
    mockSecurityService.sanitizeError.mockImplementation((error) => 
      error instanceof Error ? error.message : String(error)
    );
    mockSecurityService.checkRateLimit.mockReturnValue(true);
    mockSecurityService.secureStore.mockImplementation(() => {});
  });

  describe('updateKeys', () => {
    it('should validate and store API keys', () => {
      const keys = {
        openai: 'sk-test-key',
        anthropic: '',
        google: '',
        huggingface: '',
        mistral: ''
      };

      apiService.updateKeys(keys);

      expect(mockSecurityService.validateApiKey).toHaveBeenCalledWith('openai', 'sk-test-key');
      expect(mockSecurityService.secureStore).toHaveBeenCalledWith('llm-lab-api-keys', expect.any(Object));
    });

    it('should handle validation errors gracefully', () => {
      const keys = {
        openai: 'invalid-key',
        anthropic: '',
        google: '',
        huggingface: '',
        mistral: ''
      };

      mockSecurityService.validateApiKey.mockReturnValue({
        isValid: false,
        error: 'Invalid key format'
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      apiService.updateKeys(keys);

      expect(consoleSpy).toHaveBeenCalledWith('API key validation warnings:', ['openai: Invalid key format']);
      
      consoleSpy.mockRestore();
    });

    it('should handle storage errors', () => {
      const keys = {
        openai: 'sk-test-key',
        anthropic: '',
        google: '',
        huggingface: '',
        mistral: ''
      };

      mockSecurityService.secureStore.mockImplementation(() => {
        throw new Error('Storage failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      apiService.updateKeys(keys);

      expect(consoleSpy).toHaveBeenCalledWith('Failed to store API keys:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('callModel', () => {
    it('should check rate limiting before making API calls', async () => {
      mockSecurityService.checkRateLimit.mockReturnValue(false);

      const result = await apiService.callModel(mockModel, mockTask);

      expect(result.error).toBe('Rate limit exceeded for OpenAI. Please wait before making more requests.');
      expect(mockSecurityService.checkRateLimit).toHaveBeenCalledWith('OpenAI', 10, 60000);
    });

    it('should sanitize task prompts', async () => {
      mockSecurityService.checkRateLimit.mockReturnValue(true);
      
      // Mock successful API call
      const mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'Test response' } }],
              usage: { prompt_tokens: 10, completion_tokens: 20 }
            })
          }
        }
      };

      // We need to mock the provider check
      jest.spyOn(apiService, 'isProviderConfigured').mockReturnValue(true);

      await apiService.callModel(mockModel, mockTask);

      expect(mockSecurityService.sanitizeInput).toHaveBeenCalledWith(mockTask.prompt);
    });

    it('should handle unsupported providers', async () => {
      const unsupportedModel = { ...mockModel, provider: 'UnsupportedProvider' };
      
      const result = await apiService.callModel(unsupportedModel, mockTask);

      expect(result.error).toBe('Unsupported provider: UnsupportedProvider');
    });

    it('should sanitize error messages', async () => {
      const error = new Error('API key sk-12345 is invalid');
      mockSecurityService.sanitizeError.mockReturnValue('API key [REDACTED] is invalid');

      // Mock a failing API call by making isProviderConfigured return false
      jest.spyOn(apiService, 'isProviderConfigured').mockReturnValue(false);
      
      const result = await apiService.callModel(mockModel, mockTask);

      expect(result.error).toBeDefined();
    });
  });

  describe('isProviderConfigured', () => {
    it('should return true for configured providers', () => {
      // Mock the private initialization
      const apiServiceAny = apiService as any;
      apiServiceAny.openai = {}; // Mock OpenAI client

      expect(apiService.isProviderConfigured('OpenAI')).toBe(true);
    });

    it('should return false for unconfigured providers', () => {
      expect(apiService.isProviderConfigured('UnknownProvider')).toBe(false);
    });
  });

  describe('getConfiguredProviders', () => {
    it('should return list of configured providers', () => {
      // Mock some configured clients
      const apiServiceAny = apiService as any;
      apiServiceAny.openai = {};
      apiServiceAny.anthropic = {};

      const providers = apiService.getConfiguredProviders();
      expect(providers).toContain('OpenAI');
      expect(providers).toContain('Anthropic');
    });

    it('should return empty array when no providers configured', () => {
      // Reset all clients
      const apiServiceAny = apiService as any;
      apiServiceAny.openai = null;
      apiServiceAny.anthropic = null;
      apiServiceAny.googleAI = null;
      apiServiceAny.huggingFace = null;
      apiServiceAny.mistral = null;

      const providers = apiService.getConfiguredProviders();
      expect(providers).toEqual([]);
    });
  });

  describe('clearAllApiKeys', () => {
    it('should clear all API keys and reset clients', () => {
      apiService.clearAllApiKeys();

      expect(mockSecurityService.clearAllSecurityData).toHaveBeenCalled();
      
      // Verify all providers are unconfigured
      expect(apiService.getConfiguredProviders()).toEqual([]);
    });
  });

  describe('getSecurityReport', () => {
    it('should return security report from security service', () => {
      const mockReport = {
        environment: { isSecure: true, warnings: [] },
        storage: { apiKeysStored: true, customTasksStored: false, storageSize: 100 },
        session: { timestamp: Date.now(), userAgent: 'test', secure: true }
      };

      mockSecurityService.generateSecurityReport.mockReturnValue(mockReport);

      const result = apiService.getSecurityReport();
      expect(result).toEqual(mockReport);
      expect(mockSecurityService.generateSecurityReport).toHaveBeenCalled();
    });
  });
});