import React, { useState, useEffect } from 'react';
import { SavedBenchmark, databaseService } from '../services/databaseService';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Trophy, 
  Eye, 
  Trash2, 
  Database,
  Filter,
  Search,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

interface BenchmarkListProps {
  onSelectBenchmark: (id: string) => void;
  onBack: () => void;
}

const BenchmarkList: React.FC<BenchmarkListProps> = ({ onSelectBenchmark, onBack }) => {
  const [benchmarks, setBenchmarks] = useState<SavedBenchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');

  useEffect(() => {
    loadBenchmarks();
  }, []);

  const loadBenchmarks = async () => {
    setLoading(true);
    try {
      const data = await databaseService.getBenchmarks();
      setBenchmarks(data);
    } catch (error) {
      console.error('Failed to load benchmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await databaseService.deleteBenchmark(id);
        setBenchmarks(prev => prev.filter(b => b.id !== id));
      } catch (error) {
        console.error('Failed to delete benchmark:', error);
        alert('Failed to delete benchmark');
      }
    }
  };

  const filteredBenchmarks = benchmarks.filter(benchmark => {
    const matchesSearch = benchmark.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         benchmark.task_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || benchmark.task_category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedBenchmarks = [...filteredBenchmarks].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'score':
        return (b.best_score || 0) - (a.best_score || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const categories = Array.from(new Set(benchmarks.map(b => b.task_category)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  if (!databaseService.isAvailable()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
        <div className="container mx-auto px-6 py-8">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">Database Not Connected</h2>
            <p className="text-yellow-200 mb-4">
              Connect to Supabase to save and view benchmark history.
            </p>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Database className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Benchmark History</h1>
              <p className="text-gray-400">View and manage your saved benchmarks</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search benchmarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'name')}
              className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
            </select>

            <div className="text-sm text-gray-400 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              {sortedBenchmarks.length} benchmark{sortedBenchmarks.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Benchmark Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading benchmarks...</p>
          </div>
        ) : sortedBenchmarks.length === 0 ? (
          <div className="text-center py-12">
            <Database className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No benchmarks found</h3>
            <p className="text-gray-500">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Run your first benchmark to see results here'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBenchmarks.map((benchmark) => (
              <div
                key={benchmark.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{benchmark.name}</h3>
                    <p className="text-gray-400 text-sm">{benchmark.task_name}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor(benchmark.task_difficulty)}`}>
                    {benchmark.task_difficulty}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    <div>
                      <div className="text-sm font-medium text-white">
                        {benchmark.best_score ? `${(benchmark.best_score * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400">Best Score</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <div>
                      <div className="text-sm font-medium text-white">
                        ${benchmark.avg_cost ? benchmark.avg_cost.toFixed(4) : '0.00'}
                      </div>
                      <div className="text-xs text-gray-400">Avg Cost</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(benchmark.created_at)}</span>
                  </div>
                  <div>{benchmark.result_count} model{benchmark.result_count !== 1 ? 's' : ''}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectBenchmark(benchmark.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => handleDelete(benchmark.id, benchmark.name)}
                    className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BenchmarkList;