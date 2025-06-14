import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, Save, Settings, ExternalLink, DollarSign, Clock, Zap, Info, Shield, AlertTriangle } from 'lucide-react';
import { securityService } from '../services/securityService';

interface APIKeys {
  openai: string;
  anthropic: string;
  google: string;
  huggingface: string;
  mistral: string;
}

interface APIConfigurationProps {
  onKeysUpdate: (keys: APIKeys) => void;
}

const APIConfiguration: React.FC<APIConfigurationProps> = ({ onKeysUpdate }) => {
  const [keys, setKeys] = useState<APIKeys>({
    openai: '',
    anthropic: '',
    google: '',
    huggingface: '',
    mistral: ''
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDetailedGuide, setShowDetailedGuide] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [securityStatus, setSecurityStatus] = useState<{ isSecure: boolean; warnings: string[] }>({
    isSecure: true,
    warnings: []
  });

  useEffect(() => {
    // Load keys from secure storage on component mount
    loadStoredKeys();
    
    // Check security status
    checkSecurityStatus();
  }, []);

  const loadStoredKeys = () => {
    try {
      const savedKeys = securityService.secureRetrieve('llm-lab-api-keys');
      if (savedKeys) {
        setKeys(savedKeys);
        onKeysUpdate(savedKeys);
      }
    } catch (error) {
      console.error('Failed to load saved API keys:', error);
      setSecurityStatus(prev => ({
        ...prev,
        warnings: [...prev.warnings, 'Failed to load stored API keys. Storage may be corrupted.']
      }));
    }
  };

  const checkSecurityStatus = () => {
    const status = securityService.checkEnvironmentSecurity();
    setSecurityStatus(status);
  };

  const validateApiKey = (provider: string, value: string) => {
    if (!value.trim()) {
      setValidationErrors(prev => ({ ...prev, [provider]: '' }));
      return;
    }

    const validation = securityService.validateApiKey(provider, value);
    if (!validation.isValid) {
      setValidationErrors(prev => ({ ...prev, [provider]: validation.error || 'Invalid key format' }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[provider];
        return newErrors;
      });
    }
  };

  const handleKeyChange = (provider: keyof APIKeys, value: string) => {
    // Sanitize input to prevent injection attacks
    const sanitizedValue = securityService.sanitizeInput(value);
    
    const newKeys = { ...keys, [provider]: sanitizedValue };
    setKeys(newKeys);
    setHasUnsavedChanges(true);
    
    // Validate the key format
    validateApiKey(provider, sanitizedValue);
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const saveKeys = () => {
    try {
      // Validate all keys before saving
      const errors: Record<string, string> = {};
      let hasErrors = false;

      Object.entries(keys).forEach(([provider, key]) => {
        if (key.trim()) {
          const validation = securityService.validateApiKey(provider, key);
          if (!validation.isValid) {
            errors[provider] = validation.error || 'Invalid key format';
            hasErrors = true;
          }
        }
      });

      if (hasErrors) {
        setValidationErrors(errors);
        return;
      }

      // Save using secure storage
      securityService.secureStore('llm-lab-api-keys', keys);
      onKeysUpdate(keys);
      setHasUnsavedChanges(false);
      setValidationErrors({});

      // Refresh security status
      checkSecurityStatus();
    } catch (error) {
      console.error('Failed to save API keys:', error);
      alert('Failed to save API keys. Please try again.');
    }
  };

  const clearKeys = () => {
    if (confirm('Are you sure you want to clear all API keys? This action cannot be undone.')) {
      const emptyKeys = {
        openai: '',
        anthropic: '',
        google: '',
        huggingface: '',
        mistral: ''
      };
      setKeys(emptyKeys);
      setValidationErrors({});
      securityService.clearAllSecurityData();
      onKeysUpdate(emptyKeys);
      setHasUnsavedChanges(false);
    }
  };

  const getProviderStatus = (key: string) => {
    return key.length > 0 ? 'configured' : 'missing';
  };

  const getStatusIcon = (status: string, provider: string) => {
    if (validationErrors[provider]) {
      return <AlertCircle className="h-4 w-4 text-red-400" />;
    }
    return status === 'configured' ? 
      <CheckCircle className="h-4 w-4 text-green-400" /> : 
      <AlertCircle className="h-4 w-4 text-gray-400" />;
  };

  const providers = [
    { 
      key: 'openai' as keyof APIKeys, 
      name: 'OpenAI', 
      placeholder: 'sk-proj-...',
      url: 'https://platform.openai.com/api-keys',
      models: ['GPT-4o', 'GPT-4o Mini', 'GPT-4 Turbo', 'GPT-4', 'GPT-3.5 Turbo'],
      freeTier: '$5 credit for new accounts',
      pricing: '$0.15-$60 per 1M tokens',
      specialty: 'General purpose, excellent reasoning'
    },
    { 
      key: 'anthropic' as keyof APIKeys, 
      name: 'Anthropic', 
      placeholder: 'sk-ant-...',
      url: 'https://console.anthropic.com/settings/keys',
      models: ['Claude 3.5 Sonnet', 'Claude 3 Opus', 'Claude 3 Sonnet', 'Claude 3 Haiku'],
      freeTier: '$5 credit for new accounts',
      pricing: '$0.25-$75 per 1M tokens',
      specialty: 'Excellent reasoning, large context windows'
    },
    { 
      key: 'google' as keyof APIKeys, 
      name: 'Google AI', 
      placeholder: 'AI...',
      url: 'https://aistudio.google.com/app/apikey',
      models: ['Gemini 1.5 Pro', 'Gemini 1.5 Flash', 'Gemini Pro'],
      freeTier: 'Generous free tier available',
      pricing: '$0.075-$10.50 per 1M tokens',
      specialty: 'Massive context windows, multimodal'
    },
    { 
      key: 'huggingface' as keyof APIKeys, 
      name: 'Hugging Face', 
      placeholder: 'hf_...',
      url: 'https://huggingface.co/settings/tokens',
      models: ['Llama 3.1 405B', 'Llama 3.1 70B', 'Llama 3.1 8B', 'Llama 2 70B'],
      freeTier: 'Free tier with rate limits',
      pricing: '$0.2-$15 per 1M tokens',
      specialty: 'Open source models, cost-effective'
    },
    { 
      key: 'mistral' as keyof APIKeys, 
      name: 'Mistral AI', 
      placeholder: 'mi-...',
      url: 'https://console.mistral.ai/api-keys/',
      models: ['Mistral Large 2', 'Mistral Large', 'Mistral Medium', 'Mistral Small', 'Codestral'],
      freeTier: '$5 credit for new accounts',
      pricing: '$3-$24 per 1M tokens',
      specialty: 'European provider, strong multilingual'
    }
  ];

  const configuredCount = Object.values(keys).filter(key => key.length > 0).length;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
      <div 
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Key className="h-6 w-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">API Configuration</h2>
              <p className="text-gray-400 text-sm">
                {configuredCount} of {providers.length} providers configured
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {!securityStatus.isSecure && (
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            )}
            {hasUnsavedChanges && (
              <span className="text-yellow-400 text-sm">Unsaved changes</span>
            )}
            <Settings className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : ''
            }`} />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-700 p-6">
          <div className="space-y-6">
            {/* Security Status */}
            {(!securityStatus.isSecure || securityStatus.warnings.length > 0) && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-yellow-400 font-medium">Security Status</h3>
                </div>
                <div className="space-y-2">
                  {securityStatus.warnings.map((warning, index) => (
                    <div key={index} className="text-yellow-200 text-sm flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="h-5 w-5 text-blue-400" />
                <h3 className="text-blue-400 font-medium">Security & Privacy</h3>
              </div>
              <div className="text-blue-200 text-sm space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>API keys are stored locally in your browser and validated before use</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Direct communication with AI providers - no proxy servers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Content Security Policy prevents unauthorized access</span>
                </div>
              </div>
            </div>

            {/* Quick Guide Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Need help getting started?</span>
              </div>
              <button
                onClick={() => setShowDetailedGuide(!showDetailedGuide)}
                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-sm"
              >
                {showDetailedGuide ? 'Hide Guide' : 'Show Setup Guide'}
              </button>
            </div>

            {/* Detailed Setup Guide */}
            {showDetailedGuide && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">API Setup Guide</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {providers.map((provider) => (
                    <div key={provider.key} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">{provider.name}</h4>
                        <a
                          href={provider.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <span className="text-sm">Get API Key</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          <span className="text-gray-300">
                            <strong>Pricing:</strong> {provider.pricing}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <span className="text-gray-300">
                            <strong>Free Tier:</strong> {provider.freeTier}
                          </span>
                        </div>
                        
                        <div className="text-gray-400">
                          <strong>Models:</strong> {provider.models.slice(0, 3).join(', ')}
                          {provider.models.length > 3 && ` +${provider.models.length - 3} more`}
                        </div>
                        
                        <div className="text-gray-400">
                          <strong>Best for:</strong> {provider.specialty}
                        </div>
                      </div>

                      {/* Quick Setup Steps */}
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <p className="text-xs text-gray-400 mb-2"><strong>Quick Setup:</strong></p>
                        <ol className="text-xs text-gray-400 space-y-1">
                          <li>1. Click "Get API Key" above</li>
                          <li>2. Sign up or log in to {provider.name}</li>
                          <li>3. Navigate to API keys section</li>
                          <li>4. Create a new API key</li>
                          <li>5. Copy and paste it below</li>
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h4 className="text-green-400 font-medium mb-2">💡 Pro Tips:</h4>
                  <ul className="text-sm text-green-200 space-y-1">
                    <li>• Start with <strong>OpenAI GPT-4o Mini</strong> or <strong>Google Gemini Flash</strong> for cost-effective testing</li>
                    <li>• <strong>Anthropic Claude 3.5 Sonnet</strong> excels at reasoning and coding tasks</li>
                    <li>• <strong>Google Gemini 1.5 Pro</strong> has the largest context window (2M tokens)</li>
                    <li>• Most providers offer $5 free credits to start - no payment required initially</li>
                    <li>• API keys are validated for format and stored securely in your browser</li>
                  </ul>
                </div>
              </div>
            )}

            {/* API Keys Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {providers.map((provider) => (
                <div key={provider.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                      {getStatusIcon(getProviderStatus(keys[provider.key]), provider.key)}
                      <span>{provider.name}</span>
                      <a
                        href={provider.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </label>
                    <button
                      onClick={() => toggleKeyVisibility(provider.key)}
                      className="text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showKeys[provider.key] ? 
                        <EyeOff className="h-4 w-4" /> : 
                        <Eye className="h-4 w-4" />
                      }
                    </button>
                  </div>
                  <input
                    type={showKeys[provider.key] ? 'text' : 'password'}
                    value={keys[provider.key]}
                    onChange={(e) => handleKeyChange(provider.key, e.target.value)}
                    onBlur={() => validateApiKey(provider.key, keys[provider.key])}
                    placeholder={provider.placeholder}
                    className={`w-full px-4 py-2 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      validationErrors[provider.key] 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-600 focus:ring-blue-500 focus:border-transparent'
                    }`}
                  />
                  {validationErrors[provider.key] && (
                    <div className="flex items-center space-x-2 text-red-400 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>{validationErrors[provider.key]}</span>
                    </div>
                  )}
                  {keys[provider.key] && !validationErrors[provider.key] && (
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>{provider.models.length} models available</span>
                      <span>{provider.pricing}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>All API keys are validated and stored securely</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Communications go directly to AI providers</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={clearKeys}
                  className="px-4 py-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={saveKeys}
                  disabled={!hasUnsavedChanges || Object.keys(validationErrors).length > 0}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Keys</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Available Models Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                {providers.map((provider) => (
                  <div key={provider.key} className="space-y-1">
                    <div className={`text-lg font-bold ${
                      getProviderStatus(keys[provider.key]) === 'configured' && !validationErrors[provider.key]
                        ? 'text-green-400' 
                        : 'text-gray-500'
                    }`}>
                      {provider.models.length}
                    </div>
                    <div className="text-xs text-gray-400">{provider.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIConfiguration;