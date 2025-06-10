import React, { useState } from 'react';
import { DetailedBenchmarkResult, LLMModel } from '../types';
import { 
  BarChart3, 
  Clock, 
  DollarSign, 
  Zap, 
  Database, 
  TrendingUp,
  Award,
  Activity,
  PieChart,
  Target
} from 'lucide-react';

interface DataVisualizationProps {
  results: DetailedBenchmarkResult[];
  models: LLMModel[];
}

type ChartType = 'score' | 'latency' | 'cost' | 'tokens' | 'efficiency' | 'quality';

const DataVisualization: React.FC<DataVisualizationProps> = ({ results, models }) => {
  const [activeChart, setActiveChart] = useState<ChartType>('score');

  // Filter successful results and sort them
  const successfulResults = results.filter(r => !r.error);
  const sortedResults = [...successfulResults].sort((a, b) => {
    switch (activeChart) {
      case 'score':
      case 'quality':
      case 'efficiency':
        return b.score - a.score;
      case 'latency':
        return a.latency - b.latency; // Lower is better
      case 'cost':
        return a.cost - b.cost; // Lower is better
      case 'tokens':
        return b.outputTokens - a.outputTokens;
      default:
        return b.score - a.score;
    }
  });

  const getModel = (modelId: string) => models.find(m => m.id === modelId);

  const chartOptions = [
    {
      type: 'score' as ChartType,
      label: 'Performance Score',
      icon: Award,
      color: 'blue',
      description: 'Overall benchmark performance ranking'
    },
    {
      type: 'latency' as ChartType,
      label: 'Response Time',
      icon: Clock,
      color: 'green',
      description: 'How quickly each model responds'
    },
    {
      type: 'cost' as ChartType,
      label: 'Cost Analysis',
      icon: DollarSign,
      color: 'yellow',
      description: 'Cost per benchmark run comparison'
    },
    {
      type: 'tokens' as ChartType,
      label: 'Token Usage',
      icon: Database,
      color: 'purple',
      description: 'Input and output token consumption'
    },
    {
      type: 'efficiency' as ChartType,
      label: 'Cost Efficiency',
      icon: TrendingUp,
      color: 'orange',
      description: 'Performance value per dollar spent'
    },
    {
      type: 'quality' as ChartType,
      label: 'Output Quality',
      icon: Target,
      color: 'pink',
      description: 'Quality assessment of generated output'
    }
  ];

  const getChartValue = (result: DetailedBenchmarkResult, type: ChartType) => {
    switch (type) {
      case 'score':
        return result.score * 100;
      case 'latency':
        return result.latency / 1000; // Convert to seconds
      case 'cost':
        return result.cost * 1000; // Convert to per-thousand for better readability
      case 'tokens':
        return result.outputTokens;
      case 'efficiency':
        return result.cost > 0 ? (result.score / result.cost * 1000) : 0;
      case 'quality':
        return result.quality * 100;
      default:
        return result.score * 100;
    }
  };

  const getValueFormat = (value: number, type: ChartType) => {
    switch (type) {
      case 'score':
      case 'quality':
        return `${value.toFixed(1)}%`;
      case 'latency':
        return `${value.toFixed(2)}s`;
      case 'cost':
        return `$${(value / 1000).toFixed(4)}`;
      case 'tokens':
        return value.toLocaleString();
      case 'efficiency':
        return value.toFixed(0);
      default:
        return value.toFixed(1);
    }
  };

  const getColorClass = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      pink: 'bg-pink-500'
    };
    return colors[color as keyof typeof colors] || 'bg-blue-500';
  };

  const getTextColorClass = (color: string) => {
    const colors = {
      blue: 'text-blue-400',
      green: 'text-green-400',
      yellow: 'text-yellow-400',
      purple: 'text-purple-400',
      orange: 'text-orange-400',
      pink: 'text-pink-400'
    };
    return colors[color as keyof typeof colors] || 'text-blue-400';
  };

  const getBorderColorClass = (color: string) => {
    const colors = {
      blue: 'border-blue-400',
      green: 'border-green-400',
      yellow: 'border-yellow-400',
      purple: 'border-purple-400',
      orange: 'border-orange-400',
      pink: 'border-pink-400'
    };
    return colors[color as keyof typeof colors] || 'border-blue-400';
  };

  const currentOption = chartOptions.find(opt => opt.type === activeChart)!;
  const maxValue = Math.max(...sortedResults.map(r => getChartValue(r, activeChart)));

  if (successfulResults.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No Data to Visualize</h3>
          <p className="text-gray-500">Run successful benchmarks to see data visualizations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <BarChart3 className="h-6 w-6 mr-2 text-blue-400" />
          Performance Analytics
        </h2>
        <div className="text-sm text-gray-400">
          {successfulResults.length} models compared
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {chartOptions.map((option) => {
          const IconComponent = option.icon;
          const isActive = activeChart === option.type;
          
          return (
            <button
              key={option.type}
              onClick={() => setActiveChart(option.type)}
              className={`p-4 rounded-lg border transition-all duration-200 text-center ${
                isActive 
                  ? `${getBorderColorClass(option.color)} bg-${option.color}-500/20 shadow-lg` 
                  : 'border-gray-600 bg-gray-700/30 hover:bg-gray-600/50 hover:border-gray-500'
              }`}
            >
              <IconComponent className={`h-6 w-6 mx-auto mb-2 ${
                isActive ? getTextColorClass(option.color) : 'text-gray-400'
              }`} />
              <div className={`font-medium text-sm ${
                isActive ? 'text-white' : 'text-gray-300'
              }`}>
                {option.label}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {option.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Chart Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-medium ${getTextColorClass(currentOption.color)}`}>
            {currentOption.label} Comparison
          </h3>
          <div className="text-sm text-gray-400">
            {activeChart === 'latency' || activeChart === 'cost' ? 'Lower is better' : 'Higher is better'}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="space-y-3">
          {sortedResults.map((result, index) => {
            const model = getModel(result.modelId);
            if (!model) return null;

            const value = getChartValue(result, activeChart);
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const isTopPerformer = index === 0;

            return (
              <div
                key={result.modelId}
                className={`bg-gray-700/50 rounded-lg p-4 border transition-all duration-300 hover:bg-gray-600/50 ${
                  isTopPerformer ? getBorderColorClass(currentOption.color) + ' shadow-lg' : 'border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {isTopPerformer && (
                      <div className={`w-6 h-6 ${getColorClass(currentOption.color)} rounded-full flex items-center justify-center`}>
                        <Award className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-white">{model.name}</h4>
                      <p className="text-sm text-gray-400">{model.provider}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getTextColorClass(currentOption.color)}`}>
                      {getValueFormat(value, activeChart)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Rank #{index + 1}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-800 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ${getColorClass(currentOption.color)}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                {/* Additional Metrics for Context */}
                <div className="grid grid-cols-3 gap-4 text-xs text-gray-400">
                  <div>
                    <span className="font-medium">Score:</span> {(result.score * 100).toFixed(1)}%
                  </div>
                  <div>
                    <span className="font-medium">Latency:</span> {(result.latency / 1000).toFixed(2)}s
                  </div>
                  <div>
                    <span className="font-medium">Cost:</span> ${result.cost.toFixed(4)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {getValueFormat(Math.max(...sortedResults.map(r => getChartValue(r, activeChart))), activeChart)}
            </div>
            <div className="text-sm text-gray-400">Best Performance</div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {getValueFormat(
                sortedResults.reduce((sum, r) => sum + getChartValue(r, activeChart), 0) / sortedResults.length,
                activeChart
              )}
            </div>
            <div className="text-sm text-gray-400">Average</div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">
              {getValueFormat(Math.min(...sortedResults.map(r => getChartValue(r, activeChart))), activeChart)}
            </div>
            <div className="text-sm text-gray-400">Lowest</div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {(((Math.max(...sortedResults.map(r => getChartValue(r, activeChart))) - 
                  Math.min(...sortedResults.map(r => getChartValue(r, activeChart)))) / 
                  Math.max(...sortedResults.map(r => getChartValue(r, activeChart)))) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Variance</div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className={`mt-6 bg-${currentOption.color}-500/10 border border-${currentOption.color}-500/30 rounded-lg p-4`}>
          <h4 className={`${getTextColorClass(currentOption.color)} font-medium mb-2`}>Key Insights</h4>
          <div className={`text-sm text-${currentOption.color}-200 space-y-1`}>
            {activeChart === 'score' && (
              <>
                <div>• Top performer: <strong>{getModel(sortedResults[0]?.modelId)?.name}</strong> with {(sortedResults[0]?.score * 100).toFixed(1)}% score</div>
                <div>• Performance spread: {((sortedResults[0]?.score - sortedResults[sortedResults.length - 1]?.score) * 100).toFixed(1)} percentage points difference</div>
                <div>• {sortedResults.filter(r => r.score >= 0.8).length} models achieved 80%+ performance</div>
              </>
            )}
            {activeChart === 'latency' && (
              <>
                <div>• Fastest model: <strong>{getModel(sortedResults[0]?.modelId)?.name}</strong> at {(sortedResults[0]?.latency / 1000).toFixed(2)}s</div>
                <div>• Speed range: {((sortedResults[sortedResults.length - 1]?.latency - sortedResults[0]?.latency) / 1000).toFixed(1)}s difference</div>
                <div>• {sortedResults.filter(r => r.latency < 5000).length} models responded under 5 seconds</div>
              </>
            )}
            {activeChart === 'cost' && (
              <>
                <div>• Most economical: <strong>{getModel(sortedResults[0]?.modelId)?.name}</strong> at ${sortedResults[0]?.cost.toFixed(4)}</div>
                <div>• Cost range: ${((sortedResults[sortedResults.length - 1]?.cost - sortedResults[0]?.cost)).toFixed(4)} difference</div>
                <div>• Average cost per run: ${(sortedResults.reduce((sum, r) => sum + r.cost, 0) / sortedResults.length).toFixed(4)}</div>
              </>
            )}
            {activeChart === 'tokens' && (
              <>
                <div>• Most verbose: <strong>{getModel(sortedResults[0]?.modelId)?.name}</strong> with {sortedResults[0]?.outputTokens.toLocaleString()} tokens</div>
                <div>• Token efficiency: Higher output doesn't always mean better quality</div>
                <div>• Total tokens generated: {sortedResults.reduce((sum, r) => sum + r.outputTokens, 0).toLocaleString()}</div>
              </>
            )}
            {activeChart === 'efficiency' && (
              <>
                <div>• Best value: <strong>{getModel(sortedResults[0]?.modelId)?.name}</strong> delivers highest quality per dollar</div>
                <div>• Consider both performance and cost for optimal selection</div>
                <div>• {sortedResults.filter(r => r.cost > 0 && (r.score / r.cost * 1000) > 1000).length} models offer excellent value</div>
              </>
            )}
            {activeChart === 'quality' && (
              <>
                <div>• Highest quality: <strong>{getModel(sortedResults[0]?.modelId)?.name}</strong> with {(sortedResults[0]?.quality * 100).toFixed(1)}% quality score</div>
                <div>• Quality assessment based on response coherence and task relevance</div>
                <div>• {sortedResults.filter(r => r.quality >= 0.9).length} models achieved 90%+ quality rating</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;