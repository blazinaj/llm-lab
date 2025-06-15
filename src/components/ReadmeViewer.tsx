import React, { useState } from 'react';
import { X, Book, ExternalLink, ChevronRight } from 'lucide-react';

interface ReadmeViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReadmeViewer: React.FC<ReadmeViewerProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  if (!isOpen) return null;

  const navigateToSection = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const readmeContent = `# LLM Lab - AI Model Benchmarking Suite

**Professional LLM benchmarking and comparison tool for evaluating AI model performance**

## ✨ Features

### 🔥 Core Functionality
- **Multi-Provider Support**: Test models from OpenAI, Anthropic, Google AI, Meta/Llama, and Mistral AI
- **Real-Time Benchmarking**: Live progress tracking with detailed performance metrics
- **Custom Task Creation**: Build your own benchmark tasks with AI-powered assistance
- **Comprehensive Analytics**: Performance scoring, cost analysis, and response time metrics
- **Interactive Visualizations**: Dynamic charts and graphs for data analysis
- **PDF Export**: Generate detailed benchmark reports with comprehensive statistics

### 🎯 Advanced Features
- **Auto-Save Results**: Automatic database storage with benchmark history
- **Secure API Key Management**: Client-side storage with enterprise-grade security measures
- **Quality Assessment**: Intelligent evaluation of response quality and relevance
- **Cost Efficiency Analysis**: Performance-to-cost ratio calculations
- **Token Usage Tracking**: Detailed input/output token consumption monitoring
- **Error Handling**: Robust error reporting and fallback mechanisms

### 🛠️ Technical Highlights
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **PWA Support**: Installable progressive web application
- **TypeScript**: Full type safety and enhanced developer experience
- **Modern UI**: Beautiful, accessible interface with smooth animations
- **Database Integration**: Optional Supabase integration for data persistence
- **Security-First Design**: Comprehensive security measures and data protection

## 🔒 Security & Privacy

LLM Lab prioritizes the security and privacy of your data and API credentials:

### 🔐 API Key Security
- **Local Storage Only**: All API keys are stored exclusively in your browser's localStorage
- **Direct Provider Communication**: API calls go directly from your browser to the AI provider APIs
- **Secure Initialization**: Environment variables can be used as fallback for development/deployment

### 🛡️ Content Security Policy (CSP)
We implement a strict Content Security Policy to prevent XSS attacks and unauthorized access.

**CSP Benefits:**
- Prevents unauthorized script execution
- Blocks malicious content injection
- Restricts network connections to trusted domains only
- Protects against clickjacking and other attacks

### 🔒 Data Privacy
- **Client-Side Processing**: All benchmark processing happens in your browser
- **Optional Database Storage**: Benchmark results can be saved to your own Supabase instance
- **No Tracking**: No analytics or tracking scripts

### 🚨 Security Recommendations
**For Users:**
1. **Use Strong API Keys**: Generate API keys with minimal required permissions
2. **Regular Key Rotation**: Periodically rotate your API keys for enhanced security
3. **Monitor Usage**: Keep track of API usage through provider dashboards
4. **Secure Environment**: Use the application on trusted devices and networks
5. **Clear Keys**: Use the "Clear All" feature when using shared computers

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm/yarn
- **API Keys** from at least one LLM provider
- **Supabase Account** (optional, for data persistence)

### Installation Steps
1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/llm-lab.git
   cd llm-lab
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment setup** (optional)
   \`\`\`bash
   cp .env.example .env
   # Add your API keys to .env file
   \`\`\`

4. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open in browser**
   \`\`\`
   http://localhost:5173
   \`\`\`

## 🔑 API Setup

LLM Lab supports multiple AI providers. You'll need API keys from the providers you want to test:

### 🤖 Supported Providers

| Provider | Models Available | Free Tier | Setup Link |
|----------|------------------|-----------|------------|
| **OpenAI** | GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo | $5 credit | Get API Key |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku | $5 credit | Get API Key |
| **Google AI** | Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini Pro | Generous free tier | Get API Key |
| **Meta/Llama** | Llama 3.1 405B, Llama 3.1 70B, Llama 3.1 8B, Llama 2 70B | Free tier available | Get API Key |
| **Mistral AI** | Mistral Large 2, Mistral Large, Mistral Medium, Mistral Small, Codestral | $5 credit | Get API Key |

### 💡 Quick Setup Tips
1. **Start Small**: Begin with **OpenAI GPT-4o Mini** or **Google Gemini Flash** for cost-effective testing
2. **Best Performance**: Try **Anthropic Claude 3.5 Sonnet** for reasoning and coding tasks
3. **Large Context**: Use **Google Gemini 1.5 Pro** for tasks requiring extensive context (up to 2M tokens)
4. **Budget-Friendly**: Most providers offer $5 free credits - no payment required initially
5. **Security**: API keys are stored locally in your browser and never sent to our servers

## 🎯 Usage Guide

### Step-by-Step Instructions

1. **Configure API Keys**
   - Navigate to the API Configuration section
   - Enter your API keys for desired providers
   - Use the built-in setup guide for step-by-step instructions
   - Keys are stored securely in your browser's local storage

2. **Select a Benchmark Task**
   - Choose from predefined tasks (coding, reasoning, creative, analysis, general)
   - Create custom tasks using the AI-powered task generator
   - View task details including prompts and expected outputs

3. **Choose Models to Test**
   - Select multiple models from different providers
   - Models without configured API keys will be marked but can still be selected
   - Toggle between grid and list view for better organization

4. **Run Benchmarks**
   - Click "Run Benchmark" to start testing
   - Only models with configured API keys will be tested
   - Monitor real-time progress with live updates

5. **Analyze Results**
   - View detailed performance metrics and rankings
   - Explore interactive visualizations and charts
   - Compare costs, response times, and quality scores
   - Export comprehensive PDF reports

6. **Save and Review**
   - Results are automatically saved (with Supabase)
   - Browse benchmark history
   - Compare past results and track improvements

## 📊 Understanding the Metrics

### Performance Score (0-100%)
Weighted combination of:
- **Quality Assessment** (80%): Response coherence, task relevance, completeness
- **Response Speed** (20%): Faster responses get higher scores

### Quality Score (0-100%)
Based on:
- Task-specific content analysis (coding patterns, logical structure, creativity)
- Response length appropriateness
- Coherence and readability
- Error detection and handling

### Cost Analysis
- **Input Cost**: Input tokens × provider's input price per token
- **Output Cost**: Output tokens × provider's output price per token
- **Total Cost**: Input cost + output cost
- **Efficiency Ratio**: Performance score ÷ cost × 1000

### Response Time
- **Latency**: Time from request to complete response
- **Processing Time**: Total time including overhead
- Categories: Very Fast (<2s), Fast (2-5s), Moderate (5-10s), Slow (>10s)

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute
1. **🐛 Bug Reports**: Report issues with detailed reproduction steps
2. **💡 Feature Requests**: Suggest new features or improvements
3. **📝 Documentation**: Improve documentation and examples
4. **🔧 Code**: Submit pull requests for fixes and features
5. **🎨 Design**: Enhance UI/UX and accessibility
6. **🔒 Security**: Report security issues responsibly

### Development Process
1. **Fork** the repository
2. **Create** a feature branch (\`git checkout -b feature/amazing-feature\`)
3. **Commit** your changes (\`git commit -m 'Add amazing feature'\`)
4. **Push** to the branch (\`git push origin feature/amazing-feature\`)
5. **Open** a Pull Request

### Code of Conduct
Please be respectful and inclusive. We're building a welcoming community for everyone interested in AI model evaluation.

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Security**: Security Policy
- **Email**: support@llmlab.dev

---

**Made with ❤️ and Bolt**`;

  const sections = [
    { 
      id: 'overview', 
      title: 'Overview', 
      content: readmeContent.split('## ✨ Features')[0] 
    },
    { 
      id: 'features', 
      title: '✨ Features', 
      content: readmeContent.split('## ✨ Features')[1]?.split('## 🔒 Security')[0] 
    },
    { 
      id: 'security', 
      title: '🔒 Security & Privacy', 
      content: readmeContent.split('## 🔒 Security')[1]?.split('## 🚀 Quick Start')[0] 
    },
    { 
      id: 'quickstart', 
      title: '🚀 Quick Start', 
      content: readmeContent.split('## 🚀 Quick Start')[1]?.split('## 🔑 API Setup')[0] 
    },
    { 
      id: 'apisetup', 
      title: '🔑 API Setup', 
      content: readmeContent.split('## 🔑 API Setup')[1]?.split('## 🎯 Usage Guide')[0] 
    },
    { 
      id: 'usage', 
      title: '🎯 Usage Guide', 
      content: readmeContent.split('## 🎯 Usage Guide')[1]?.split('## 📊 Understanding')[0] 
    },
    { 
      id: 'metrics', 
      title: '📊 Understanding the Metrics', 
      content: readmeContent.split('## 📊 Understanding')[1]?.split('## 🤝 Contributing')[0] 
    },
    { 
      id: 'contributing', 
      title: '🤝 Contributing', 
      content: readmeContent.split('## 🤝 Contributing')[1]?.split('## 📞 Support')[0] 
    },
    { 
      id: 'support', 
      title: '📞 Support', 
      content: readmeContent.split('## 📞 Support')[1] 
    },
  ];

  const formatContent = (content: string) => {
    if (!content) return '';
    
    return content
      .split('\n')
      .map((line, index) => {
        // Handle headers
        if (line.startsWith('### ')) {
          return (
            <h3 key={index} className="text-lg font-semibold text-white mt-6 mb-3">
              {line.replace('### ', '')}
            </h3>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className="text-xl font-bold text-white mt-8 mb-4">
              {line.replace('## ', '')}
            </h2>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h1 key={index} className="text-2xl font-bold text-white mb-4">
              {line.replace('# ', '')}
            </h1>
          );
        }
        
        // Handle bullet points
        if (line.startsWith('- **') && line.includes('**:')) {
          const [, title, description] = line.match(/- \*\*(.*?)\*\*: (.*)/) || [];
          return (
            <div key={index} className="flex items-start space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-semibold text-blue-300">{title}</span>
                <span className="text-gray-300">: {description}</span>
              </div>
            </div>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <div key={index} className="flex items-start space-x-2 mb-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-300">{line.replace('- ', '')}</span>
            </div>
          );
        }
        
        // Handle numbered lists
        if (line.match(/^\d+\. /)) {
          const [, number, text] = line.match(/^(\d+)\. (.*)/) || [];
          return (
            <div key={index} className="flex items-start space-x-2 mb-2">
              <span className="text-blue-400 font-semibold min-w-[1.5rem]">{number}.</span>
              <span className="text-gray-300">{text}</span>
            </div>
          );
        }
        
        // Handle bold text
        if (line.includes('**') && !line.startsWith('- **')) {
          const parts = line.split('**');
          return (
            <p key={index} className="text-gray-300 mb-2">
              {parts.map((part, i) => 
                i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part
              )}
            </p>
          );
        }
        
        // Handle code blocks
        if (line.startsWith('```')) {
          return null; // Skip for now
        }
        if (line.includes('`') && !line.includes('```')) {
          const parts = line.split('`');
          return (
            <p key={index} className="text-gray-300 mb-2">
              {parts.map((part, i) => 
                i % 2 === 1 ? 
                  <code key={i} className="bg-gray-800 px-1 py-0.5 rounded text-blue-300 text-sm">{part}</code> : 
                  part
              )}
            </p>
          );
        }
        
        // Handle table headers
        if (line.includes(' | ') && line.includes('**')) {
          const cells = line.split(' | ').map(cell => cell.replace(/\*\*/g, ''));
          return (
            <div key={index} className="grid grid-cols-4 gap-2 bg-gray-700/50 p-3 rounded-t-lg mb-1">
              {cells.map((cell, i) => (
                <div key={i} className="text-white font-semibold text-sm">{cell}</div>
              ))}
            </div>
          );
        }
        
        // Handle table rows
        if (line.includes(' | ') && !line.includes('**') && !line.includes('---')) {
          const cells = line.split(' | ');
          return (
            <div key={index} className="grid grid-cols-4 gap-2 bg-gray-800/30 p-3 border-t border-gray-600 last:rounded-b-lg">
              {cells.map((cell, i) => (
                <div key={i} className="text-gray-300 text-sm">{cell}</div>
              ))}
            </div>
          );
        }
        
        // Handle empty lines
        if (line.trim() === '') {
          return <div key={index} className="h-2"></div>;
        }
        
        // Handle horizontal rules
        if (line.startsWith('---')) {
          return <hr key={index} className="border-gray-600 my-6" />;
        }
        
        // Regular paragraphs
        return (
          <p key={index} className="text-gray-300 mb-2 leading-relaxed">
            {line}
          </p>
        );
      })
      .filter(Boolean);
  };

  const activeContent = sections.find(section => section.id === activeSection);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Book className="h-6 w-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">Documentation</h2>
              <p className="text-gray-400 text-sm">LLM Lab User Guide & Reference</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar Navigation */}
          <div className="w-72 border-r border-gray-700 bg-gray-800/50 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
                Table of Contents
              </h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => navigateToSection(section.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 group ${
                      activeSection === section.id
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white border border-transparent'
                    }`}
                  >
                    <span className="text-sm font-medium">{section.title}</span>
                    <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${
                      activeSection === section.id 
                        ? 'rotate-90 text-blue-400' 
                        : 'text-gray-500 group-hover:text-gray-400'
                    }`} />
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <a
                href="https://github.com/yourusername/llm-lab"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">View on GitHub</span>
              </a>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              <div className="prose prose-invert max-w-none">
                {activeContent && (
                  <div className="animate-in fade-in-50 duration-300">
                    {formatContent(activeContent.content)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 bg-gray-800/50">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>
              Made with ❤️ and <span className="text-purple-400 font-medium">Bolt</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>Last updated: December 2024</span>
              <span>•</span>
              <span className="text-blue-400">{activeContent?.title}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadmeViewer;