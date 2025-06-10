import { LLMModel } from '../types';

export const llmModels: LLMModel[] = [
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    contextWindow: 128000,
    inputPricePerToken: 0.000005,
    outputPricePerToken: 0.000015,
    maxOutputTokens: 4096,
    capabilities: ['text', 'code', 'reasoning', 'analysis', 'multimodal'],
    strengths: ['Latest model', 'Excellent reasoning', 'Multimodal', 'Fast responses'],
    weaknesses: ['Premium pricing', 'Rate limits']
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    contextWindow: 128000,
    inputPricePerToken: 0.00000015,
    outputPricePerToken: 0.0000006,
    maxOutputTokens: 4096,
    capabilities: ['text', 'code', 'reasoning', 'fast-response'],
    strengths: ['Very cost-effective', 'Fast responses', 'Good performance', 'Large context'],
    weaknesses: ['Less capable than full GPT-4o', 'Limited complex reasoning']
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    contextWindow: 128000,
    inputPricePerToken: 0.00001,
    outputPricePerToken: 0.00003,
    maxOutputTokens: 4096,
    capabilities: ['text', 'code', 'reasoning', 'analysis'],
    strengths: ['Complex reasoning', 'Code generation', 'Creative writing', 'Large context'],
    weaknesses: ['High cost', 'Slower than GPT-4o']
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    contextWindow: 8192,
    inputPricePerToken: 0.00003,
    outputPricePerToken: 0.00006,
    maxOutputTokens: 4096,
    capabilities: ['text', 'code', 'reasoning', 'analysis'],
    strengths: ['Excellent quality', 'Proven reliability', 'Strong reasoning'],
    weaknesses: ['Very high cost', 'Smaller context', 'Slower responses']
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    contextWindow: 16385,
    inputPricePerToken: 0.0000015,
    outputPricePerToken: 0.000002,
    maxOutputTokens: 4096,
    capabilities: ['text', 'code', 'general'],
    strengths: ['Fast responses', 'Cost-effective', 'General purpose', 'Reliable'],
    weaknesses: ['Limited reasoning', 'Less creative', 'Basic capabilities']
  },
  
  // Anthropic Models
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    contextWindow: 200000,
    inputPricePerToken: 0.000003,
    outputPricePerToken: 0.000015,
    maxOutputTokens: 4096,
    capabilities: ['text', 'code', 'reasoning', 'analysis', 'creative'],
    strengths: ['Latest Claude model', 'Excellent coding', 'Strong reasoning', 'Large context'],
    weaknesses: ['Premium pricing', 'API availability', 'Rate limits']
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    contextWindow: 200000,
    inputPricePerToken: 0.000015,
    outputPricePerToken: 0.000075,
    maxOutputTokens: 4096,
    capabilities: ['text', 'code', 'reasoning', 'analysis', 'creative'],
    strengths: ['Top-tier reasoning', 'Exceptional quality', 'Large context', 'Nuanced responses'],
    weaknesses: ['Very expensive', 'Slow processing', 'Limited availability']
  },
  {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    contextWindow: 200000,
    inputPricePerToken: 0.000003,
    outputPricePerToken: 0.000015,
    maxOutputTokens: 4096,
    capabilities: ['text', 'code', 'reasoning', 'analysis'],
    strengths: ['Balanced performance', 'Good reasoning', 'Moderate cost', 'Large context'],
    weaknesses: ['Not as capable as Opus', 'Still relatively expensive']
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    contextWindow: 200000,
    inputPricePerToken: 0.00000025,
    outputPricePerToken: 0.00000125,
    maxOutputTokens: 4096,
    capabilities: ['text', 'general', 'fast-response'],
    strengths: ['Very fast', 'Cost-effective', 'Good for simple tasks', 'Large context'],
    weaknesses: ['Limited reasoning', 'Basic capabilities', 'Less creative']
  },

  // Google Models
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    contextWindow: 2000000,
    inputPricePerToken: 0.0000035,
    outputPricePerToken: 0.0000105,
    maxOutputTokens: 8192,
    capabilities: ['text', 'code', 'multimodal', 'reasoning'],
    strengths: ['Massive context window', 'Multimodal capabilities', 'Good reasoning', 'Competitive pricing'],
    weaknesses: ['Newer model', 'Limited track record', 'API quotas']
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    contextWindow: 1000000,
    inputPricePerToken: 0.000000075,
    outputPricePerToken: 0.0000003,
    maxOutputTokens: 8192,
    capabilities: ['text', 'code', 'fast-response', 'multimodal'],
    strengths: ['Extremely fast', 'Very cost-effective', 'Large context', 'Good for high-volume'],
    weaknesses: ['Lower quality than Pro', 'Limited reasoning', 'Basic capabilities']
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    contextWindow: 30720,
    inputPricePerToken: 0.0000005,
    outputPricePerToken: 0.0000015,
    maxOutputTokens: 2048,
    capabilities: ['text', 'code', 'multimodal'],
    strengths: ['Multimodal', 'Cost-effective', 'Fast responses', 'Good availability'],
    weaknesses: ['Smaller context', 'Inconsistent quality', 'Limited output length']
  },

  // Meta/Llama Models
  {
    id: 'Meta-Llama-3.1-405B-Instruct',
    name: 'Llama 3.1 405B',
    provider: 'Meta',
    contextWindow: 128000,
    inputPricePerToken: 0.000005,
    outputPricePerToken: 0.000015,
    maxOutputTokens: 4096,
    capabilities: ['text', 'code', 'reasoning', 'analysis'],
    strengths: ['Largest open model', 'Excellent performance', 'Open source', 'Strong reasoning'],
    weaknesses: ['Requires hosting', 'High compute needs', 'Limited providers']
  },
  {
    id: 'Meta-Llama-3.1-70B-Instruct',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    contextWindow: 128000,
    inputPricePerToken: 0.0000009,
    outputPricePerToken: 0.0000009,
    maxOutputTokens: 4096,
    capabilities: ['text', 'code', 'reasoning', 'open-source'],
    strengths: ['Open source', 'Cost-effective', 'Good performance', 'Large context'],
    weaknesses: ['Requires hosting', 'Less capable than 405B', 'Setup complexity']
  },
  {
    id: 'Meta-Llama-3.1-8B-Instruct',
    name: 'Llama 3.1 8B',
    provider: 'Meta',
    contextWindow: 128000,
    inputPricePerToken: 0.0000002,
    outputPricePerToken: 0.0000002,
    maxOutputTokens: 4096,
    capabilities: ['text', 'code', 'fast-response', 'open-source'],
    strengths: ['Very fast', 'Extremely cost-effective', 'Open source', 'Low resource needs'],
    weaknesses: ['Limited capabilities', 'Basic reasoning', 'Smaller model size']
  },
  {
    id: 'llama-2-70b-chat',
    name: 'Llama 2 70B Chat',
    provider: 'Meta',
    contextWindow: 4096,
    inputPricePerToken: 0.0000007,
    outputPricePerToken: 0.0000009,
    maxOutputTokens: 2048,
    capabilities: ['text', 'code', 'open-source'],
    strengths: ['Open source', 'Very cost-effective', 'Good performance', 'Established model'],
    weaknesses: ['Limited context', 'Older generation', 'Basic capabilities']
  },

  // Mistral AI Models
  {
    id: 'mistral-large-2407',
    name: 'Mistral Large 2',
    provider: 'Mistral AI',
    contextWindow: 128000,
    inputPricePerToken: 0.000003,
    outputPricePerToken: 0.000009,
    maxOutputTokens: 4096,
    capabilities: ['text', 'code', 'reasoning', 'multilingual'],
    strengths: ['Latest Mistral model', 'Strong multilingual', 'Good reasoning', 'European provider'],
    weaknesses: ['Limited availability', 'Newer model', 'Higher cost']
  },
  {
    id: 'mistral-large-2402',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    contextWindow: 32000,
    inputPricePerToken: 0.000008,
    outputPricePerToken: 0.000024,
    maxOutputTokens: 4096,
    capabilities: ['text', 'code', 'reasoning', 'multilingual'],
    strengths: ['Multilingual', 'Good reasoning', 'European provider', 'Privacy focused'],
    weaknesses: ['Higher cost', 'Limited availability', 'Smaller context']
  },
  {
    id: 'mistral-medium',
    name: 'Mistral Medium',
    provider: 'Mistral AI',
    contextWindow: 32000,
    inputPricePerToken: 0.0000027,
    outputPricePerToken: 0.0000081,
    maxOutputTokens: 4096,
    capabilities: ['text', 'code', 'multilingual'],
    strengths: ['Balanced performance', 'Good multilingual', 'Moderate cost', 'Good availability'],
    weaknesses: ['Not as capable as Large', 'Limited reasoning', 'Smaller context']
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    provider: 'Mistral AI',
    contextWindow: 32000,
    inputPricePerToken: 0.000001,
    outputPricePerToken: 0.000003,
    maxOutputTokens: 4096,
    capabilities: ['text', 'fast-response', 'multilingual'],
    strengths: ['Very cost-effective', 'Fast responses', 'Good for simple tasks', 'Multilingual'],
    weaknesses: ['Limited capabilities', 'Basic reasoning', 'Lower quality']
  },
  {
    id: 'codestral-2405',
    name: 'Codestral',
    provider: 'Mistral AI',
    contextWindow: 32000,
    inputPricePerToken: 0.000001,
    outputPricePerToken: 0.000003,
    maxOutputTokens: 4096,
    capabilities: ['code', 'text', 'programming'],
    strengths: ['Specialized for coding', 'Good code completion', 'Cost-effective', 'Multiple languages'],
    weaknesses: ['Limited general abilities', 'Code-focused only', 'Smaller context']
  }
];