import { createClient } from '@supabase/supabase-js';
import { BenchmarkTask, DetailedBenchmarkResult, LLMModel } from '../types';

export interface SavedBenchmark {
  id: string;
  name: string;
  task_id: string;
  task_name: string;
  task_category: string;
  task_difficulty: string;
  settings: any;
  created_at: string;
  result_count?: number;
  best_score?: number;
  avg_cost?: number;
}

export interface SavedBenchmarkResult extends DetailedBenchmarkResult {
  id: string;
  benchmark_id: string;
  model_name: string;
  provider: string;
  created_at: string;
}

class DatabaseService {
  private supabase: any = null;
  private isInitialized = false;

  constructor() {
    this.initializeSupabase();
  }

  private initializeSupabase() {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.isInitialized = true;
      } else {
        console.warn('Supabase credentials not found. Database features will be disabled.');
      }
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
    }
  }

  isAvailable(): boolean {
    return this.isInitialized && this.supabase !== null;
  }

  private sanitizeForDatabase(value: any, type: 'string' | 'number' | 'integer' | 'boolean'): any {
    if (value === null || value === undefined) {
      switch (type) {
        case 'string': return '';
        case 'number': return 0;
        case 'integer': return 0;
        case 'boolean': return false;
        default: return null;
      }
    }

    switch (type) {
      case 'string':
        return String(value || '');
      case 'number':
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
      case 'integer':
        const int = parseInt(value);
        return isNaN(int) ? 0 : int;
      case 'boolean':
        return Boolean(value);
      default:
        return value;
    }
  }

  async saveBenchmark(
    name: string,
    task: BenchmarkTask,
    results: DetailedBenchmarkResult[],
    models: LLMModel[],
    settings: any = {}
  ): Promise<string | null> {
    if (!this.isAvailable()) {
      throw new Error('Database not available. Please ensure Supabase is properly configured.');
    }

    if (!name?.trim()) {
      throw new Error('Benchmark name is required');
    }

    if (!task) {
      throw new Error('Task is required');
    }

    if (!results || results.length === 0) {
      throw new Error('At least one benchmark result is required');
    }

    try {
      console.log('Saving benchmark:', { name, task: task.id, resultCount: results.length });

      // Prepare benchmark data with proper sanitization
      const benchmarkData = {
        name: this.sanitizeForDatabase(name.trim(), 'string'),
        task_id: this.sanitizeForDatabase(task.id, 'string'),
        task_name: this.sanitizeForDatabase(task.name, 'string'),
        task_category: this.sanitizeForDatabase(task.category, 'string'),
        task_difficulty: this.sanitizeForDatabase(task.difficulty, 'string'),
        settings: settings || {}
      };

      console.log('Inserting benchmark data:', benchmarkData);

      // Insert benchmark record
      const { data: benchmark, error: benchmarkError } = await this.supabase
        .from('benchmarks')
        .insert(benchmarkData)
        .select()
        .single();

      if (benchmarkError) {
        console.error('Benchmark insert error:', benchmarkError);
        throw new Error(`Failed to save benchmark: ${benchmarkError.message}`);
      }

      if (!benchmark?.id) {
        throw new Error('Failed to get benchmark ID after insert');
      }

      console.log('Benchmark saved with ID:', benchmark.id);

      // Prepare benchmark results with proper sanitization and validation
      const resultsToInsert = results.map((result, index) => {
        const model = models.find(m => m.id === result.modelId);
        
        if (!result.modelId) {
          throw new Error(`Result ${index} is missing modelId`);
        }

        const resultData = {
          benchmark_id: benchmark.id,
          model_id: this.sanitizeForDatabase(result.modelId, 'string'),
          model_name: this.sanitizeForDatabase(model?.name || result.modelId, 'string'),
          provider: this.sanitizeForDatabase(model?.provider || 'Unknown', 'string'),
          score: this.sanitizeForDatabase(result.score, 'number'),
          quality: this.sanitizeForDatabase(result.quality, 'number'),
          latency: this.sanitizeForDatabase(result.latency, 'integer'),
          cost: this.sanitizeForDatabase(result.cost, 'number'),
          input_tokens: this.sanitizeForDatabase(result.inputTokens, 'integer'),
          output_tokens: this.sanitizeForDatabase(result.outputTokens, 'integer'),
          raw_output: this.sanitizeForDatabase(result.rawOutput || result.output || '', 'string'),
          error: result.error ? this.sanitizeForDatabase(result.error, 'string') : null
        };

        console.log(`Preparing result ${index}:`, {
          modelId: resultData.model_id,
          modelName: resultData.model_name,
          score: resultData.score,
          hasError: !!resultData.error
        });

        return resultData;
      });

      console.log('Inserting results:', resultsToInsert.length);

      // Insert benchmark results in batches to avoid potential size limits
      const batchSize = 50;
      for (let i = 0; i < resultsToInsert.length; i += batchSize) {
        const batch = resultsToInsert.slice(i, i + batchSize);
        
        const { error: resultsError } = await this.supabase
          .from('benchmark_results')
          .insert(batch);

        if (resultsError) {
          console.error(`Results insert error (batch ${Math.floor(i/batchSize) + 1}):`, resultsError);
          throw new Error(`Failed to save benchmark results: ${resultsError.message}`);
        }
      }

      console.log('All results saved successfully');
      return benchmark.id;

    } catch (error) {
      console.error('Failed to save benchmark:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('violates foreign key constraint')) {
          throw new Error('Database constraint violation. Please try again.');
        } else if (error.message.includes('invalid input syntax')) {
          throw new Error('Invalid data format. Please check your results and try again.');
        } else if (error.message.includes('duplicate key value')) {
          throw new Error('A benchmark with this configuration already exists.');
        } else {
          throw error;
        }
      } else {
        throw new Error('An unexpected error occurred while saving the benchmark.');
      }
    }
  }

  async getBenchmarks(): Promise<SavedBenchmark[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('benchmarks')
        .select(`
          *,
          benchmark_results(score, cost)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch benchmarks:', error);
        throw error;
      }

      return data.map((benchmark: any) => {
        const results = benchmark.benchmark_results || [];
        const scores = results.map((r: any) => r.score).filter((s: number) => s > 0);
        const costs = results.map((r: any) => r.cost).filter((c: number) => c > 0);

        return {
          ...benchmark,
          result_count: results.length,
          best_score: scores.length > 0 ? Math.max(...scores) : 0,
          avg_cost: costs.length > 0 ? costs.reduce((a: number, b: number) => a + b, 0) / costs.length : 0
        };
      });
    } catch (error) {
      console.error('Failed to fetch benchmarks:', error);
      return [];
    }
  }

  async getBenchmarkById(id: string): Promise<{ benchmark: SavedBenchmark; results: SavedBenchmarkResult[] } | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      // Get benchmark details
      const { data: benchmark, error: benchmarkError } = await this.supabase
        .from('benchmarks')
        .select('*')
        .eq('id', id)
        .single();

      if (benchmarkError) {
        console.error('Failed to fetch benchmark:', benchmarkError);
        throw benchmarkError;
      }

      // Get benchmark results
      const { data: results, error: resultsError } = await this.supabase
        .from('benchmark_results')
        .select('*')
        .eq('benchmark_id', id)
        .order('score', { ascending: false });

      if (resultsError) {
        console.error('Failed to fetch benchmark results:', resultsError);
        throw resultsError;
      }

      return {
        benchmark,
        results: results.map((result: any) => ({
          id: result.id,
          benchmark_id: result.benchmark_id,
          modelId: result.model_id,
          taskId: benchmark.task_id,
          model_name: result.model_name,
          provider: result.provider,
          score: parseFloat(result.score) || 0,
          quality: parseFloat(result.quality) || 0,
          latency: parseInt(result.latency) || 0,
          cost: parseFloat(result.cost) || 0,
          inputTokens: parseInt(result.input_tokens) || 0,
          outputTokens: parseInt(result.output_tokens) || 0,
          timestamp: new Date(result.created_at).getTime(),
          output: result.raw_output || '',
          rawOutput: result.raw_output || '',
          input: '', // Will be filled from task data
          processingTime: parseInt(result.latency) || 0,
          error: result.error,
          created_at: result.created_at
        }))
      };
    } catch (error) {
      console.error('Failed to fetch benchmark:', error);
      return null;
    }
  }

  async deleteBenchmark(id: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const { error } = await this.supabase
        .from('benchmarks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Failed to delete benchmark:', error);
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Failed to delete benchmark:', error);
      return false;
    }
  }
}

export const databaseService = new DatabaseService();