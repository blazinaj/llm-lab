export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  inputPricePerToken: number;
  outputPricePerToken: number;
  maxOutputTokens: number;
  capabilities: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface BenchmarkTask {
  id: string;
  name: string;
  description: string;
  category: 'reasoning' | 'coding' | 'creative' | 'analysis' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  expectedOutput?: string;
}

export interface BenchmarkResult {
  modelId: string;
  taskId: string;
  score: number;
  latency: number;
  outputTokens: number;
  inputTokens: number;
  cost: number;
  quality: number;
  timestamp: number;
  output?: string;
  error?: string;
}

export interface ModelRecommendation {
  model: LLMModel;
  score: number;
  reason: string;
  costEfficiency: number;
  performanceRating: number;
}

export interface DetailedBenchmarkResult extends BenchmarkResult {
  input: string;
  rawOutput: string;
  processingTime: number;
}