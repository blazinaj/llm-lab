import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HfInference } from '@huggingface/inference';
import MistralAI from '@mistralai/mistralai';
import { LLMModel, BenchmarkTask } from '../types';

interface APIResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  latency: number;
  error?: string;
}

interface APIKeys {
  openai: string;
  anthropic: string;
  google: string;
  huggingface: string;
  mistral: string;
}

class APIService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private googleAI: GoogleGenerativeAI | null = null;
  private huggingFace: HfInference | null = null;
  private mistral: MistralAI | null = null;
  private apiKeys: APIKeys = {
    openai: '',
    anthropic: '',
    google: '',
    huggingface: '',
    mistral: ''
  };

  constructor() {
    this.initializeFromEnv();
  }

  private initializeFromEnv() {
    // Initialize with environment variables as fallback
    this.apiKeys = {
      openai: import.meta.env.VITE_OPENAI_API_KEY || '',
      anthropic: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      google: import.meta.env.VITE_GOOGLE_API_KEY || '',
      huggingface: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
      mistral: import.meta.env.VITE_MISTRAL_API_KEY || ''
    };
    this.initializeClients();
  }

  updateKeys(keys: APIKeys) {
    this.apiKeys = { ...keys };
    this.initializeClients();
    
    // Notify AI assistant service of updated keys
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('apiKeysUpdated'));
    }
  }

  private initializeClients() {
    try {
      // Initialize OpenAI
      if (this.apiKeys.openai) {
        this.openai = new OpenAI({
          apiKey: this.apiKeys.openai,
          dangerouslyAllowBrowser: true
        });
      } else {
        this.openai = null;
      }

      // Initialize Anthropic
      if (this.apiKeys.anthropic) {
        this.anthropic = new Anthropic({
          apiKey: this.apiKeys.anthropic,
          dangerouslyAllowBrowser: true
        });
      } else {
        this.anthropic = null;
      }

      // Initialize Google AI
      if (this.apiKeys.google) {
        this.googleAI = new GoogleGenerativeAI(this.apiKeys.google);
      } else {
        this.googleAI = null;
      }

      // Initialize Hugging Face
      if (this.apiKeys.huggingface) {
        this.huggingFace = new HfInference(this.apiKeys.huggingface);
      } else {
        this.huggingFace = null;
      }

      // Initialize Mistral
      if (this.apiKeys.mistral) {
        this.mistral = new MistralAI({
          apiKey: this.apiKeys.mistral
        });
      } else {
        this.mistral = null;
      }
    } catch (error) {
      console.warn('Some API clients could not be initialized:', error);
    }
  }

  async callModel(model: LLMModel, task: BenchmarkTask): Promise<APIResponse> {
    const startTime = Date.now();
    
    try {
      switch (model.provider) {
        case 'OpenAI':
          return await this.callOpenAI(model, task, startTime);
        case 'Anthropic':
          return await this.callAnthropic(model, task, startTime);
        case 'Google':
          return await this.callGoogle(model, task, startTime);
        case 'Meta':
          return await this.callHuggingFace(model, task, startTime);
        case 'Mistral AI':
          return await this.callMistral(model, task, startTime);
        default:
          throw new Error(`Unsupported provider: ${model.provider}`);
      }
    } catch (error) {
      return {
        content: '',
        usage: { inputTokens: 0, outputTokens: 0 },
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async callOpenAI(model: LLMModel, task: BenchmarkTask, startTime: number): Promise<APIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await this.openai.chat.completions.create({
      model: model.id,
      messages: [{ role: 'user', content: task.prompt }],
      max_tokens: Math.min(model.maxOutputTokens, 2000),
      temperature: 0.7,
    });

    const latency = Date.now() - startTime;
    const content = response.choices[0]?.message?.content || '';
    
    return {
      content,
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
      latency,
    };
  }

  private async callAnthropic(model: LLMModel, task: BenchmarkTask, startTime: number): Promise<APIResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic API key not configured');
    }

    const response = await this.anthropic.messages.create({
      model: model.id,
      max_tokens: Math.min(model.maxOutputTokens, 2000),
      messages: [{ role: 'user', content: task.prompt }],
    });

    const latency = Date.now() - startTime;
    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    
    return {
      content,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      latency,
    };
  }

  private async callGoogle(model: LLMModel, task: BenchmarkTask, startTime: number): Promise<APIResponse> {
    if (!this.googleAI) {
      throw new Error('Google API key not configured');
    }

    const genModel = this.googleAI.getGenerativeModel({ model: model.id });
    const result = await genModel.generateContent(task.prompt);
    const response = await result.response;
    
    const latency = Date.now() - startTime;
    const content = response.text();
    
    // Google doesn't provide detailed token usage in the free tier
    const estimatedInputTokens = Math.floor(task.prompt.length / 4);
    const estimatedOutputTokens = Math.floor(content.length / 4);
    
    return {
      content,
      usage: {
        inputTokens: estimatedInputTokens,
        outputTokens: estimatedOutputTokens,
      },
      latency,
    };
  }

  private async callHuggingFace(model: LLMModel, task: BenchmarkTask, startTime: number): Promise<APIResponse> {
    if (!this.huggingFace) {
      throw new Error('Hugging Face API key not configured');
    }

    const response = await this.huggingFace.textGeneration({
      model: `meta-llama/${model.id}`,
      inputs: task.prompt,
      parameters: {
        max_new_tokens: Math.min(model.maxOutputTokens, 1000),
        temperature: 0.7,
        return_full_text: false,
      },
    });

    const latency = Date.now() - startTime;
    const content = response.generated_text || '';
    
    // Estimate token usage
    const estimatedInputTokens = Math.floor(task.prompt.length / 4);
    const estimatedOutputTokens = Math.floor(content.length / 4);
    
    return {
      content,
      usage: {
        inputTokens: estimatedInputTokens,
        outputTokens: estimatedOutputTokens,
      },
      latency,
    };
  }

  private async callMistral(model: LLMModel, task: BenchmarkTask, startTime: number): Promise<APIResponse> {
    if (!this.mistral) {
      throw new Error('Mistral API key not configured');
    }

    const response = await this.mistral.chat({
      model: model.id,
      messages: [{ role: 'user', content: task.prompt }],
      max_tokens: Math.min(model.maxOutputTokens, 2000),
      temperature: 0.7,
    });

    const latency = Date.now() - startTime;
    const content = response.choices[0]?.message?.content || '';
    
    return {
      content,
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
      latency,
    };
  }

  isProviderConfigured(provider: string): boolean {
    switch (provider) {
      case 'OpenAI':
        return !!this.openai;
      case 'Anthropic':
        return !!this.anthropic;
      case 'Google':
        return !!this.googleAI;
      case 'Meta':
        return !!this.huggingFace;
      case 'Mistral AI':
        return !!this.mistral;
      default:
        return false;
    }
  }

  getConfiguredProviders(): string[] {
    const providers = [];
    if (this.openai) providers.push('OpenAI');
    if (this.anthropic) providers.push('Anthropic');
    if (this.googleAI) providers.push('Google');
    if (this.huggingFace) providers.push('Meta');
    if (this.mistral) providers.push('Mistral AI');
    return providers;
  }
}

export const apiService = new APIService();