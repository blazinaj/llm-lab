import React, { useState, useEffect } from 'react';
import { BenchmarkTask, DetailedBenchmarkResult, LLMModel } from '../types';
import { generateBenchmarkResults, getModelRecommendations, generateCodeSnippet } from '../utils/benchmarkEngine';
import { databaseService } from '../services/databaseService';
import { llmModels } from '../data/models';
import { benchmarkTasks } from '../data/tasks';
import { apiService } from '../services/apiService';
import TaskSelector from './TaskSelector';
import ModelCard from './ModelCard';
import BenchmarkResults from './BenchmarkResults';
import BenchmarkDetails from './BenchmarkDetails';
import ModelRecommendation from './ModelRecommendation';
import CodeSnippet from './CodeSnippet';
import APIConfiguration from './APIConfiguration';
import BenchmarkList from './BenchmarkList';
import BenchmarkHistory from './BenchmarkHistory';
import { Play, Settings, Filter, AlertTriangle, Key, Database, Save, Archive, CheckCircle, AlertCircle, ArrowRight, Grid3X3, List, Lock } from 'lucide-react';

type ViewMode = 'dashboard' | 'history' | 'benchmark-detail' | 'auto-saved-results';
type ModelViewMode = 'grid' | 'list';

const Dashboard: React.FC = () => {
  const [allTasks, setAllTasks] = useState<BenchmarkTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<BenchmarkTask | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [benchmarkResults, setBenchmarkResults] = useState<DetailedBenchmarkResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [prioritizePerformance, setPriorizePerformance] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentModel, setCurrentModel] = useState<string>('');
  const [showAPIWarning, setShowAPIWarning] = useState(false);
  const [configuredProviders, setConfiguredProviders] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>('');
  const [saveBenchmarkName, setSaveBenchmarkName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string>('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [lastAutoSavedBenchmarkId, setLastAutoSavedBenchmarkId] = useState<string>('');
  const [modelViewMode, setModelViewMode] = useState<ModelViewMode>('grid');

  useEffect(() => {
    // Load predefined and custom tasks
    loadTasks();
    
    // Auto-select only configured models initially
    updateConfiguredProviders();
  }, []);

  useEffect(() => {
    // Update selected models when configured providers change
    const configuredModels = llmModels
      .filter(m => configuredProviders.includes(m.provider))
      .map(m => m.id);
    setSelectedModels(configuredModels);
  }, [configuredProviders]);

  const loadTasks = () => {
    const customTasks = getCustomTasks();
    setAllTasks([...benchmarkTasks, ...customTasks]);
  };

  const getCustomTasks = (): BenchmarkTask[] => {
    try {
      const saved = localStorage.getItem('llm-lab-custom-tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const saveCustomTasks = (tasks: BenchmarkTask[]) => {
    try {
      localStorage.setItem('llm-lab-custom-tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save custom tasks:', error);
    }
  };

  const handleCreateCustomTask = (taskData: Omit<BenchmarkTask, 'id'>) => {
    const newTask: BenchmarkTask = {
      ...taskData,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    const customTasks = getCustomTasks();
    const updatedTasks = [...customTasks, newTask];
    saveCustomTasks(updatedTasks);
    
    setAllTasks([...benchmarkTasks, ...updatedTasks]);
  };

  const handleDeleteCustomTask = (taskId: string) => {
    if (!taskId.startsWith('custom-')) return;

    const customTasks = getCustomTasks();
    const updatedTasks = customTasks.filter(task => task.id !== taskId);
    saveCustomTasks(updatedTasks);
    
    setAllTasks([...benchmarkTasks, ...updatedTasks]);
    
    // Clear selection if the deleted task was selected
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  const updateConfiguredProviders = () => {
    const providers = apiService.getConfiguredProviders();
    setConfiguredProviders(providers);
    
    if (providers.length === 0) {
      setShowAPIWarning(true);
    } else {
      setShowAPIWarning(false);
    }
  };

  const handleAPIKeysUpdate = (keys: any) => {
    apiService.updateKeys(keys);
    updateConfiguredProviders();
  };

  const handleModelToggle = (modelId: string) => {
    const model = llmModels.find(m => m.id === modelId);
    if (!model) return;

    // Only allow selection if the provider is configured
    if (!configuredProviders.includes(model.provider)) {
      return; // Do nothing if provider not configured
    }

    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const generateBenchmarkName = (task: BenchmarkTask, modelsCount: number): string => {
    const timestamp = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${task.name} - ${modelsCount} models (${timestamp})`;
  };

  const autoSaveBenchmark = async (task: BenchmarkTask, results: DetailedBenchmarkResult[]): Promise<string | null> => {
    if (!databaseService.isAvailable() || results.length === 0) {
      return null;
    }

    setAutoSaveStatus('saving');

    try {
      const validResults = results.filter(result => result.modelId && !result.error);
      
      if (validResults.length === 0) {
        console.log('No valid results to auto-save');
        setAutoSaveStatus('idle');
        return null;
      }

      const autoGeneratedName = generateBenchmarkName(task, validResults.length);
      
      const settings = {
        prioritizePerformance,
        selectedModels: selectedModels,
        timestamp: Date.now(),
        isCustomTask: task.id.startsWith('custom-'),
        modelCount: validResults.length,
        taskCategory: task.category,
        taskDifficulty: task.difficulty,
        autoSaved: true
      };

      console.log('Auto-saving benchmark:', autoGeneratedName);

      const benchmarkId = await databaseService.saveBenchmark(
        autoGeneratedName,
        task,
        validResults,
        llmModels,
        settings
      );

      if (benchmarkId) {
        setAutoSaveStatus('success');
        setLastAutoSavedBenchmarkId(benchmarkId);
        return benchmarkId;
      } else {
        throw new Error('Failed to auto-save benchmark');
      }

    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
      return null;
    }
  };

  const runBenchmark = async () => {
    if (!selectedTask || selectedModels.length === 0) return;

    // Check if at least one selected model has a configured provider
    const selectedModelObjects = llmModels.filter(m => selectedModels.includes(m.id));
    const configuredSelectedModels = selectedModelObjects.filter(m => 
      apiService.isProviderConfigured(m.provider)
    );

    if (configuredSelectedModels.length === 0) {
      alert('No API keys configured for the selected models. Please configure at least one API key to run benchmarks.');
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setCurrentModel('');
    setAutoSaveStatus('idle');
    setLastAutoSavedBenchmarkId('');
    
    try {
      const results = await generateBenchmarkResults(
        selectedModelObjects, 
        [selectedTask],
        (progressPercent, modelName) => {
          setProgress(progressPercent);
          if (modelName) setCurrentModel(modelName);
        }
      );
      
      setBenchmarkResults(results);

      // Auto-save and navigate to results if database is available
      if (databaseService.isAvailable()) {
        const benchmarkId = await autoSaveBenchmark(selectedTask, results);
        
        if (benchmarkId) {
          // Small delay to show the auto-save success message
          setTimeout(() => {
            setSelectedBenchmarkId(benchmarkId);
            setViewMode('auto-saved-results');
          }, 1500);
        }
      }
      
    } catch (error) {
      console.error('Benchmark failed:', error);
      setAutoSaveStatus('error');
    } finally {
      setIsRunning(false);
      setProgress(0);
      setCurrentModel('');
    }
  };

  const handleSaveBenchmark = async () => {
    if (!selectedTask || taskResults.length === 0 || !saveBenchmarkName.trim()) return;

    setIsSaving(true);
    setSaveStatus('idle');
    setSaveError('');

    try {
      // Validate results before saving
      const validResults = taskResults.filter(result => {
        if (!result.modelId) {
          console.warn('Skipping result with missing modelId:', result);
          return false;
        }
        return true;
      });

      if (validResults.length === 0) {
        throw new Error('No valid results to save. Please run the benchmark first.');
      }

      const settings = {
        prioritizePerformance,
        selectedModels: selectedModels,
        timestamp: Date.now(),
        isCustomTask: selectedTask.id.startsWith('custom-'),
        modelCount: validResults.length,
        taskCategory: selectedTask.category,
        taskDifficulty: selectedTask.difficulty
      };

      console.log('Saving benchmark with settings:', settings);
      console.log('Valid results count:', validResults.length);

      const benchmarkId = await databaseService.saveBenchmark(
        saveBenchmarkName.trim(),
        selectedTask,
        validResults,
        llmModels,
        settings
      );

      if (benchmarkId) {
        setSaveStatus('success');
        setTimeout(() => {
          setShowSaveDialog(false);
          setSaveBenchmarkName('');
          setSaveStatus('idle');
        }, 2000);
      } else {
        throw new Error('Failed to save benchmark - no ID returned');
      }

    } catch (error) {
      console.error('Failed to save benchmark:', error);
      setSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const taskResults = benchmarkResults.filter(r => r.taskId === selectedTask?.id);
  const recommendations = selectedTask && taskResults.length > 0 
    ? getModelRecommendations(selectedTask, taskResults, prioritizePerformance)
    : [];

  const topRecommendation = recommendations[0];
  const codeSnippet = topRecommendation && selectedTask 
    ? generateCodeSnippet(topRecommendation.model, selectedTask)
    : '';

  const getModelStatus = (model: LLMModel) => {
    return configuredProviders.includes(model.provider) ? 'configured' : 'unconfigured';
  };

  const isModelSelectable = (model: LLMModel) => {
    return configuredProviders.includes(model.provider);
  };

  if (viewMode === 'history') {
    return (
      <BenchmarkList
        onSelectBenchmark={(id) => {
          setSelectedBenchmarkId(id);
          setViewMode('benchmark-detail');
        }}
        onBack={() => setViewMode('dashboard')}
      />
    );
  }

  if (viewMode === 'benchmark-detail' || viewMode === 'auto-saved-results') {
    return (
      <BenchmarkHistory
        benchmarkId={selectedBenchmarkId}
        onBack={() => setViewMode('dashboard')}
      />
    );
  }

  const configuredModelsCount = llmModels.filter(m => isModelSelectable(m)).length;
  const selectedConfiguredModelsCount = selectedModels.filter(id => {
    const model = llmModels.find(m => m.id === id);
    return model && isModelSelectable(model);
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* API Warning */}
        {showAPIWarning && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div>
                <h3 className="text-yellow-400 font-medium">No API Keys Configured</h3>
                <p className="text-yellow-200 text-sm mt-1">
                  Configure your API keys below to run real benchmarks. Without them, you won't be able to test any models.
                </p>
              </div>
              <button 
                onClick={() => setShowAPIWarning(false)}
                className="text-yellow-400 hover:text-yellow-300"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Auto-save Status */}
        {autoSaveStatus === 'saving' && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              <div>
                <h3 className="text-blue-400 font-medium">Auto-saving Benchmark Results</h3>
                <p className="text-blue-200 text-sm mt-1">
                  Saving your benchmark results to the database...
                </p>
              </div>
            </div>
          </div>
        )}

        {autoSaveStatus === 'success' && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div>
                  <h3 className="text-green-400 font-medium">Benchmark Saved Successfully!</h3>
                  <p className="text-green-200 text-sm mt-1">
                    Your results have been automatically saved. Redirecting to detailed results...
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedBenchmarkId(lastAutoSavedBenchmarkId);
                  setViewMode('auto-saved-results');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <span>View Details</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {autoSaveStatus === 'error' && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <h3 className="text-red-400 font-medium">Auto-save Failed</h3>
                <p className="text-red-200 text-sm mt-1">
                  Results are available below, but couldn't be automatically saved to the database.
                </p>
              </div>
              <button 
                onClick={() => setAutoSaveStatus('idle')}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* API Configuration */}
        <div className="mb-8">
          <APIConfiguration onKeysUpdate={handleAPIKeysUpdate} />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">LLM Benchmarking Dashboard</h1>
          <div className="flex items-center space-x-4">
            {databaseService.isAvailable() && (
              <button
                onClick={() => setViewMode('history')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Archive className="h-4 w-4" />
                <span>View History</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Task Selection */}
          <div className="xl:col-span-1">
            <TaskSelector
              tasks={allTasks}
              selectedTask={selectedTask}
              onTaskSelect={setSelectedTask}
              onCreateCustomTask={handleCreateCustomTask}
              onDeleteCustomTask={handleDeleteCustomTask}
            />
          </div>

          {/* Middle Column - Models and Results */}
          <div className="xl:col-span-2 space-y-8">
            {/* Model Selection */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Settings className="h-6 w-6 mr-2 text-blue-400" />
                  Select Models to Benchmark
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-400">
                    {configuredProviders.length > 0 ? (
                      <span className="text-green-400">
                        {selectedConfiguredModelsCount}/{configuredModelsCount} models selected
                      </span>
                    ) : (
                      <span className="text-red-400">No models available</span>
                    )}
                  </div>
                  
                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-1 bg-gray-700/50 rounded-lg p-1">
                    <button
                      onClick={() => setModelViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        modelViewMode === 'grid'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-600'
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setModelViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        modelViewMode === 'list'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-600'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <label className="text-sm text-gray-400">
                      <input
                        type="checkbox"
                        checked={prioritizePerformance}
                        onChange={(e) => setPriorizePerformance(e.target.checked)}
                        className="mr-2"
                      />
                      Prioritize Performance
                    </label>
                  </div>
                  <button
                    onClick={runBenchmark}
                    disabled={!selectedTask || selectedModels.length === 0 || isRunning}
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    <Play className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
                    <span>{isRunning ? 'Running...' : 'Run Benchmark'}</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {isRunning && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Testing {currentModel}...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Models Display */}
              {modelViewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {llmModels.map((model) => {
                    const status = getModelStatus(model);
                    const selectable = isModelSelectable(model);
                    return (
                      <div key={model.id} className="relative">
                        <ModelCard
                          model={model}
                          isSelected={selectedModels.includes(model.id)}
                          onClick={selectable ? () => handleModelToggle(model.id) : undefined}
                          disabled={!selectable}
                        />
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                          status === 'configured' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {!selectable && <Lock className="h-3 w-3" />}
                          <span>{status === 'configured' ? 'API Ready' : 'No API Key'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {llmModels.map((model) => {
                    const status = getModelStatus(model);
                    const selectable = isModelSelectable(model);
                    const isSelected = selectedModels.includes(model.id);
                    
                    return (
                      <div
                        key={model.id}
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          selectable 
                            ? isSelected
                              ? 'bg-blue-500/20 border-blue-400 cursor-pointer hover:bg-blue-500/30'
                              : 'bg-gray-700/50 border-gray-600 cursor-pointer hover:bg-gray-600/50'
                            : 'bg-gray-800/30 border-gray-700/50 cursor-not-allowed opacity-60'
                        }`}
                        onClick={selectable ? () => handleModelToggle(model.id) : undefined}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isSelected && selectable
                                ? 'bg-blue-500 border-blue-500'
                                : selectable
                                ? 'border-gray-400'
                                : 'border-gray-600 bg-gray-600'
                            }`}>
                              {isSelected && selectable && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                              {!selectable && (
                                <Lock className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{model.name}</h3>
                              <p className="text-sm text-gray-400">{model.provider}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <div className="text-sm font-medium text-white">
                                {(model.contextWindow / 1000).toFixed(0)}K
                              </div>
                              <div className="text-xs text-gray-400">Context</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm font-medium text-white">
                                ${((model.inputPricePerToken + model.outputPricePerToken) * 1000000).toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-400">Per 1M tokens</div>
                            </div>
                            
                            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                              status === 'configured' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {!selectable && <Lock className="h-3 w-3" />}
                              <span>{status === 'configured' ? 'API Ready' : 'No API Key'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* No Configured Models Warning */}
              {configuredProviders.length === 0 && (
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No Models Available</h3>
                  <p className="text-gray-500 mb-4">
                    Configure your API keys above to enable model selection and benchmarking.
                  </p>
                </div>
              )}
            </div>

            {/* Results Summary */}
            {taskResults.length > 0 && selectedTask && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Results</h2>
                  <div className="flex items-center space-x-3">
                    {autoSaveStatus === 'success' && databaseService.isAvailable() && (
                      <button
                        onClick={() => {
                          setSelectedBenchmarkId(lastAutoSavedBenchmarkId);
                          setViewMode('auto-saved-results');
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <span>View Saved Details</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                    {databaseService.isAvailable() && autoSaveStatus !== 'success' && (
                      <button
                        onClick={() => setShowSaveDialog(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Benchmark</span>
                      </button>
                    )}
                  </div>
                </div>
                <BenchmarkResults
                  results={taskResults}
                  models={llmModels}
                  taskName={selectedTask.name}
                  showExportButton={true}
                />
              </div>
            )}
          </div>
        </div>

        {/* Detailed Results */}
        {taskResults.length > 0 && selectedTask && autoSaveStatus !== 'success' && (
          <div className="mt-8">
            <BenchmarkDetails
              results={taskResults}
              models={llmModels}
              task={selectedTask}
            />
          </div>
        )}

        {/* Bottom Section - Recommendations and Code */}
        {recommendations.length > 0 && autoSaveStatus !== 'success' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <ModelRecommendation recommendations={recommendations} />
            {codeSnippet && (
              <CodeSnippet
                code={codeSnippet}
                title={`Implementation for ${topRecommendation?.model.name}`}
              />
            )}
          </div>
        )}

        {/* Save Benchmark Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-white mb-4">Save Benchmark</h3>
              
              {saveStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">Benchmark saved successfully!</span>
                  </div>
                </div>
              )}

              {saveStatus === 'error' && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div>
                      <span className="text-red-400 font-medium">Failed to save benchmark</span>
                      {saveError && (
                        <p className="text-red-300 text-sm mt-1">{saveError}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Benchmark Name
                  </label>
                  <input
                    type="text"
                    value={saveBenchmarkName}
                    onChange={(e) => setSaveBenchmarkName(e.target.value)}
                    placeholder="Enter a name for this benchmark..."
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSaving || saveStatus === 'success'}
                  />
                </div>
                <div className="text-sm text-gray-400">
                  <p><strong>Task:</strong> {selectedTask?.name}</p>
                  <p><strong>Models:</strong> {taskResults.length}</p>
                  {selectedTask?.id.startsWith('custom-') && (
                    <p><strong>Type:</strong> Custom Task</p>
                  )}
                  {!databaseService.isAvailable() && (
                    <p className="text-yellow-400 mt-2">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      Database not available
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setShowSaveDialog(false);
                      setSaveStatus('idle');
                      setSaveError('');
                    }}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {saveStatus === 'success' ? 'Close' : 'Cancel'}
                  </button>
                  {saveStatus !== 'success' && (
                    <button
                      onClick={handleSaveBenchmark}
                      disabled={!saveBenchmarkName.trim() || isSaving || !databaseService.isAvailable()}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;