import React, { useState } from 'react';
import { BenchmarkTask } from '../types';
import { aiAssistantService, TaskSuggestion } from '../services/aiAssistantService';
import { securityService } from '../services/securityService';
import { Code, Brain, Lightbulb, BarChart, MessageSquare, Cpu, Calculator, Pen, Plus, Eye, EyeOff, Edit3, Trash2, Sparkles, Wand2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface TaskSelectorProps {
  tasks: BenchmarkTask[];
  selectedTask: BenchmarkTask | null;
  onTaskSelect: (task: BenchmarkTask) => void;
  onCreateCustomTask: (task: Omit<BenchmarkTask, 'id'>) => void;
  onDeleteCustomTask: (taskId: string) => void;
}

const TaskSelector: React.FC<TaskSelectorProps> = ({ 
  tasks, 
  selectedTask, 
  onTaskSelect, 
  onCreateCustomTask,
  onDeleteCustomTask 
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    category: 'general' as const,
    difficulty: 'medium' as const,
    prompt: '',
    expectedOutput: ''
  });

  // AI Assistant state
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<TaskSuggestion | null>(null);
  const [improvementRequest, setImprovementRequest] = useState('');
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const getTaskIcon = (category: string) => {
    switch (category) {
      case 'coding': return <Code className="h-5 w-5" />;
      case 'reasoning': return <Brain className="h-5 w-5" />;
      case 'creative': return <Lightbulb className="h-5 w-5" />;
      case 'analysis': return <BarChart className="h-5 w-5" />;
      case 'general': return <MessageSquare className="h-5 w-5" />;
      default: return <Cpu className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'coding': 'text-blue-400',
      'reasoning': 'text-purple-400',
      'creative': 'text-pink-400',
      'analysis': 'text-orange-400',
      'general': 'text-gray-400'
    };
    return colors[category as keyof typeof colors] || 'text-gray-400';
  };

  const toggleTaskExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const validateAndCreateTask = () => {
    // Clear previous validation errors
    setValidationErrors([]);

    // Validate task data using security service
    const validation = securityService.validateTaskData(newTask);
    if (!validation.isValid) {
      setValidationErrors([validation.error || 'Invalid task data']);
      return;
    }

    // Additional custom validation
    const errors: string[] = [];
    
    // Check for potentially harmful content
    const suspiciousPatterns = [
      /script[^a-z]/i,
      /javascript:/i,
      /data:text\/html/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    const allText = `${newTask.name} ${newTask.description} ${newTask.prompt} ${newTask.expectedOutput}`;
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(allText)) {
        errors.push('Task content contains potentially unsafe elements');
        break;
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Sanitize inputs before creating task
    const sanitizedTask = {
      name: securityService.sanitizeInput(newTask.name),
      description: securityService.sanitizeInput(newTask.description),
      category: newTask.category,
      difficulty: newTask.difficulty,
      prompt: securityService.sanitizeInput(newTask.prompt),
      expectedOutput: securityService.sanitizeInput(newTask.expectedOutput)
    };

    onCreateCustomTask(sanitizedTask);
    resetForm();
  };

  const resetForm = () => {
    setNewTask({
      name: '',
      description: '',
      category: 'general',
      difficulty: 'medium',
      prompt: '',
      expectedOutput: ''
    });
    setShowCreateModal(false);
    setShowAiAssistant(false);
    setAiSuggestion(null);
    setUserInput('');
    setImprovementRequest('');
    setValidationErrors([]);
  };

  const handleGenerateWithAI = async () => {
    if (!userInput.trim()) return;

    // Sanitize user input
    const sanitizedInput = securityService.sanitizeInput(userInput.trim());
    
    setIsGenerating(true);
    try {
      const suggestion = await aiAssistantService.generateBenchmarkTask(sanitizedInput);
      if (suggestion) {
        // Sanitize AI suggestion
        const sanitizedSuggestion = {
          ...suggestion,
          name: securityService.sanitizeInput(suggestion.name),
          description: securityService.sanitizeInput(suggestion.description),
          prompt: securityService.sanitizeInput(suggestion.prompt),
          expectedOutput: securityService.sanitizeInput(suggestion.expectedOutput),
          reasoning: securityService.sanitizeInput(suggestion.reasoning)
        };
        setAiSuggestion(sanitizedSuggestion);
      }
    } catch (error) {
      console.error('Failed to generate task:', error);
      const sanitizedError = securityService.sanitizeError(error);
      alert(sanitizedError);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveWithAI = async () => {
    if (!improvementRequest.trim() || !aiSuggestion) return;

    // Sanitize improvement request
    const sanitizedRequest = securityService.sanitizeInput(improvementRequest.trim());

    setIsImproving(true);
    try {
      const improvedSuggestion = await aiAssistantService.improveBenchmarkTask(aiSuggestion, sanitizedRequest);
      if (improvedSuggestion) {
        // Sanitize improved suggestion
        const sanitizedImprovedSuggestion = {
          ...improvedSuggestion,
          name: securityService.sanitizeInput(improvedSuggestion.name),
          description: securityService.sanitizeInput(improvedSuggestion.description),
          prompt: securityService.sanitizeInput(improvedSuggestion.prompt),
          expectedOutput: securityService.sanitizeInput(improvedSuggestion.expectedOutput),
          reasoning: securityService.sanitizeInput(improvedSuggestion.reasoning)
        };
        setAiSuggestion(sanitizedImprovedSuggestion);
        setImprovementRequest('');
      }
    } catch (error) {
      console.error('Failed to improve task:', error);
      const sanitizedError = securityService.sanitizeError(error);
      alert(sanitizedError);
    } finally {
      setIsImproving(false);
    }
  };

  const applySuggestion = () => {
    if (aiSuggestion) {
      setNewTask({
        name: aiSuggestion.name,
        description: aiSuggestion.description,
        category: aiSuggestion.category,
        difficulty: aiSuggestion.difficulty,
        prompt: aiSuggestion.prompt,
        expectedOutput: aiSuggestion.expectedOutput
      });
      setShowAiAssistant(false);
    }
  };

  const isCustomTask = (task: BenchmarkTask) => task.id.startsWith('custom-');

  // Group tasks by predefined vs custom
  const predefinedTasks = tasks.filter(task => !isCustomTask(task));
  const customTasks = tasks.filter(task => isCustomTask(task));

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Cpu className="h-6 w-6 mr-2 text-blue-400" />
          Benchmark Tasks
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Custom</span>
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Predefined Tasks */}
        {predefinedTasks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center">
              <Calculator className="h-4 w-4 mr-2" />
              Predefined Tasks
            </h3>
            <div className="space-y-2">
              {predefinedTasks.map((task) => {
                const isExpanded = expandedTasks.has(task.id);
                return (
                  <div key={task.id} className="space-y-2">
                    <button
                      onClick={() => onTaskSelect(task)}
                      className={`text-left p-4 rounded-lg border transition-all duration-200 hover:scale-[1.01] w-full ${
                        selectedTask?.id === task.id
                          ? 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/20'
                          : 'bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            selectedTask?.id === task.id ? 'bg-blue-500/30' : 'bg-gray-600/50'
                          }`}>
                            <div className={getCategoryColor(task.category)}>
                              {getTaskIcon(task.category)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{task.name}</h4>
                            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor(task.difficulty)}`}>
                            {task.difficulty}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskExpanded(task.id);
                            }}
                            className="p-1 hover:bg-gray-600/50 rounded transition-colors"
                          >
                            {isExpanded ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                          </button>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Task Details */}
                    {isExpanded && (
                      <div className="ml-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                        <div className="space-y-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-300 mb-2">Task Prompt</h5>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                                {task.prompt}
                              </pre>
                            </div>
                          </div>
                          
                          {task.expectedOutput && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-300 mb-2">Expected Output Pattern</h5>
                              <div className="bg-gray-800/50 rounded-lg p-3">
                                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                                  {task.expectedOutput}
                                </pre>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-400">Category: 
                              <span className={`ml-1 font-medium ${getCategoryColor(task.category)}`}>
                                {task.category}
                              </span>
                            </span>
                            <span className="text-gray-400">Difficulty: 
                              <span className="ml-1 font-medium text-white capitalize">
                                {task.difficulty}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Tasks */}
        {customTasks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center">
              <Edit3 className="h-4 w-4 mr-2" />
              Custom Tasks
            </h3>
            <div className="space-y-2">
              {customTasks.map((task) => {
                const isExpanded = expandedTasks.has(task.id);
                return (
                  <div key={task.id} className="space-y-2">
                    <button
                      onClick={() => onTaskSelect(task)}
                      className={`text-left p-4 rounded-lg border transition-all duration-200 hover:scale-[1.01] w-full ${
                        selectedTask?.id === task.id
                          ? 'bg-purple-500/20 border-purple-400 shadow-lg shadow-purple-500/20'
                          : 'bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            selectedTask?.id === task.id ? 'bg-purple-500/30' : 'bg-gray-600/50'
                          }`}>
                            <div className="text-purple-400">
                              {getTaskIcon(task.category)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-white">{task.name}</h4>
                              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                                Custom
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor(task.difficulty)}`}>
                            {task.difficulty}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskExpanded(task.id);
                            }}
                            className="p-1 hover:bg-gray-600/50 rounded transition-colors"
                          >
                            {isExpanded ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this custom task?')) {
                                onDeleteCustomTask(task.id);
                              }
                            }}
                            className="p-1 hover:bg-red-600/50 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Task Details */}
                    {isExpanded && (
                      <div className="ml-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                        <div className="space-y-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-300 mb-2">Task Prompt</h5>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                                {task.prompt}
                              </pre>
                            </div>
                          </div>
                          
                          {task.expectedOutput && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-300 mb-2">Expected Output Pattern</h5>
                              <div className="bg-gray-800/50 rounded-lg p-3">
                                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                                  {task.expectedOutput}
                                </pre>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-400">Category: 
                              <span className={`ml-1 font-medium ${getCategoryColor(task.category)}`}>
                                {task.category}
                              </span>
                            </span>
                            <span className="text-gray-400">Difficulty: 
                              <span className="ml-1 font-medium text-white capitalize">
                                {task.difficulty}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create Custom Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Plus className="h-6 w-6 mr-2 text-blue-400" />
                Create Custom Benchmark Task
              </h3>
              <div className="flex items-center space-x-3">
                {aiAssistantService.isAvailable() && (
                  <button
                    onClick={() => setShowAiAssistant(!showAiAssistant)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
                      showAiAssistant 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>AI Assistant</span>
                  </button>
                )}
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <h4 className="text-red-400 font-medium">Validation Errors</h4>
                </div>
                <ul className="text-red-300 text-sm space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Assistant Panel */}
              {showAiAssistant && aiAssistantService.isAvailable() && (
                <div className="lg:col-span-2 mb-6">
                  <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 border border-purple-400/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-purple-500/30 rounded-lg">
                        <Sparkles className="h-5 w-5 text-purple-300" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">AI Task Assistant</h4>
                        <p className="text-purple-200 text-sm">Describe what you want to test and I'll create a comprehensive benchmark task</p>
                      </div>
                    </div>

                    {!aiSuggestion ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-2">
                            What would you like to test? (e.g., "mathematical reasoning with word problems", "code debugging skills", "creative storytelling")
                          </label>
                          <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Describe the capability or skill you want to benchmark..."
                            rows={3}
                            maxLength={1000}
                            className="w-full px-4 py-2 bg-gray-700/50 border border-purple-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <div className="text-xs text-purple-300 mt-1">
                            {userInput.length}/1000 characters
                          </div>
                        </div>
                        <button
                          onClick={handleGenerateWithAI}
                          disabled={!userInput.trim() || isGenerating}
                          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                          {isGenerating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4" />
                              <span>Generate Task</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <h5 className="text-green-400 font-medium mb-2 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            AI Generated Task
                          </h5>
                          <div className="space-y-3 text-sm">
                            <div><strong className="text-gray-300">Name:</strong> <span className="text-white">{aiSuggestion.name}</span></div>
                            <div><strong className="text-gray-300">Category:</strong> <span className="text-white capitalize">{aiSuggestion.category}</span></div>
                            <div><strong className="text-gray-300">Difficulty:</strong> <span className="text-white capitalize">{aiSuggestion.difficulty}</span></div>
                            <div><strong className="text-gray-300">Reasoning:</strong> <span className="text-gray-200">{aiSuggestion.reasoning}</span></div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={applySuggestion}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Use This Task</span>
                          </button>
                          <button
                            onClick={() => setAiSuggestion(null)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span>Start Over</span>
                          </button>
                        </div>

                        <div className="border-t border-purple-400/30 pt-4">
                          <label className="block text-sm font-medium text-purple-200 mb-2">
                            Want to improve this task? Tell me what to change:
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={improvementRequest}
                              onChange={(e) => setImprovementRequest(e.target.value)}
                              placeholder="e.g., make it harder, add more examples, focus on edge cases..."
                              maxLength={500}
                              className="flex-1 px-3 py-2 bg-gray-700/50 border border-purple-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                              onClick={handleImproveWithAI}
                              disabled={!improvementRequest.trim() || isImproving}
                              className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                            >
                              {isImproving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!aiAssistantService.isAvailable() && showAiAssistant && (
                <div className="lg:col-span-2 mb-6">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                      <div>
                        <h4 className="text-yellow-400 font-medium">AI Assistant Unavailable</h4>
                        <p className="text-yellow-200 text-sm mt-1">
                          Please configure your OpenAI API key in the API Configuration section to use the AI assistant.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Form */}
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-white">Task Details</h4>
                
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Task Name *
                    </label>
                    <input
                      type="text"
                      value={newTask.name}
                      onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter task name..."
                      maxLength={200}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {newTask.name.length}/200 characters
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={newTask.category}
                        onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="general">General</option>
                        <option value="reasoning">Reasoning</option>
                        <option value="coding">Coding</option>
                        <option value="creative">Creative</option>
                        <option value="analysis">Analysis</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Difficulty
                      </label>
                      <select
                        value={newTask.difficulty}
                        onChange={(e) => setNewTask(prev => ({ ...prev, difficulty: e.target.value as any }))}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of what this task evaluates..."
                      maxLength={500}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {newTask.description.length}/500 characters
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-lg font-medium text-white">Task Content</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Task Prompt *
                  </label>
                  <textarea
                    value={newTask.prompt}
                    onChange={(e) => setNewTask(prev => ({ ...prev, prompt: e.target.value }))}
                    placeholder="Enter the prompt that will be sent to the AI models..."
                    rows={8}
                    maxLength={10000}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {newTask.prompt.length}/10,000 characters
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expected Output Pattern (Optional)
                  </label>
                  <textarea
                    value={newTask.expectedOutput}
                    onChange={(e) => setNewTask(prev => ({ ...prev, expectedOutput: e.target.value }))}
                    placeholder="Describe what a good response should look like or include..."
                    rows={6}
                    maxLength={2000}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {newTask.expectedOutput.length}/2,000 characters | This helps with evaluation and provides context for reviewing results.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-6 border-t border-gray-700">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={validateAndCreateTask}
                disabled={!newTask.name.trim() || !newTask.prompt.trim()}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Task</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSelector;