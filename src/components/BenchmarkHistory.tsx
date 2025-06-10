import React, { useState, useEffect } from 'react';
import { SavedBenchmark, SavedBenchmarkResult, databaseService } from '../services/databaseService';
import { benchmarkTasks } from '../data/tasks';
import { llmModels } from '../data/models';
import { pdfExportService } from '../services/pdfExportService';
import BenchmarkDetails from './BenchmarkDetails';
import BenchmarkResults from './BenchmarkResults';
import { ArrowLeft, Calendar, Hash, Tag, Clock, Download } from 'lucide-react';

interface BenchmarkHistoryProps {
  benchmarkId: string;
  onBack: () => void;
}

const BenchmarkHistory: React.FC<BenchmarkHistoryProps> = ({ benchmarkId, onBack }) => {
  const [benchmark, setBenchmark] = useState<SavedBenchmark | null>(null);
  const [results, setResults] = useState<SavedBenchmarkResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadBenchmark();
  }, [benchmarkId]);

  const loadBenchmark = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await databaseService.getBenchmarkById(benchmarkId);
      if (data) {
        setBenchmark(data.benchmark);
        
        // Enrich results with task input
        const task = benchmarkTasks.find(t => t.id === data.benchmark.task_id);
        const enrichedResults = data.results.map(result => ({
          ...result,
          input: task?.prompt || ''
        }));
        
        setResults(enrichedResults);
      } else {
        setError('Benchmark not found');
      }
    } catch (err) {
      console.error('Failed to load benchmark:', err);
      setError('Failed to load benchmark');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!benchmark) return;
    
    setIsExporting(true);
    try {
      const task = benchmarkTasks.find(t => t.id === benchmark.task_id);
      if (task) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UI feedback
        pdfExportService.exportBenchmarkHistory(benchmark, results, llmModels, task);
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      'coding': 'bg-blue-500',
      'reasoning': 'bg-purple-500',
      'creative': 'bg-pink-500',
      'analysis': 'bg-orange-500',
      'general': 'bg-gray-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading benchmark...</p>
        </div>
      </div>
    );
  }

  if (error || !benchmark) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
        <div className="container mx-auto px-6 py-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">Error</h2>
            <p className="text-red-200 mb-4">{error}</p>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to History
            </button>
          </div>
        </div>
      </div>
    );
  }

  const task = benchmarkTasks.find(t => t.id === benchmark.task_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{benchmark.name}</h1>
              <p className="text-gray-400">Benchmark details and results</p>
            </div>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Export PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Benchmark Info */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-sm font-medium text-white">{formatDate(benchmark.created_at)}</div>
                <div className="text-xs text-gray-400">Created</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Tag className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-sm font-medium text-white">{benchmark.task_name}</div>
                <div className="text-xs text-gray-400">Task</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getCategoryColor(benchmark.task_category)}`}></div>
              <div>
                <div className="text-sm font-medium text-white capitalize">{benchmark.task_category}</div>
                <div className="text-xs text-gray-400">Category</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor(benchmark.task_difficulty)}`}>
                {benchmark.task_difficulty}
              </div>
              <div>
                <div className="text-sm font-medium text-white">Difficulty</div>
                <div className="text-xs text-gray-400">Level</div>
              </div>
            </div>
          </div>

          {/* Settings */}
          {benchmark.settings && Object.keys(benchmark.settings).length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Benchmark Settings</h3>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <pre className="text-sm text-gray-300">
                  {JSON.stringify(benchmark.settings, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-8">
          <BenchmarkResults
            results={results}
            models={llmModels}
            taskName={benchmark.task_name}
          />
        </div>

        {/* Detailed Results */}
        {task && (
          <BenchmarkDetails
            results={results}
            models={llmModels}
            task={task}
            benchmarkName={benchmark.name}
          />
        )}
      </div>
    </div>
  );
};

export default BenchmarkHistory;