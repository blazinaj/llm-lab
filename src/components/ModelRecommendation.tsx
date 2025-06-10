import React from 'react';
import { ModelRecommendation as ModelRecommendationType } from '../types';
import { Sparkles, Award, DollarSign, Zap } from 'lucide-react';

interface ModelRecommendationProps {
  recommendations: ModelRecommendationType[];
}

const ModelRecommendation: React.FC<ModelRecommendationProps> = ({ recommendations }) => {
  const topRecommendation = recommendations[0];
  
  if (!topRecommendation) return null;

  return (
    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-400/50">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">AI Recommendation</h2>
          <p className="text-blue-200 text-sm">Best model for your task</p>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-5 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{topRecommendation.model.name}</h3>
            <p className="text-gray-300">{topRecommendation.model.provider}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">
              {(topRecommendation.score * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-400">Match Score</div>
          </div>
        </div>

        <p className="text-gray-300 mb-4">{topRecommendation.reason}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Award className="h-4 w-4 text-yellow-400" />
            <div>
              <div className="text-sm font-medium text-white">
                {(topRecommendation.performanceRating * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Performance</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            <div>
              <div className="text-sm font-medium text-white">
                {topRecommendation.costEfficiency.toFixed(0)}
              </div>
              <div className="text-xs text-gray-400">Cost Efficiency</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300">Other Recommendations</h4>
        {recommendations.slice(1, 4).map((rec, index) => (
          <div key={rec.model.id} className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white">
                {index + 2}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{rec.model.name}</div>
                <div className="text-xs text-gray-400">{rec.model.provider}</div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-300">
              {(rec.score * 100).toFixed(0)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelRecommendation;