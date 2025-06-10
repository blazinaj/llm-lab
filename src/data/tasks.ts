import { BenchmarkTask } from '../types';

export const benchmarkTasks: BenchmarkTask[] = [
  {
    id: 'reasoning-logic',
    name: 'Logic Reasoning',
    description: 'Complex logical reasoning and problem-solving',
    category: 'reasoning',
    difficulty: 'hard',
    prompt: 'If all roses are flowers and some flowers fade quickly, and if something that fades quickly is not permanent, can we conclude that some roses are not permanent? Explain your reasoning step by step.'
  },
  {
    id: 'code-algorithm',
    name: 'Algorithm Implementation',
    description: 'Implement efficient algorithms and data structures',
    category: 'coding',
    difficulty: 'medium',
    prompt: 'Write a Python function to find the longest palindromic substring in a given string. Optimize for time complexity and include detailed comments.'
  },
  {
    id: 'creative-story',
    name: 'Creative Writing',
    description: 'Generate engaging and creative content',
    category: 'creative',
    difficulty: 'medium',
    prompt: 'Write a short story (200-300 words) about a time traveler who accidentally changes something small in the past, but it has massive consequences in the present.'
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Analyze complex datasets and provide insights',
    category: 'analysis',
    difficulty: 'hard',
    prompt: 'Given sales data showing a 15% increase in Q1, 8% decrease in Q2, 22% increase in Q3, and 5% increase in Q4, analyze the trend, identify potential causes, and recommend strategies.'
  },
  {
    id: 'general-qa',
    name: 'General Q&A',
    description: 'Answer general knowledge questions accurately',
    category: 'general',
    difficulty: 'easy',
    prompt: 'Explain the difference between artificial intelligence, machine learning, and deep learning in simple terms that a non-technical person can understand.'
  },
  {
    id: 'code-debug',
    name: 'Code Debugging',
    description: 'Identify and fix bugs in code',
    category: 'coding',
    difficulty: 'medium',
    prompt: 'Debug this JavaScript function: function fibonacci(n) { if (n <= 1) return n; return fibonacci(n-1) + fibonacci(n-2); } // This is too slow for large n'
  },
  {
    id: 'reasoning-math',
    name: 'Mathematical Reasoning',
    description: 'Solve complex mathematical problems',
    category: 'reasoning',
    difficulty: 'hard',
    prompt: 'A ball is dropped from a height of 100 meters. Each time it bounces, it reaches 60% of its previous height. What is the total distance traveled by the ball?'
  },
  {
    id: 'creative-poem',
    name: 'Poetry Generation',
    description: 'Create original poetry with specific constraints',
    category: 'creative',
    difficulty: 'medium',
    prompt: 'Write a sonnet about artificial intelligence that follows traditional iambic pentameter and rhyme scheme (ABAB CDCD EFEF GG).'
  }
];