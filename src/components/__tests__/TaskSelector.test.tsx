import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskSelector from '../TaskSelector';
import { BenchmarkTask } from '../../types';
import { securityService } from '../../services/securityService';
import { aiAssistantService } from '../../services/aiAssistantService';

jest.mock('../../services/securityService');
jest.mock('../../services/aiAssistantService');

const mockSecurityService = securityService as jest.Mocked<typeof securityService>;
const mockAiAssistantService = aiAssistantService as jest.Mocked<typeof aiAssistantService>;

describe('TaskSelector', () => {
  const mockTasks: BenchmarkTask[] = [
    {
      id: 'task-1',
      name: 'Test Task 1',
      description: 'A test task',
      category: 'general',
      difficulty: 'easy',
      prompt: 'Test prompt 1'
    },
    {
      id: 'custom-task-1',
      name: 'Custom Task 1',
      description: 'A custom task',
      category: 'coding',
      difficulty: 'medium',
      prompt: 'Custom prompt 1'
    }
  ];

  const mockProps = {
    tasks: mockTasks,
    selectedTask: null,
    onTaskSelect: jest.fn(),
    onCreateCustomTask: jest.fn(),
    onDeleteCustomTask: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSecurityService.validateTaskData.mockReturnValue({ isValid: true });
    mockSecurityService.sanitizeInput.mockImplementation((input) => input);
    mockSecurityService.sanitizeError.mockImplementation((error) => 
      error instanceof Error ? error.message : String(error)
    );
    mockAiAssistantService.isAvailable.mockReturnValue(false);
  });

  it('should render task list correctly', () => {
    render(<TaskSelector {...mockProps} />);

    expect(screen.getByText('Benchmark Tasks')).toBeInTheDocument();
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Task 1')).toBeInTheDocument();
    expect(screen.getByText('Create Custom')).toBeInTheDocument();
  });

  it('should group predefined and custom tasks separately', () => {
    render(<TaskSelector {...mockProps} />);

    expect(screen.getByText('Predefined Tasks')).toBeInTheDocument();
    expect(screen.getByText('Custom Tasks')).toBeInTheDocument();
  });

  it('should call onTaskSelect when task is clicked', () => {
    render(<TaskSelector {...mockProps} />);

    const taskButton = screen.getByText('Test Task 1').closest('button');
    fireEvent.click(taskButton!);

    expect(mockProps.onTaskSelect).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('should highlight selected task', () => {
    const selectedProps = { ...mockProps, selectedTask: mockTasks[0] };
    render(<TaskSelector {...selectedProps} />);

    const selectedTaskButton = screen.getByText('Test Task 1').closest('button');
    expect(selectedTaskButton).toHaveClass('bg-blue-500/20', 'border-blue-400');
  });

  it('should expand task details when eye icon clicked', async () => {
    render(<TaskSelector {...mockProps} />);

    // Find the eye icon for the first task
    const eyeButton = screen.getAllByRole('button').find(button => 
      button.querySelector('[data-lucide="eye"]')
    );
    
    if (eyeButton) {
      fireEvent.click(eyeButton);

      await waitFor(() => {
        expect(screen.getByText('Task Prompt')).toBeInTheDocument();
        expect(screen.getByText('Test prompt 1')).toBeInTheDocument();
      });
    }
  });

  it('should open custom task creation modal', async () => {
    render(<TaskSelector {...mockProps} />);

    const createButton = screen.getByText('Create Custom');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Create Custom Benchmark Task')).toBeInTheDocument();
      expect(screen.getByText('Task Name *')).toBeInTheDocument();
      expect(screen.getByText('Task Prompt *')).toBeInTheDocument();
    });
  });

  it('should validate task creation input', async () => {
    const user = userEvent.setup();
    mockSecurityService.validateTaskData.mockReturnValue({
      isValid: false,
      error: 'Task name is required'
    });

    render(<TaskSelector {...mockProps} />);

    // Open modal
    const createButton = screen.getByText('Create Custom');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Create Task')).toBeInTheDocument();
    });

    // Try to create task without required fields
    const createTaskButton = screen.getByText('Create Task');
    fireEvent.click(createTaskButton);

    await waitFor(() => {
      expect(screen.getByText('Validation Errors')).toBeInTheDocument();
      expect(screen.getByText('Task name is required')).toBeInTheDocument();
    });
  });

  it('should create custom task successfully', async () => {
    const user = userEvent.setup();
    render(<TaskSelector {...mockProps} />);

    // Open modal
    const createButton = screen.getByText('Create Custom');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter task name...')).toBeInTheDocument();
    });

    // Fill in task details
    const nameInput = screen.getByPlaceholderText('Enter task name...');
    const promptInput = screen.getByPlaceholderText('Enter the prompt that will be sent to the AI models...');

    await user.type(nameInput, 'New Custom Task');
    await user.type(promptInput, 'New custom prompt');

    // Submit
    const createTaskButton = screen.getByText('Create Task');
    fireEvent.click(createTaskButton);

    expect(mockProps.onCreateCustomTask).toHaveBeenCalledWith({
      name: 'New Custom Task',
      description: '',
      category: 'general',
      difficulty: 'medium',
      prompt: 'New custom prompt',
      expectedOutput: ''
    });
  });

  it('should sanitize task inputs', async () => {
    const user = userEvent.setup();
    render(<TaskSelector {...mockProps} />);

    // Open modal
    const createButton = screen.getByText('Create Custom');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter task name...')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('Enter task name...');
    await user.type(nameInput, '<script>alert("xss")</script>');

    const createTaskButton = screen.getByText('Create Task');
    fireEvent.click(createTaskButton);

    expect(mockSecurityService.sanitizeInput).toHaveBeenCalledWith('<script>alert("xss")</script>');
  });

  it('should handle character limits', async () => {
    const user = userEvent.setup();
    render(<TaskSelector {...mockProps} />);

    // Open modal
    const createButton = screen.getByText('Create Custom');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter task name...')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('Enter task name...');
    await user.type(nameInput, 'Test');

    expect(screen.getByText('4/200 characters')).toBeInTheDocument();
  });

  it('should delete custom tasks with confirmation', () => {
    window.confirm = jest.fn(() => true);

    render(<TaskSelector {...mockProps} />);

    // Find delete button for custom task
    const deleteButton = screen.getByRole('button', { name: /trash/i });
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this custom task?');
    expect(mockProps.onDeleteCustomTask).toHaveBeenCalledWith('custom-task-1');
  });

  it('should not delete custom tasks if user cancels', () => {
    window.confirm = jest.fn(() => false);

    render(<TaskSelector {...mockProps} />);

    // Find delete button for custom task
    const deleteButton = screen.getByRole('button', { name: /trash/i });
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockProps.onDeleteCustomTask).not.toHaveBeenCalled();
  });

  describe('AI Assistant', () => {
    beforeEach(() => {
      mockAiAssistantService.isAvailable.mockReturnValue(true);
    });

    it('should show AI assistant when available', async () => {
      render(<TaskSelector {...mockProps} />);

      const createButton = screen.getByText('Create Custom');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('AI Assistant')).toBeInTheDocument();
      });

      const aiButton = screen.getByText('AI Assistant');
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByText('AI Task Assistant')).toBeInTheDocument();
      });
    });

    it('should generate task with AI assistant', async () => {
      const user = userEvent.setup();
      const mockSuggestion = {
        name: 'AI Generated Task',
        description: 'Generated description',
        category: 'coding' as const,
        difficulty: 'medium' as const,
        prompt: 'Generated prompt',
        expectedOutput: 'Generated output',
        reasoning: 'Generated reasoning'
      };

      mockAiAssistantService.generateBenchmarkTask.mockResolvedValue(mockSuggestion);

      render(<TaskSelector {...mockProps} />);

      // Open modal and AI assistant
      const createButton = screen.getByText('Create Custom');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('AI Assistant')).toBeInTheDocument();
      });

      const aiButton = screen.getByText('AI Assistant');
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Describe the capability or skill you want to benchmark...')).toBeInTheDocument();
      });

      // Enter description and generate
      const descriptionInput = screen.getByPlaceholderText('Describe the capability or skill you want to benchmark...');
      await user.type(descriptionInput, 'Test AI generation');

      const generateButton = screen.getByText('Generate Task');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockAiAssistantService.generateBenchmarkTask).toHaveBeenCalledWith('Test AI generation');
        expect(screen.getByText('AI Generated Task')).toBeInTheDocument();
      });
    });

    it('should handle AI generation errors', async () => {
      const user = userEvent.setup();
      mockAiAssistantService.generateBenchmarkTask.mockRejectedValue(new Error('API error'));
      window.alert = jest.fn();

      render(<TaskSelector {...mockProps} />);

      // Open modal and AI assistant
      const createButton = screen.getByText('Create Custom');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('AI Assistant')).toBeInTheDocument();
      });

      const aiButton = screen.getByText('AI Assistant');
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Describe the capability or skill you want to benchmark...')).toBeInTheDocument();
      });

      const descriptionInput = screen.getByPlaceholderText('Describe the capability or skill you want to benchmark...');
      await user.type(descriptionInput, 'Test');

      const generateButton = screen.getByText('Generate Task');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('API error');
      });
    });

    it('should show unavailable message when AI not available', async () => {
      mockAiAssistantService.isAvailable.mockReturnValue(false);

      render(<TaskSelector {...mockProps} />);

      const createButton = screen.getByText('Create Custom');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('AI Assistant')).toBeInTheDocument();
      });

      const aiButton = screen.getByText('AI Assistant');
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByText('AI Assistant Unavailable')).toBeInTheDocument();
      });
    });
  });

  it('should close modal when cancel is clicked', async () => {
    render(<TaskSelector {...mockProps} />);

    const createButton = screen.getByText('Create Custom');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Create Custom Benchmark Task')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Create Custom Benchmark Task')).not.toBeInTheDocument();
    });
  });

  it('should enforce input validation for suspicious content', async () => {
    const user = userEvent.setup();
    render(<TaskSelector {...mockProps} />);

    // Open modal
    const createButton = screen.getByText('Create Custom');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter task name...')).toBeInTheDocument();
    });

    // Try to input suspicious content
    const nameInput = screen.getByPlaceholderText('Enter task name...');
    const promptInput = screen.getByPlaceholderText('Enter the prompt that will be sent to the AI models...');

    await user.type(nameInput, 'Script test');
    await user.type(promptInput, '<script>alert("test")</script>');

    const createTaskButton = screen.getByText('Create Task');
    fireEvent.click(createTaskButton);

    // Should trigger validation error for suspicious content
    await waitFor(() => {
      expect(screen.getByText('Validation Errors')).toBeInTheDocument();
    });
  });
});