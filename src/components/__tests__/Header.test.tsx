import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header', () => {
  it('should render header with title and branding', () => {
    render(<Header />);

    expect(screen.getByText('LLM Lab')).toBeInTheDocument();
    expect(screen.getByText('AI Model Benchmarking Suite')).toBeInTheDocument();
  });

  it('should render brain icon', () => {
    render(<Header />);

    // Check for brain icon (Lucide React icon)
    const brainIcon = document.querySelector('[data-lucide="brain"]');
    expect(brainIcon).toBeInTheDocument();
  });

  it('should render "Made with Bolt" badge', () => {
    render(<Header />);

    expect(screen.getByText('Made with')).toBeInTheDocument();
    expect(screen.getByText('Bolt')).toBeInTheDocument();
  });

  it('should have external link to Bolt website', () => {
    render(<Header />);

    const boltLink = screen.getByRole('link');
    expect(boltLink).toHaveAttribute('href', 'https://bolt.new');
    expect(boltLink).toHaveAttribute('target', '_blank');
    expect(boltLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should apply correct styling classes', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-gradient-to-r', 'from-gray-900', 'via-blue-900', 'to-gray-900');
  });

  it('should show animated status indicator', () => {
    render(<Header />);

    const statusDot = document.querySelector('.animate-pulse');
    expect(statusDot).toBeInTheDocument();
    expect(statusDot).toHaveClass('bg-green-400', 'rounded-full');
  });

  it('should render gradient text for main title', () => {
    render(<Header />);

    const title = screen.getByText('LLM Lab');
    expect(title).toHaveClass('bg-gradient-to-r', 'from-white', 'to-blue-200', 'bg-clip-text', 'text-transparent');
  });
});