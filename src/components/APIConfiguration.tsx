import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, Save, Settings, ExternalLink, DollarSign, Clock, Zap, Info } from 'lucide-react';

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

  useEffect(() => {
    // Load keys from localStorage on component mount
    const savedKeys = localStorage.getItem('llm-lab-api-keys');
    if (savedKeys) {
      try {
        const parsedKeys = JSON.parse(savedKeys);
        setKeys(parsedKeys);
        onKeysUpdate(parsedKeys);
      } catch (error) {
        console.error('Failed to parse saved API keys:', error);
      }
    }
  }, [onKeysUpdate]);

  const handleKeyChange = (provider: keyof APIKeys, value: string) => {
    const newKeys = { ...keys, [provider]: value };
    setKeys(newKeys);
    setHasUnsavedChanges(true);
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const saveKeys = () => {
    localStorage.setItem('llm-lab-api-keys', JSON.stringify(keys));
    onKeysUpdate(keys);
    setHasUnsavedChanges(false);
  };

  const clearKeys = () => {
    const emptyKeys = {
      openai: '',
      anthropic: '',
      google: '',
      huggingface: '',
      mistral: ''
    };
    setKeys(emptyKeys);
    localStorage.removeItem('llm-lab-api-keys');
    onKeysUpdate(emptyKeys);
    setHasUnsavedChanges(false);
  };

  const getProviderStatus = (key: string) => {
    return key.length > 0 ? 'configured' : 'missing';
  };

  const getStatusIcon = (status: string) => {
    return status === 'configured' ? 
      <CheckCircle className="h-4 w-4 text-green-400" /> : 
      <AlertCircle className="h-4 w-4 text-red-400" />;
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
                    <li>• API keys are stored locally in your browser - they never leave your device</li>
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
                      {getStatusIcon(getProviderStatus(keys[provider.key]))}
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
                    placeholder={provider.placeholder}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {keys[provider.key] && (
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
                  <span>API keys are stored locally and never sent to our servers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>All communications go directly to the respective AI providers</span>
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
                  disabled={!hasUnsavedChanges}
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
                      getProviderStatus(keys[provider.key]) === 'configured' 
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