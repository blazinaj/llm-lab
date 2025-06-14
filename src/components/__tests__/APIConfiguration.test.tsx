import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import APIConfiguration from '../APIConfiguration';
import { securityService } from '../../services/securityService';

jest.mock('../../services/securityService');

const mockSecurityService = securityService as jest.Mocked<typeof securityService>;

describe('APIConfiguration', () => {
  const mockOnKeysUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSecurityService.secureRetrieve.mockReturnValue(null);
    mockSecurityService.validateApiKey.mockReturnValue({ isValid: true });
    mockSecurityService.sanitizeInput.mockImplementation((input) => input);
    mockSecurityService.checkEnvironmentSecurity.mockReturnValue({
      isSecure: true,
      warnings: []
    });
    mockSecurityService.secureStore.mockImplementation(() => {});
  });

  it('should render API configuration interface', () => {
    render(<APIConfiguration onKeysUpdate={mockOnKeysUpdate} />);

    expect(screen.getByText('API Configuration')).toBeInTheDocument();
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
    expect(screen.getByText('Google AI')).toBeInTheDocument();
    expect(screen.getByText('Hugging Face')).toBeInTheDocument();
    expect(screen.getByText('Mistral AI')).toBeInTheDocument();
  });

  it('should load saved keys on mount', () => {
    const savedKeys = {
      openai: 'sk-test123',
      anthropic: '',
      google: '',
      huggingface: '',
      mistral: ''
    };

    mockSecurityService.secureRetrieve.mockReturnValue(savedKeys);

    render(<APIConfiguration onKeysUpdate={mockOnKeysUpdate} />);

    expect(mockSecurityService.secureRetrieve).toHaveBeenCalledWith('llm-lab-api-keys');
    expect(mockOnKeysUpdate).toHaveBeenCalledWith(savedKeys);
  });

  it('should expand configuration when clicked', async () => {
    render(<APIConfiguration onKeysUpdate={mockOnKeysUpdate} />);

    const configSection = screen.getByText('API Configuration').closest('div');
    fireEvent.click(configSection!);

    await waitFor(() => {
      expect(screen.getByText('Show Setup Guide')).toBeInTheDocument();
    });
  });

  it('should update API keys when input changes', async () => {
    const user = userEvent.setup();
    render(<APIConfiguration onKeysUpdate={mockOnKeysUpdate} />);

    // Expand the configuration
    const configSection = screen.getByText('API Configuration').closest('div');
    fireEvent.click(configSection!);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('sk-proj-...')).toBeInTheDocument();
    });

    const openaiInput = screen.getByPlaceholderText('sk-proj-...');
    await user.type(openaiInput, 'sk-test123');

    expect(mockSecurityService.sanitizeInput).toHaveBeenCalledWith('sk-test123');
  });

  it('should validate API keys on blur', async () => {
    const user = userEvent.setup();
    render(<APIConfiguration onKeysUpdate={mockOnKeysUpdate} />);

    // Expand the configuration
    const configSection = screen.getByText('API Configuration').closest('div');
    fireEvent.click(configSection!);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('sk-proj-...')).toBeInTheDocument();
    });

    const openaiInput = screen.getByPlaceholderText('sk-proj-...');
    await user.type(openaiInput, 'invalid-key');
    fireEvent.blur(openaiInput);

    expect(mockSecurityService.validateApiKey).toHaveBeenCalledWith('openai', 'invalid-key');
  });

  it('should show validation errors', async () => {
    const user = userEvent.setup();
    mockSecurityService.validateApiKey.mockReturnValue({
      isValid: false,
      error: 'Invalid OpenAI API key format'
    });

    render(<APIConfiguration onKeysUpdate={mockOnKeysUpdate} />);

    // Expand the configuration
    const configSection = screen.getByText('API Configuration').closest('div');
    fireEvent.click(configSection!);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('sk-proj-...')).toBeInTheDocument();
    });

    const openaiInput = screen.getByPlaceholderText('sk-proj-...');
    await user.type(openaiInput, 'invalid-key');
    fireEvent.blur(openaiInput);

    await waitFor(() => {
      expect(screen.getByText('Invalid OpenAI API key format')).toBeInTheDocument();
    });
  });

  it('should save keys when save button clicked', async () => {
    render(<APIConfiguration onKeysUpdate={mockOnKeysUpdate} />);

    // Expand the configuration
    const configSection = screen.getByText('API Configuration').closest('div');
    fireEvent.click(configSection!);

    await waitFor(() => {
      expect(screen.getByText('Save Keys')).toBeInTheDocument();
    });

    // Type in a key to enable save button
    const openaiInput = screen.getByPlaceholderText('sk-proj-...');
    fireEvent.change(openaiInput, { target: { value: 'sk-test123' } });

    const saveButton = screen.getByText('Save Keys');
    fireEvent.click(saveButton);

    expect(mockSecurityService.secureStore).toHaveBeenCalledWith(
      'llm-lab-api-keys',
      expect.objectContaining({
        openai: 'sk-test123'
      })
    );
  });

  it('should not save with validation errors', async () => {
    mockSecurityService.validateApiKey.mockReturnValue({
      isValid: false,
      error: 'Invalid key format'
    });

    render(<APIConfiguration onKeysUpdate={mockOnKeysUpdate} />);

    // Expand and trigger validation error
    const configSection = screen.getByText('API Configuration').closest('div');
    fireEvent.click(configSection!);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('sk-proj-...')).toBeInTheDocument();
    });

    const openaiInput = screen.getByPlaceholderText('sk-proj-...');
    fireEvent.change(openaiInput, { target: { value: 'invalid' } });
    fireEvent.blur(openaiInput);

    await waitFor(() => {
      expect(screen.getByText('Save Keys')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Keys');
    expect(saveButton).toBeDisabled();
  });

  it('should clear all keys when clear button clicked', async () => {
    // Mock confirm to return true
    window.confirm = jest.fn(() => true);

    render(<APIConfiguration onKeysUpdate={mockOnKeysUpdate} />);

    // Expand the configuration
    const configSection = screen.getByText('API Configuration').closest('div');
    fireEvent.click(configSection!);

    await waitFor(() => {
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    expect(mockSecurityService.clearAllSecurityData).toHaveBeenCalled();
    expect(mockOnKeysUpdate).toHaveBeenCalledWith({
      openai: '',
      anthropic: '',
      google: '',
      huggingface: '',
      mistral: ''
    });
  });

  it('should not clear keys if user cancels confirmation', async () => {
    // Mock confirm to return false
    window.confirm = jest.fn(() => false);

    render(<APIConfiguration onKeysUpdate={mockOnKeysUpdate} />);

    // Expand the configuration
    const configSection = screen.getByText('API Configuration').closest('div');
    fireEvent.click(configSection!);

    await waitFor(() => {
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    expect(mockSecurityService.clearAllSecurityData).not.toHaveBeenCalled();
  });

  it('should show security warnings', () => {
    mockSecurityService.checkEnvironmentSecurity.mockReturnValue({
      isSecure: false,
      warnings: ['Application is not served over HTTPS']
    });

    render(<APIConfiguration onKeysUpdate={mockOnKeysUpdate} />);

    // Expand to see security warnings
    const configSection = screen.getByText('API Configuration').closest('div');
    fireEvent.click(configSection!);

    expect(screen.getByText('Security Status')).toBeInTheDocument();
    expect(screen.getByText('Application is not served over HTTPS')).toBeInTheDocument();
  });

  it('should toggle detailed setup guide', async () => {
    render(<APIConfiguration onKeysUpdate={mockOnKeysUpdate} />);

    // Expand the configuration
    const configSection = screen.getByText('API Configuration').closest('div');
    fireEvent.click(configSection!);

    await waitFor(() => {
      expect(screen.getByText('Show Setup Guide')).toBeInTheDocument();
    });

    const guideToggle = screen.getByText('Show Setup Guide');
    fireEvent.click(guideToggle);

    await waitFor(() => {
      expect(screen.getByText('API Setup Guide')).toBeInTheDocument();
      expect(screen.getByText('Hide Guide')).toBeInTheDocument();
    });

    const hideGuide = screen.getByText('Hide Guide');
    fireEvent.click(hideGuide);

    await waitFor(() => {
      expect(screen.queryByText('API Setup Guide')).not.toBeInTheDocument();
    });
  });

  it('should toggle key visibility', async () => {
    render(<APIConfiguration onKeysUpdate={mockOnKeysUpdate} />);

    // Expand the configuration
    const configSection = screen.getByText('API Configuration').closest('div');
    fireEvent.click(configSection!);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('sk-proj-...')).toBeInTheDocument();
    });

    const openaiInput = screen.getByPlaceholderText('sk-proj-...');
    expect(openaiInput).toHaveAttribute('type', 'password');

    // Find and click the eye icon for OpenAI
    const eyeButton = openaiInput.parentElement?.querySelector('button');
    if (eyeButton) {
      fireEvent.click(eyeButton);
      expect(openaiInput).toHaveAttribute('type', 'text');
    }
  });

  it('should handle storage errors gracefully', async () => {
    mockSecurityService.secureStore.mockImplementation(() => {
      throw new Error('Storage failed');
    });

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

    render(<APIConfiguration onKeysUpdate={mockOnKeysUpdate} />);

    // Expand and try to save
    const configSection = screen.getByText('API Configuration').closest('div');
    fireEvent.click(configSection!);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('sk-proj-...')).toBeInTheDocument();
    });

    const openaiInput = screen.getByPlaceholderText('sk-proj-...');
    fireEvent.change(openaiInput, { target: { value: 'sk-test123' } });

    const saveButton = screen.getByText('Save Keys');
    fireEvent.click(saveButton);

    expect(alertSpy).toHaveBeenCalledWith('Failed to save API keys. Please try again.');

    alertSpy.mockRestore();
  });
});