import React, { useState } from 'react';
import { Brain, Zap, BarChart3, ExternalLink, Book } from 'lucide-react';
import ReadmeViewer from './ReadmeViewer';

const Header: React.FC = () => {
  const [showReadme, setShowReadme] = useState(false);

  return (
    <>
      <header className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Brain className="h-10 w-10 text-blue-400" />
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  LLM Lab
                </h1>
                <p className="text-blue-200 text-sm">AI Model Benchmarking Suite</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Documentation Button */}
              <button
                onClick={() => setShowReadme(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 rounded-lg transition-all duration-200 group"
              >
                <Book className="h-4 w-4 text-blue-400 group-hover:text-blue-300" />
                <span className="text-blue-300 group-hover:text-blue-200 font-medium">Documentation</span>
              </button>

              {/* Made with Bolt Badge */}
              <a
                href="https://bolt.new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/30 rounded-lg hover:from-purple-600/30 hover:to-blue-600/30 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-blue-400 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">⚡</span>
                  </div>
                  <div className="text-sm">
                    <div className="text-purple-300 font-medium">Made with</div>
                    <div className="text-white font-bold -mt-1">Bolt</div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* README Viewer Modal */}
      <ReadmeViewer 
        isOpen={showReadme} 
        onClose={() => setShowReadme(false)} 
      />
    </>
  );
};

export default Header;