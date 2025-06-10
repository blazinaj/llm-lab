import React, { useState } from 'react';
import { DetailedBenchmarkResult, LLMModel, BenchmarkTask } from '../types';
import { pdfExportService } from '../services/pdfExportService';
import DataVisualization from './DataVisualization';
import { 
  Clock, 
  DollarSign, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Copy, 
  Check,
  Eye,
  EyeOff,
  BarChart3,
  Zap,
  Download,
  TrendingUp,
  Activity
} from 'lucide-react';

interface BenchmarkDetailsProps {
  results: DetailedBenchmarkResult[];
  models: LLMModel[];
  task: BenchmarkTask;
  benchmarkName?: string;
}

const BenchmarkDetails: React.FC<BenchmarkDetailsProps> = ({ results, models, task, benchmarkName }) => {
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [copiedOutputs, setCopiedOutputs] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [showVisualization, setShowVisualization] = useState(true);

  const toggleExpanded = (modelId: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(modelId)) {
      newExpanded.delete(modelId);
    } else {
      newExpanded.add(modelId);
    }
    setExpandedResults(newExpanded);
  };

  const copyOutput = async (modelId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedOutputs(new Set([...copiedOutputs, modelId]));
      setTimeout(() => {
        setCopiedOutputs(prev => {
          const newSet = new Set(prev);
          newSet.delete(modelId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UI feedback
      pdfExportService.exportBenchmarkResults(results, models, task, benchmarkName);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getModel = (modelId: string) => models.find(m => m.id === modelId);
  
  const formatCost = (cost: number) => {
    return cost < 0.001 ? `$${(cost * 1000).toFixed(3)}k` : `$${cost.toFixed(3)}`;
  };
  
  const formatLatency = (latency: number) => {
    return `${(latency / 1000).toFixed(2)}s`;
  };

  const getStatusIcon = (result: DetailedBenchmarkResult) => {
    if (result.error) {
      return <AlertCircle className="h-5 w-5 text-red-400" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-400" />;
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-400';
    if (score >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const sortedResults = [...results].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-8">
      {/* Data Visualization Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white flex items-center">
            <BarChart3 className="h-6 w-6 mr-3 text-blue-400" />
            Performance Analytics
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowVisualization(!showVisualization)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {showVisualization ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showVisualization ? 'Hide' : 'Show'} Charts</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Export PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {showVisualization && (
          <DataVisualization results={results} models={models} />
        )}
      </div>

      {/* Benchmark Details Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <Activity className="h-6 w-6 mr-3 text-blue-400" />
              Detailed Results
            </h2>
            <p className="text-gray-400 mt-1">{task.name} - Individual Model Performance</p>
          </div>
          <div className="text-sm text-gray-400">
            {results.filter(r => !r.error).length} / {results.length} successful
          </div>
        </div>

        {/* Task Information */}
        <div className="bg-gray-700/30 rounded-lg p-5 mb-6">
          <h3 className="text-lg font-medium text-white mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-400" />
            Task Prompt
          </h3>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
              {task.prompt}
            </pre>
          </div>
          <div className="flex items-center space-x-4 mt-3 text-sm">
            <span className="text-gray-400">Category: <span className="text-white">{task.category}</span></span>
            <span className="text-gray-400">Difficulty: <span className="text-white capitalize">{task.difficulty}</span></span>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {sortedResults.map((result, index) => {
            const model = getModel(result.modelId);
            if (!model) return null;

            const isExpanded = expandedResults.has(result.modelId);
            const isCopied = copiedOutputs.has(result.modelId);

            return (
              <div
                key={result.modelId}
                className={`bg-gray-700/30 rounded-lg border transition-all duration-300 ${
                  result.error ? 'border-red-500/50' : 'border-gray-600'
                }`}
              >
                {/* Header */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(result)}
                      <div>
                        <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                        <p className="text-gray-400">{model.provider}</p>
                      </div>
                      {index === 0 && !result.error && (
                        <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                          Best Performance
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => toggleExpanded(result.modelId)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600/50 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                    >
                      {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="text-sm">{isExpanded ? 'Hide' : 'Show'} Details</span>
                    </button>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className={`text-xl font-bold ${getPerformanceColor(result.score)}`}>
                        {result.error ? 'Error' : `${(result.score * 100).toFixed(1)}%`}
                      </div>
                      <div className="text-xs text-gray-400">Score</div>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <div className="text-center">
                        <div className="text-sm font-medium text-white">{formatLatency(result.latency)}</div>
                        <div className="text-xs text-gray-400">Latency</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <div className="text-center">
                        <div className="text-sm font-medium text-white">{formatCost(result.cost)}</div>
                        <div className="text-xs text-gray-400">Cost</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2">
                      <FileText className="h-4 w-4 text-purple-400" />
                      <div className="text-center">
                        <div className="text-sm font-medium text-white">{result.inputTokens}</div>
                        <div className="text-xs text-gray-400">Input Tokens</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2">
                      <Zap className="h-4 w-4 text-orange-400" />
                      <div className="text-center">
                        <div className="text-sm font-medium text-white">{result.outputTokens}</div>
                        <div className="text-xs text-gray-400">Output Tokens</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-600 p-5">
                    {result.error ? (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <h4 className="text-red-400 font-medium mb-2">Error Details</h4>
                        <p className="text-red-300 text-sm">{result.error}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-medium">Model Output</h4>
                            <button
                              onClick={() => copyOutput(result.modelId, result.rawOutput)}
                              className="flex items-center space-x-2 px-3 py-1.5 bg-gray-600/50 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="h-4 w-4 text-green-400" />
                                  <span className="text-green-400 text-sm">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-400 text-sm">Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                              {result.rawOutput || 'No output generated'}
                            </pre>
                          </div>
                        </div>

                        {/* Additional Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-800/30 rounded-lg p-3">
                            <div className="text-gray-400 text-xs mb-1">Quality Score</div>
                            <div className="text-white font-medium">{(result.quality * 100).toFixed(1)}%</div>
                          </div>
                          <div className="bg-gray-800/30 rounded-lg p-3">
                            <div className="text-gray-400 text-xs mb-1">Processing Time</div>
                            <div className="text-white font-medium">{formatLatency(result.processingTime || result.latency)}</div>
                          </div>
                          <div className="bg-gray-800/30 rounded-lg p-3">
                            <div className="text-gray-400 text-xs mb-1">Efficiency Ratio</div>
                            <div className="text-white font-medium">
                              {result.cost > 0 ? (result.score / result.cost * 1000).toFixed(0) : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BenchmarkDetails;