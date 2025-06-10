import React, { useState } from 'react';
import { DetailedBenchmarkResult, LLMModel } from '../types';
import { pdfExportService } from '../services/pdfExportService';
import { benchmarkTasks } from '../data/tasks';
import { 
  Trophy, 
  Clock, 
  DollarSign, 
  Star, 
  TrendingUp, 
  AlertCircle, 
  Download,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  FileText,
  Zap,
  Database,
  Eye,
  Activity
} from 'lucide-react';

interface BenchmarkResultsProps {
  results: DetailedBenchmarkResult[];
  models: LLMModel[];
  taskName: string;
  showExportButton?: boolean;
}

const BenchmarkResults: React.FC<BenchmarkResultsProps> = ({ 
  results, 
  models, 
  taskName, 
  showExportButton = true 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [copiedOutputs, setCopiedOutputs] = useState<Set<string>>(new Set());
  
  const successfulResults = results.filter(r => !r.error);
  const sortedResults = [...successfulResults].sort((a, b) => b.score - a.score);
  const failedResults = results.filter(r => r.error);
  
  const getModel = (modelId: string) => models.find(m => m.id === modelId);
  
  const formatCost = (cost: number) => {
    return cost < 0.001 ? `$${(cost * 1000).toFixed(3)}k` : `$${cost.toFixed(3)}`;
  };
  
  const formatLatency = (latency: number) => {
    return `${(latency / 1000).toFixed(2)}s`;
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-400';
    if (score >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getPerformanceBar = (score: number) => {
    const percentage = score * 100;
    let color = 'bg-red-500';
    if (score >= 0.9) color = 'bg-green-500';
    else if (score >= 0.7) color = 'bg-yellow-500';
    
    return (
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

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
    if (results.length === 0) return;
    
    setIsExporting(true);
    try {
      // Find the task based on the first result's task ID
      const taskId = results[0]?.taskId;
      const task = benchmarkTasks.find(t => t.id === taskId);
      
      if (task) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UI feedback
        pdfExportService.exportBenchmarkResults(results, models, task, taskName);
      } else {
        throw new Error('Task not found for export');
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Trophy className="h-6 w-6 mr-2 text-yellow-400" />
          Benchmark Results: {taskName}
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            {successfulResults.length} successful, {failedResults.length} failed
          </div>
          {showExportButton && successfulResults.length > 0 && (
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Export PDF</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Failed Results Warning */}
      {failedResults.length > 0 && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <h3 className="text-red-400 font-medium">Some models failed to respond</h3>
          </div>
          <div className="text-red-300 text-sm space-y-1">
            {failedResults.map(result => {
              const model = getModel(result.modelId);
              return (
                <div key={result.modelId} className="flex justify-between">
                  <strong>{model?.name || result.modelId}:</strong> 
                  <span className="ml-2 text-red-200">{result.error}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {successfulResults.length === 0 && failedResults.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No benchmark results available</p>
        </div>
      )}

      {/* No Successful Results Message */}
      {successfulResults.length === 0 && failedResults.length > 0 && (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 font-medium">All benchmark attempts failed</p>
          <p className="text-gray-400 text-sm mt-2">
            Please check your API configurations and try again
          </p>
        </div>
      )}

      {/* Successful Results */}
      {successfulResults.length > 0 && (
        <div className="space-y-4">
          {sortedResults.map((result, index) => {
            const model = getModel(result.modelId);
            if (!model) return null;

            const isExpanded = expandedResults.has(result.modelId);
            const isCopied = copiedOutputs.has(result.modelId);

            return (
              <div
                key={result.modelId}
                className={`bg-gray-700/50 rounded-lg border transition-all duration-300 ${
                  index === 0 ? 'border-yellow-400/50 shadow-lg shadow-yellow-500/10' : 'border-gray-600'
                }`}
              >
                {/* Main Result Card */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {index === 0 && (
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-white">{model.name}</h3>
                        <p className="text-sm text-gray-400">{model.provider}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-xl font-bold ${getScoreColor(result.score)}`}>
                          {(result.score * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400">Overall Score</div>
                      </div>
                      <button
                        onClick={() => toggleExpanded(result.modelId)}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-600/50 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">{isExpanded ? 'Hide' : 'Show'} Details</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    {getPerformanceBar(result.score)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-purple-400" />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {(result.quality * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400">Quality</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {formatLatency(result.latency)}
                        </div>
                        <div className="text-xs text-gray-400">Latency</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {formatCost(result.cost)}
                        </div>
                        <div className="text-xs text-gray-400">Cost</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-orange-400" />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {result.cost > 0 ? (result.score / result.cost * 1000).toFixed(0) : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">Efficiency</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Output Preview */}
                  {result.output && !isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Output Preview</h4>
                      <div className="bg-gray-800/50 rounded-lg p-3 max-h-20 overflow-hidden">
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {result.output.slice(0, 120)}
                          {result.output.length > 120 && '...'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-600 p-5">
                    <div className="space-y-6">
                      {/* Detailed Metrics */}
                      <div>
                        <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                          <Activity className="h-5 w-5 mr-2 text-blue-400" />
                          Detailed Metrics
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(result.score)} mb-1`}>
                              {(result.score * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-400">Overall Score</div>
                          </div>
                          
                          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-400 mb-1">
                              {(result.quality * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-400">Quality Rating</div>
                          </div>
                          
                          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-400 mb-1">
                              {formatLatency(result.latency)}
                            </div>
                            <div className="text-xs text-gray-400">Response Time</div>
                          </div>
                          
                          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-400 mb-1">
                              {formatCost(result.cost)}
                            </div>
                            <div className="text-xs text-gray-400">Total Cost</div>
                          </div>
                        </div>
                      </div>

                      {/* Token Usage */}
                      <div>
                        <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                          <Database className="h-5 w-5 mr-2 text-green-400" />
                          Token Usage & Efficiency
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400">Input Tokens</span>
                              <FileText className="h-4 w-4 text-blue-400" />
                            </div>
                            <div className="text-xl font-bold text-white">{result.inputTokens.toLocaleString()}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              ${((result.inputTokens * model.inputPricePerToken)).toFixed(6)}
                            </div>
                          </div>
                          
                          <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400">Output Tokens</span>
                              <Zap className="h-4 w-4 text-orange-400" />
                            </div>
                            <div className="text-xl font-bold text-white">{result.outputTokens.toLocaleString()}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              ${((result.outputTokens * model.outputPricePerToken)).toFixed(6)}
                            </div>
                          </div>
                          
                          <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400">Efficiency Score</span>
                              <TrendingUp className="h-4 w-4 text-purple-400" />
                            </div>
                            <div className="text-xl font-bold text-white">
                              {result.cost > 0 ? (result.score / result.cost * 1000).toFixed(0) : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Score per $0.001
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Full Output */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-white flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-yellow-400" />
                            Complete Model Output
                          </h4>
                          <button
                            onClick={() => copyOutput(result.modelId, result.rawOutput || result.output || '')}
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
                                <span className="text-gray-400 text-sm">Copy Output</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                          <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                            {result.rawOutput || result.output || 'No output generated'}
                          </pre>
                        </div>
                      </div>

                      {/* Performance Analysis */}
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="text-blue-400 font-medium mb-2">Performance Analysis</h4>
                        <div className="text-sm text-blue-200 space-y-1">
                          <div><strong>Ranking:</strong> #{index + 1} out of {sortedResults.length} models tested</div>
                          <div><strong>Performance Tier:</strong> {
                            result.score >= 0.9 ? 'Excellent (90%+)' :
                            result.score >= 0.8 ? 'Very Good (80-89%)' :
                            result.score >= 0.7 ? 'Good (70-79%)' :
                            result.score >= 0.6 ? 'Fair (60-69%)' : 'Needs Improvement (<60%)'
                          }</div>
                          <div><strong>Speed Category:</strong> {
                            result.latency < 2000 ? 'Very Fast (<2s)' :
                            result.latency < 5000 ? 'Fast (2-5s)' :
                            result.latency < 10000 ? 'Moderate (5-10s)' : 'Slow (>10s)'
                          }</div>
                          <div><strong>Cost Tier:</strong> {
                            result.cost < 0.001 ? 'Very Economical' :
                            result.cost < 0.01 ? 'Economical' :
                            result.cost < 0.05 ? 'Moderate' : 'Premium'
                          }</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BenchmarkResults;