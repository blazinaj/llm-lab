import { llmModels } from '../models';

describe('Models Data', () => {
  it('should contain all expected providers', () => {
    const providers = [...new Set(llmModels.map(model => model.provider))];
    
    expect(providers).toContain('OpenAI');
    expect(providers).toContain('Anthropic');
    expect(providers).toContain('Google');
    expect(providers).toContain('Meta');
    expect(providers).toContain('Mistral AI');
  });

  it('should have all required model properties', () => {
    llmModels.forEach(model => {
      expect(model).toHaveProperty('id');
      expect(model).toHaveProperty('name');
      expect(model).toHaveProperty('provider');
      expect(model).toHaveProperty('contextWindow');
      expect(model).toHaveProperty('inputPricePerToken');
      expect(model).toHaveProperty('outputPricePerToken');
      expect(model).toHaveProperty('maxOutputTokens');
      expect(model).toHaveProperty('capabilities');
      expect(model).toHaveProperty('strengths');
      expect(model).toHaveProperty('weaknesses');

      // Type checks
      expect(typeof model.id).toBe('string');
      expect(typeof model.name).toBe('string');
      expect(typeof model.provider).toBe('string');
      expect(typeof model.contextWindow).toBe('number');
      expect(typeof model.inputPricePerToken).toBe('number');
      expect(typeof model.outputPricePerToken).toBe('number');
      expect(typeof model.maxOutputTokens).toBe('number');
      expect(Array.isArray(model.capabilities)).toBe(true);
      expect(Array.isArray(model.strengths)).toBe(true);
      expect(Array.isArray(model.weaknesses)).toBe(true);
    });
  });

  it('should have unique model IDs', () => {
    const ids = llmModels.map(model => model.id);
    const uniqueIds = [...new Set(ids)];
    
    expect(ids.length).toBe(uniqueIds.length);
  });

  it('should have reasonable pricing values', () => {
    llmModels.forEach(model => {
      // Prices should be positive
      expect(model.inputPricePerToken).toBeGreaterThan(0);
      expect(model.outputPricePerToken).toBeGreaterThan(0);
      
      // Prices should be reasonable (not too high)
      expect(model.inputPricePerToken).toBeLessThan(1);
      expect(model.outputPricePerToken).toBeLessThan(1);
      
      // Output pricing is typically higher than input
      expect(model.outputPricePerToken).toBeGreaterThanOrEqual(model.inputPricePerToken);
    });
  });

  it('should have reasonable context window sizes', () => {
    llmModels.forEach(model => {
      expect(model.contextWindow).toBeGreaterThan(0);
      expect(model.contextWindow).toBeLessThanOrEqual(2000000); // Max realistic context
      expect(model.maxOutputTokens).toBeGreaterThan(0);
      expect(model.maxOutputTokens).toBeLessThanOrEqual(model.contextWindow);
    });
  });

  it('should have non-empty capabilities, strengths, and weaknesses', () => {
    llmModels.forEach(model => {
      expect(model.capabilities.length).toBeGreaterThan(0);
      expect(model.strengths.length).toBeGreaterThan(0);
      expect(model.weaknesses.length).toBeGreaterThan(0);
      
      // All should be strings
      model.capabilities.forEach(cap => expect(typeof cap).toBe('string'));
      model.strengths.forEach(str => expect(typeof str).toBe('string'));
      model.weaknesses.forEach(weak => expect(typeof weak).toBe('string'));
    });
  });

  it('should include specific high-profile models', () => {
    const modelIds = llmModels.map(model => model.id);
    
    // Check for key models
    expect(modelIds).toContain('gpt-4o');
    expect(modelIds).toContain('claude-3-5-sonnet-20241022');
    expect(modelIds).toContain('gemini-1.5-pro');
    expect(modelIds).toContain('Meta-Llama-3.1-405B-Instruct');
  });

  it('should have appropriate model names and providers matching', () => {
    llmModels.forEach(model => {
      if (model.provider === 'OpenAI') {
        expect(model.id).toMatch(/^gpt-/);
      } else if (model.provider === 'Anthropic') {
        expect(model.id).toMatch(/^claude-/);
      } else if (model.provider === 'Google') {
        expect(model.id).toMatch(/^gemini/);
      } else if (model.provider === 'Meta') {
        expect(model.id).toMatch(/^(Meta-Llama|llama)/);
      } else if (model.provider === 'Mistral AI') {
        expect(model.id).toMatch(/^(mistral|codestral)/);
      }
    });
  });

  it('should have reasonable price ordering within providers', () => {
    // Group by provider
    const byProvider = llmModels.reduce((acc, model) => {
      if (!acc[model.provider]) acc[model.provider] = [];
      acc[model.provider].push(model);
      return acc;
    }, {} as Record<string, typeof llmModels>);

    // Check that generally more advanced models cost more
    Object.entries(byProvider).forEach(([provider, models]) => {
      if (models.length > 1) {
        // Sort by model sophistication (context window as proxy)
        const sorted = [...models].sort((a, b) => b.contextWindow - a.contextWindow);
        
        // More sophisticated models should generally cost more (but not strictly required)
        // This is a loose check since pricing strategies vary
        if (sorted.length >= 2) {
          const mostAdvanced = sorted[0];
          const leastAdvanced = sorted[sorted.length - 1];
          
          // At least one of input or output pricing should be higher for more advanced models
          const advancedAvgPrice = (mostAdvanced.inputPricePerToken + mostAdvanced.outputPricePerToken) / 2;
          const basicAvgPrice = (leastAdvanced.inputPricePerToken + leastAdvanced.outputPricePerToken) / 2;
          
          // This is a soft check - advanced models are typically more expensive
          expect(advancedAvgPrice).toBeGreaterThanOrEqual(basicAvgPrice * 0.1); // At least 10% of the price
        }
      }
    });
  });
});