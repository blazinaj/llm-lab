import OpenAI from 'openai';

interface TaskSuggestion {
  name: string;
  description: string;
  category: 'reasoning' | 'coding' | 'creative' | 'analysis' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  expectedOutput: string;
  reasoning: string;
}

class AIAssistantService {
  private openai: OpenAI | null = null;

  constructor() {
    this.initializeOpenAI();
  }

  private initializeOpenAI() {
    try {
      const apiKey = localStorage.getItem('llm-lab-api-keys');
      if (apiKey) {
        const keys = JSON.parse(apiKey);
        if (keys.openai) {
          this.openai = new OpenAI({
            apiKey: keys.openai,
            dangerouslyAllowBrowser: true
          });
        }
      }
    } catch (error) {
      console.warn('Failed to initialize OpenAI for AI assistant:', error);
    }
  }

  isAvailable(): boolean {
    return this.openai !== null;
  }

  async generateBenchmarkTask(userInput: string): Promise<TaskSuggestion | null> {
    if (!this.openai) {
      throw new Error('OpenAI not configured. Please add your OpenAI API key.');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an AI benchmarking expert. Your job is to create comprehensive benchmark tasks for evaluating Large Language Models (LLMs). 

When a user provides a description or idea for a benchmark test, you should:
1. Analyze their requirements
2. Create a detailed, well-structured benchmark task
3. Choose appropriate category and difficulty
4. Write a clear, specific prompt that will effectively test LLMs
5. Define expected output patterns for evaluation

Categories available: reasoning, coding, creative, analysis, general
Difficulty levels: easy, medium, hard

Focus on creating tasks that:
- Are objective and measurable
- Test specific capabilities
- Have clear success criteria
- Are appropriate for the chosen difficulty level
- Provide meaningful differentiation between models`
          },
          {
            role: 'user',
            content: `Please create a benchmark task based on this user input: "${userInput}"`
          }
        ],
        functions: [
          {
            name: 'create_benchmark_task',
            description: 'Create a comprehensive benchmark task for LLM evaluation',
            parameters: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'A concise, descriptive name for the benchmark task'
                },
                description: {
                  type: 'string',
                  description: 'A brief description of what this task evaluates'
                },
                category: {
                  type: 'string',
                  enum: ['reasoning', 'coding', 'creative', 'analysis', 'general'],
                  description: 'The category that best fits this task'
                },
                difficulty: {
                  type: 'string',
                  enum: ['easy', 'medium', 'hard'],
                  description: 'The difficulty level of the task'
                },
                prompt: {
                  type: 'string',
                  description: 'The actual prompt that will be sent to LLMs for evaluation. Should be clear, specific, and test the intended capability.'
                },
                expectedOutput: {
                  type: 'string',
                  description: 'Description of what a good response should look like, including structure, content, and quality indicators'
                },
                reasoning: {
                  type: 'string',
                  description: 'Explanation of why this task design effectively tests the intended capability and how it differentiates between model performance'
                }
              },
              required: ['name', 'description', 'category', 'difficulty', 'prompt', 'expectedOutput', 'reasoning']
            }
          }
        ],
        function_call: { name: 'create_benchmark_task' },
        temperature: 0.7,
        max_tokens: 2000
      });

      const functionCall = response.choices[0]?.message?.function_call;
      if (functionCall && functionCall.name === 'create_benchmark_task') {
        const taskData = JSON.parse(functionCall.arguments);
        return taskData as TaskSuggestion;
      }

      return null;
    } catch (error) {
      console.error('Failed to generate benchmark task:', error);
      throw error;
    }
  }

  async improveBenchmarkTask(currentTask: any, improvementRequest: string): Promise<TaskSuggestion | null> {
    if (!this.openai) {
      throw new Error('OpenAI not configured. Please add your OpenAI API key.');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an AI benchmarking expert. You're helping improve an existing benchmark task based on user feedback.

Analyze the current task and the user's improvement request, then provide an enhanced version that addresses their concerns while maintaining the task's core testing objective.`
          },
          {
            role: 'user',
            content: `Current task:
Name: ${currentTask.name}
Description: ${currentTask.description}
Category: ${currentTask.category}
Difficulty: ${currentTask.difficulty}
Prompt: ${currentTask.prompt}
Expected Output: ${currentTask.expectedOutput}

User improvement request: "${improvementRequest}"

Please improve this task based on the user's feedback.`
          }
        ],
        functions: [
          {
            name: 'improve_benchmark_task',
            description: 'Improve an existing benchmark task based on user feedback',
            parameters: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'An improved, descriptive name for the benchmark task'
                },
                description: {
                  type: 'string',
                  description: 'An improved description of what this task evaluates'
                },
                category: {
                  type: 'string',
                  enum: ['reasoning', 'coding', 'creative', 'analysis', 'general'],
                  description: 'The category that best fits this task'
                },
                difficulty: {
                  type: 'string',
                  enum: ['easy', 'medium', 'hard'],
                  description: 'The difficulty level of the task'
                },
                prompt: {
                  type: 'string',
                  description: 'The improved prompt that will be sent to LLMs for evaluation'
                },
                expectedOutput: {
                  type: 'string',
                  description: 'Improved description of what a good response should look like'
                },
                reasoning: {
                  type: 'string',
                  description: 'Explanation of the improvements made and why they enhance the task'
                }
              },
              required: ['name', 'description', 'category', 'difficulty', 'prompt', 'expectedOutput', 'reasoning']
            }
          }
        ],
        function_call: { name: 'improve_benchmark_task' },
        temperature: 0.7,
        max_tokens: 2000
      });

      const functionCall = response.choices[0]?.message?.function_call;
      if (functionCall && functionCall.name === 'improve_benchmark_task') {
        const taskData = JSON.parse(functionCall.arguments);
        return taskData as TaskSuggestion;
      }

      return null;
    } catch (error) {
      console.error('Failed to improve benchmark task:', error);
      throw error;
    }
  }
}

export const aiAssistantService = new AIAssistantService();
export type { TaskSuggestion };