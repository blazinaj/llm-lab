import { benchmarkTasks } from '../tasks';

describe('Tasks Data', () => {
  it('should contain tasks with all required properties', () => {
    benchmarkTasks.forEach(task => {
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('name');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('category');
      expect(task).toHaveProperty('difficulty');
      expect(task).toHaveProperty('prompt');

      // Type checks
      expect(typeof task.id).toBe('string');
      expect(typeof task.name).toBe('string');
      expect(typeof task.description).toBe('string');
      expect(typeof task.category).toBe('string');
      expect(typeof task.difficulty).toBe('string');
      expect(typeof task.prompt).toBe('string');
    });
  });

  it('should have unique task IDs', () => {
    const ids = benchmarkTasks.map(task => task.id);
    const uniqueIds = [...new Set(ids)];
    
    expect(ids.length).toBe(uniqueIds.length);
  });

  it('should have valid categories', () => {
    const validCategories = ['reasoning', 'coding', 'creative', 'analysis', 'general'];
    
    benchmarkTasks.forEach(task => {
      expect(validCategories).toContain(task.category);
    });
  });

  it('should have valid difficulty levels', () => {
    const validDifficulties = ['easy', 'medium', 'hard'];
    
    benchmarkTasks.forEach(task => {
      expect(validDifficulties).toContain(task.difficulty);
    });
  });

  it('should have non-empty content', () => {
    benchmarkTasks.forEach(task => {
      expect(task.id.trim()).not.toBe('');
      expect(task.name.trim()).not.toBe('');
      expect(task.description.trim()).not.toBe('');
      expect(task.prompt.trim()).not.toBe('');
    });
  });

  it('should cover all categories', () => {
    const categories = [...new Set(benchmarkTasks.map(task => task.category))];
    
    expect(categories).toContain('reasoning');
    expect(categories).toContain('coding');
    expect(categories).toContain('creative');
    expect(categories).toContain('analysis');
    expect(categories).toContain('general');
  });

  it('should cover all difficulty levels', () => {
    const difficulties = [...new Set(benchmarkTasks.map(task => task.difficulty))];
    
    expect(difficulties).toContain('easy');
    expect(difficulties).toContain('medium');
    expect(difficulties).toContain('hard');
  });

  it('should have reasonable prompt lengths', () => {
    benchmarkTasks.forEach(task => {
      // Prompts should be substantial but not too long
      expect(task.prompt.length).toBeGreaterThan(10);
      expect(task.prompt.length).toBeLessThan(5000);
    });
  });

  it('should have appropriate task names and descriptions', () => {
    benchmarkTasks.forEach(task => {
      // Names should be concise
      expect(task.name.length).toBeLessThan(100);
      expect(task.name.length).toBeGreaterThan(5);
      
      // Descriptions should be helpful but concise
      expect(task.description.length).toBeLessThan(200);
      expect(task.description.length).toBeGreaterThan(10);
    });
  });

  it('should have coding tasks with appropriate prompts', () => {
    const codingTasks = benchmarkTasks.filter(task => task.category === 'coding');
    
    expect(codingTasks.length).toBeGreaterThan(0);
    
    codingTasks.forEach(task => {
      // Coding tasks should mention programming concepts
      const prompt = task.prompt.toLowerCase();
      const hasCodeKeywords = [
        'function', 'algorithm', 'code', 'program', 'implement', 
        'debug', 'python', 'javascript', 'class', 'method'
      ].some(keyword => prompt.includes(keyword));
      
      expect(hasCodeKeywords).toBe(true);
    });
  });

  it('should have reasoning tasks with appropriate prompts', () => {
    const reasoningTasks = benchmarkTasks.filter(task => task.category === 'reasoning');
    
    expect(reasoningTasks.length).toBeGreaterThan(0);
    
    reasoningTasks.forEach(task => {
      // Reasoning tasks should require logical thinking
      const prompt = task.prompt.toLowerCase();
      const hasReasoningKeywords = [
        'logic', 'reason', 'analyze', 'conclude', 'explain', 
        'step by step', 'problem', 'solve', 'think'
      ].some(keyword => prompt.includes(keyword));
      
      expect(hasReasoningKeywords).toBe(true);
    });
  });

  it('should have creative tasks with appropriate prompts', () => {
    const creativeTasks = benchmarkTasks.filter(task => task.category === 'creative');
    
    expect(creativeTasks.length).toBeGreaterThan(0);
    
    creativeTasks.forEach(task => {
      // Creative tasks should encourage imagination
      const prompt = task.prompt.toLowerCase();
      const hasCreativeKeywords = [
        'write', 'create', 'story', 'poem', 'creative', 
        'imagine', 'original', 'generate', 'compose'
      ].some(keyword => prompt.includes(keyword));
      
      expect(hasCreativeKeywords).toBe(true);
    });
  });

  it('should have specific expected tasks', () => {
    const taskIds = benchmarkTasks.map(task => task.id);
    
    // Check for some key benchmark tasks
    expect(taskIds).toContain('reasoning-logic');
    expect(taskIds).toContain('code-algorithm');
    expect(taskIds).toContain('creative-story');
    expect(taskIds).toContain('general-qa');
  });

  it('should have tasks with expectedOutput when provided', () => {
    const tasksWithExpectedOutput = benchmarkTasks.filter(task => task.expectedOutput);
    
    tasksWithExpectedOutput.forEach(task => {
      expect(typeof task.expectedOutput).toBe('string');
      expect(task.expectedOutput!.trim()).not.toBe('');
    });
  });

  it('should have balanced difficulty distribution', () => {
    const difficulties = benchmarkTasks.map(task => task.difficulty);
    const counts = {
      easy: difficulties.filter(d => d === 'easy').length,
      medium: difficulties.filter(d => d === 'medium').length,
      hard: difficulties.filter(d => d === 'hard').length
    };
    
    // Should have at least one of each difficulty
    expect(counts.easy).toBeGreaterThan(0);
    expect(counts.medium).toBeGreaterThan(0);
    expect(counts.hard).toBeGreaterThan(0);
    
    // Medium should be most common, but this is flexible
    expect(counts.medium).toBeGreaterThanOrEqual(Math.min(counts.easy, counts.hard));
  });
});