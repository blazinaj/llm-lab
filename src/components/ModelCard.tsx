import React from 'react';
import { LLMModel } from '../types';
import { ExternalLink, DollarSign, Clock, Database, Zap, Lock } from 'lucide-react';

interface ModelCardProps {
  model: LLMModel;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, isSelected = false, onClick, disabled = false }) => {
  const formatPrice = (price: number) => {
    return (price * 1000000).toFixed(2);
  };

  const getProviderLogo = (provider: string) => {
    const colors = {
      'OpenAI': 'bg-green-500',
      'Anthropic': 'bg-orange-500',
      'Google': 'bg-blue-500',
      'Meta': 'bg-purple-500',
      'Mistral AI': 'bg-red-500'
    };
    return colors[provider as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 ${
        disabled
          ? 'border-gray-700/50 opacity-60 cursor-not-allowed'
          : `cursor-pointer hover:scale-[1.02] ${
              isSelected
                ? 'border-blue-400 shadow-lg shadow-blue-500/20 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
            }`
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${disabled ? 'bg-gray-600' : getProviderLogo(model.provider)}`}></div>
          <div>
            <h3 className={`font-semibold ${disabled ? 'text-gray-500' : 'text-white'}`}>{model.name}</h3>
            <p className={`text-sm ${disabled ? 'text-gray-600' : 'text-gray-400'}`}>{model.provider}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {disabled && <Lock className="h-4 w-4 text-gray-600" />}
          <ExternalLink className={`h-4 w-4 ${disabled ? 'text-gray-600' : 'text-gray-500'}`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Database className={`h-4 w-4 ${disabled ? 'text-gray-600' : 'text-blue-400'}`} />
            <span className={`text-xs ${disabled ? 'text-gray-600' : 'text-gray-400'}`}>Context</span>
          </div>
          <p className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-white'}`}>
            {(model.contextWindow / 1000).toFixed(0)}K tokens
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Zap className={`h-4 w-4 ${disabled ? 'text-gray-600' : 'text-yellow-400'}`} />
            <span className={`text-xs ${disabled ? 'text-gray-600' : 'text-gray-400'}`}>Max Output</span>
          </div>
          <p className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-white'}`}>
            {(model.maxOutputTokens / 1000).toFixed(1)}K tokens
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className={`h-4 w-4 ${disabled ? 'text-gray-600' : 'text-green-400'}`} />
            <span className={`text-xs ${disabled ? 'text-gray-600' : 'text-gray-400'}`}>Input</span>
          </div>
          <span className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-white'}`}>
            ${formatPrice(model.inputPricePerToken)}/M
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className={`h-4 w-4 ${disabled ? 'text-gray-600' : 'text-red-400'}`} />
            <span className={`text-xs ${disabled ? 'text-gray-600' : 'text-gray-400'}`}>Output</span>
          </div>
          <span className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-white'}`}>
            ${formatPrice(model.outputPricePerToken)}/M
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className={`text-xs font-medium ${disabled ? 'text-gray-600' : 'text-gray-400'} mb-2 uppercase tracking-wider`}>
            Strengths
          </h4>
          <div className="flex flex-wrap gap-1">
            {model.strengths.slice(0, 2).map((strength, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs rounded-full ${
                  disabled 
                    ? 'bg-gray-700/30 text-gray-600' 
                    : 'bg-green-500/20 text-green-300'
                }`}
              >
                {strength}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className={`text-xs font-medium ${disabled ? 'text-gray-600' : 'text-gray-400'} mb-2 uppercase tracking-wider`}>
            Weaknesses
          </h4>
          <div className="flex flex-wrap gap-1">
            {model.weaknesses.slice(0, 2).map((weakness, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs rounded-full ${
                  disabled 
                    ? 'bg-gray-700/30 text-gray-600' 
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {weakness}
              </span>
            ))}
          </div>
        </div>
      </div>

      {disabled && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <Lock className="h-3 w-3" />
            <span>API key required to use this model</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelCard;