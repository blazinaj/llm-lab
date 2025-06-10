import { LLMModel, BenchmarkTask, BenchmarkResult, ModelRecommendation, DetailedBenchmarkResult } from '../types';
import { llmModels } from '../data/models';
import { apiService } from '../services/apiService';

// Quality assessment using simple heuristics
const assessOutputQuality = (output: string, task: BenchmarkTask): number => {
  if (!output || output.trim().length === 0) return 0;
  
  let score = 0.5; // Base score
  
  // Length appropriateness (not too short, not extremely long)
  const length = output.length;
  if (length > 50 && length < 2000) score += 0.2;
  else if (length >= 2000 && length < 5000) score += 0.1;
  
  // Task-specific quality checks
  switch (task.category) {
    case 'coding':
      // Check for code patterns
      if (output.includes('def ') || output.includes('function ') || output.includes('class ')) score += 0.2;
      if (output.includes('```')) score += 0.1;
      break;
    
    case 'reasoning':
      // Check for logical structure
      if (output.includes('because') || output.includes('therefore') || output.includes('thus')) score += 0.1;
      if (output.includes('step') || output.includes('first') || output.includes('second')) score += 0.1;
      break;
    
    case 'creative':
      // Check for creative elements
      if (output.length > 100) score += 0.1;
      const sentences = output.split('.').length;
      if (sentences > 3) score += 0.1;
      break;
    
    case 'analysis':
      // Check for analytical structure
      if (output.includes('%') || output.includes('trend') || output.includes('analysis')) score += 0.1;
      if (output.includes('recommend') || output.includes('suggest')) score += 0.1;
      break;
  }
  
  // Coherence check (basic)
  const words = output.split(' ').length;
  if (words > 20 && !output.includes('ERROR') && !output.includes('error')) score += 0.1;
  
  return Math.min(Math.max(score, 0), 1);
};

// Benchmark results with real API calls only
export const generateBenchmarkResults = async (
  models: LLMModel[], 
  tasks: BenchmarkTask[],
  onProgress?: (progress: number, currentModel?: string) => void
): Promise<DetailedBenchmarkResult[]> => {
  const results: DetailedBenchmarkResult[] = [];
  const total = models.length * tasks.length;
  let completed = 0;
  
  for (const model of models) {
    for (const task of tasks) {
      if (onProgress) {
        onProgress((completed / total) * 100, model.name);
      }
      
      try {
        // Check if provider is configured - skip if not
        if (!apiService.isProviderConfigured(model.provider)) {
          console.warn(`Skipping ${model.name} - provider ${model.provider} not configured`);
          
          // Create error result for unconfigured provider
          const errorResult: DetailedBenchmarkResult = {
            modelId: model.id,
            taskId: task.id,
            score: 0,
            latency: 0,
            outputTokens: 0,
            inputTokens: Math.floor(task.prompt.length / 4),
            cost: 0,
            quality: 0,
            timestamp: Date.now(),
            error: `API key not configured for ${model.provider}. Please add your API key to test this model.`,
            input: task.prompt,
            rawOutput: '',
            processingTime: 0
          };
          
          results.push(errorResult);
          completed++;
          continue;
        }

        // Make real API call
        const startTime = Date.now();
        const apiResponse = await apiService.callModel(model, task);
        const endTime = Date.now();
        
        const quality = apiResponse.error ? 0 : assessOutputQuality(apiResponse.content, task);
        const score = apiResponse.error ? 0 : quality * 0.8 + (1 - Math.min(apiResponse.latency / 10000, 1)) * 0.2;
        
        const inputTokens = apiResponse.usage.inputTokens || Math.floor(task.prompt.length / 4);
        const outputTokens = apiResponse.usage.outputTokens || Math.floor(apiResponse.content.length / 4);
        const cost = (inputTokens * model.inputPricePerToken) + (outputTokens * model.outputPricePerToken);
        
        const result: DetailedBenchmarkResult = {
          modelId: model.id,
          taskId: task.id,
          score,
          latency: apiResponse.latency,
          outputTokens,
          inputTokens,
          cost,
          quality,
          timestamp: Date.now(),
          output: apiResponse.content,
          error: apiResponse.error,
          input: task.prompt,
          rawOutput: apiResponse.content,
          processingTime: endTime - startTime
        };
        
        results.push(result);
        
      } catch (error) {
        // Handle unexpected errors
        const errorResult: DetailedBenchmarkResult = {
          modelId: model.id,
          taskId: task.id,
          score: 0,
          latency: 0,
          outputTokens: 0,
          inputTokens: Math.floor(task.prompt.length / 4),
          cost: 0,
          quality: 0,
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          input: task.prompt,
          rawOutput: '',
          processingTime: 0
        };
        
        results.push(errorResult);
      }
      
      completed++;
    }
  }
  
  if (onProgress) {
    onProgress(100);
  }
  
  return results;
};

export const getModelRecommendations = (
  task: BenchmarkTask,
  results: DetailedBenchmarkResult[],
  prioritizePerformance: boolean = true
): ModelRecommendation[] => {
  const taskResults = results.filter(r => r.taskId === task.id && !r.error);
  
  if (taskResults.length === 0) {
    return [];
  }
  
  const recommendations: ModelRecommendation[] = taskResults.map(result => {
    const model = llmModels.find(m => m.id === result.modelId)!;
    const costEfficiency = result.cost > 0 ? result.score / result.cost : result.score * 1000;
    const performanceRating = result.score;
    
    const score = prioritizePerformance 
      ? performanceRating * 0.7 + (Math.min(costEfficiency / 1000, 1)) * 0.3
      : performanceRating * 0.4 + (Math.min(costEfficiency / 1000, 1)) * 0.6;
    
    let reason = '';
    if (result.score > 0.9) {
      reason = 'Excellent performance on this task type with high-quality output';
    } else if (result.score > 0.8) {
      reason = 'Strong performance with good reliability and consistent results';
    } else if (costEfficiency > 1000) {
      reason = 'Best cost-to-performance ratio for budget-conscious applications';
    } else {
      reason = 'Balanced option suitable for general use cases';
    }
    
    return {
      model,
      score,
      reason,
      costEfficiency,
      performanceRating
    };
  });
  
  return recommendations.sort((a, b) => b.score - a.score);
};

export const generateCodeSnippet = (model: LLMModel, task: BenchmarkTask): string => {
  const examples = {
    'OpenAI': `
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await client.chat.completions.create({
  model: "${model.id}",
  messages: [
    {
      role: "user",
      content: "${task.prompt}"
    }
  ],
  max_tokens: 1000,
  temperature: 0.7,
});

console.log(response.choices[0].message.content);`,
    
    'Anthropic': `
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: "${model.id}",
  max_tokens: 1000,
  messages: [
    {
      role: "user", 
      content: "${task.prompt}"
    }
  ]
});

console.log(message.content);`,
    
    'Google': `
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "${model.id}" });

const result = await model.generateContent([
  {
    text: "${task.prompt}"
  }
]);

console.log(result.response.text());`,
    
    'Meta': `
// Using Hugging Face Inference API for Llama
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_API_KEY);

const response = await hf.textGeneration({
  model: 'meta-llama/${model.id}',
  inputs: "${task.prompt}",
  parameters: {
    max_new_tokens: 1000,
    temperature: 0.7,
  }
});

console.log(response.generated_text);`,
    
    'Mistral AI': `
import { MistralAI } from '@mistralai/mistralai';

const client = new MistralAI({
  apiKey: process.env.MISTRAL_API_KEY
});

const response = await client.chat({
  model: "${model.id}",
  messages: [
    {
      role: "user",
      content: "${task.prompt}"
    }
  ],
  max_tokens: 1000,
});

console.log(response.choices[0].message.content);`
  };
  
  return examples[model.provider as keyof typeof examples] || examples['OpenAI'];
};