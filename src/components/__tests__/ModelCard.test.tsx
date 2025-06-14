import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModelCard from '../ModelCard';
import { LLMModel } from '../../types';

describe('ModelCard', () => {
  const mockModel: LLMModel = {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    contextWindow: 128000,
    inputPricePerToken: 0.000005,
    outputPricePerToken: 0.000015,
    maxOutputTokens: 4096,
    capabilities: ['text', 'code', 'reasoning'],
    strengths: ['Latest model', 'Excellent reasoning', 'Fast responses'],
    weaknesses: ['Premium pricing', 'Rate limits']
  };

  const defaultProps = {
    model: mockModel,
    isSelected: false,
    onClick: jest.fn(),
    disabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render model information correctly', () => {
    render(<ModelCard {...defaultProps} />);

    expect(screen.getByText('GPT-4o')).toBeInTheDocument();
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('128K tokens')).toBeInTheDocument();
    expect(screen.getByText('4.1K tokens')).toBeInTheDocument();
    expect(screen.getByText('$5.00/M')).toBeInTheDocument(); // Input price
    expect(screen.getByText('$15.00/M')).toBeInTheDocument(); // Output price
  });

  it('should show model strengths and weaknesses', () => {
    render(<ModelCard {...defaultProps} />);

    expect(screen.getByText('Latest model')).toBeInTheDocument();
    expect(screen.getByText('Excellent reasoning')).toBeInTheDocument();
    expect(screen.getByText('Premium pricing')).toBeInTheDocument();
    expect(screen.getByText('Rate limits')).toBeInTheDocument();
  });

  it('should handle click events when enabled', () => {
    render(<ModelCard {...defaultProps} />);

    const card = screen.getByText('GPT-4o').closest('div');
    fireEvent.click(card!);

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('should not handle click events when disabled', () => {
    const disabledProps = { ...defaultProps, disabled: true };
    render(<ModelCard {...disabledProps} />);

    const card = screen.getByText('GPT-4o').closest('div');
    fireEvent.click(card!);

    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it('should apply selected styles when selected', () => {
    const selectedProps = { ...defaultProps, isSelected: true };
    render(<ModelCard {...selectedProps} />);

    const card = screen.getByText('GPT-4o').closest('div');
    expect(card).toHaveClass('border-blue-400', 'shadow-lg', 'bg-blue-500/10');
  });

  it('should apply disabled styles when disabled', () => {
    const disabledProps = { ...defaultProps, disabled: true };
    render(<ModelCard {...disabledProps} />);

    const card = screen.getByText('GPT-4o').closest('div');
    expect(card).toHaveClass('opacity-60', 'cursor-not-allowed');
    
    expect(screen.getByText('API key required to use this model')).toBeInTheDocument();
  });

  it('should show correct provider color', () => {
    render(<ModelCard {...defaultProps} />);

    // OpenAI should have green color
    const providerDot = screen.getByText('GPT-4o')
      .closest('div')
      ?.querySelector('.bg-green-500');
    
    expect(providerDot).toBeInTheDocument();
  });

  it('should format prices correctly for different ranges', () => {
    const cheapModel: LLMModel = {
      ...mockModel,
      inputPricePerToken: 0.0000001,
      outputPricePerToken: 0.0000002
    };

    const cheapProps = { ...defaultProps, model: cheapModel };
    render(<ModelCard {...cheapProps} />);

    expect(screen.getByText('$0.10/M')).toBeInTheDocument(); // Input price
    expect(screen.getByText('$0.20/M')).toBeInTheDocument(); // Output price
  });

  it('should limit displayed strengths and weaknesses', () => {
    const modelWithManyAttributes: LLMModel = {
      ...mockModel,
      strengths: ['Strength 1', 'Strength 2', 'Strength 3', 'Strength 4'],
      weaknesses: ['Weakness 1', 'Weakness 2', 'Weakness 3', 'Weakness 4']
    };

    const propsWithMany = { ...defaultProps, model: modelWithManyAttributes };
    render(<ModelCard {...propsWithMany} />);

    // Should only show first 2 strengths and weaknesses
    expect(screen.getByText('Strength 1')).toBeInTheDocument();
    expect(screen.getByText('Strength 2')).toBeInTheDocument();
    expect(screen.queryByText('Strength 3')).not.toBeInTheDocument();

    expect(screen.getByText('Weakness 1')).toBeInTheDocument();
    expect(screen.getByText('Weakness 2')).toBeInTheDocument();
    expect(screen.queryByText('Weakness 3')).not.toBeInTheDocument();
  });

  it('should handle different provider colors', () => {
    const anthropicModel = { ...mockModel, provider: 'Anthropic' };
    const anthropicProps = { ...defaultProps, model: anthropicModel };
    
    render(<ModelCard {...anthropicProps} />);
    
    const providerDot = screen.getByText('GPT-4o')
      .closest('div')
      ?.querySelector('.bg-orange-500');
    
    expect(providerDot).toBeInTheDocument();
  });

  it('should handle unknown providers with default color', () => {
    const unknownModel = { ...mockModel, provider: 'Unknown Provider' };
    const unknownProps = { ...defaultProps, model: unknownModel };
    
    render(<ModelCard {...unknownProps} />);
    
    const providerDot = screen.getByText('GPT-4o')
      .closest('div')
      ?.querySelector('.bg-gray-500');
    
    expect(providerDot).toBeInTheDocument();
  });

  it('should show hover effects when not disabled', () => {
    render(<ModelCard {...defaultProps} />);

    const card = screen.getByText('GPT-4o').closest('div');
    expect(card).toHaveClass('hover:scale-[1.02]', 'cursor-pointer');
  });

  it('should not show hover effects when disabled', () => {
    const disabledProps = { ...defaultProps, disabled: true };
    render(<ModelCard {...disabledProps} />);

    const card = screen.getByText('GPT-4o').closest('div');
    expect(card).not.toHaveClass('hover:scale-[1.02]');
    expect(card).toHaveClass('cursor-not-allowed');
  });
});