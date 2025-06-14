# LLM Lab - AI Model Benchmarking Suite

<div align="center">

![LLM Lab Logo](https://img.shields.io/badge/🧠-LLM%20Lab-blue?style=for-the-badge)

**Professional LLM benchmarking and comparison tool for evaluating AI model performance**

[![Made with Bolt](https://img.shields.io/badge/Made%20with-Bolt-purple?style=flat-square)](https://bolt.new)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat-square)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-blue?style=flat-square)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-green?style=flat-square)](https://supabase.com/)

[🚀 Live Demo](https://llm-lab.netlify.app/) | [📖 Documentation](#documentation) | [🤝 Contributing](#contributing)

</div>

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

LLM Lab prioritizes the security and privacy of your data and API credentials. Here's how we protect your information:

### 🔐 API Key Security

**Local Storage Only**
- All API keys are stored exclusively in your browser's `localStorage`
- Keys never leave your device except when making direct API calls to the respective providers
- No API keys are transmitted to our servers or any third-party services

**Direct Provider Communication**
- API calls go directly from your browser to the AI provider APIs (OpenAI, Anthropic, etc.)
- No proxy servers or intermediary services handle your requests
- Your data and credentials remain private between you and the AI providers

**Secure Initialization**
- Environment variables can be used as fallback for development/deployment
- Production deployments should use client-side key entry for maximum security
- Keys are validated before use and cleared on demand

### 🛡️ Content Security Policy (CSP)

We implement a strict Content Security Policy to prevent XSS attacks:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://images.pexels.com;
  font-src 'self';
  connect-src 'self'
    https://api.openai.com
    https://api.anthropic.com
    https://generativelanguage.googleapis.com
    https://api-inference.huggingface.co
    https://api.mistral.ai
    https://*.supabase.co;
">
```

**CSP Benefits:**
- Prevents unauthorized script execution
- Blocks malicious content injection
- Restricts network connections to trusted domains only
- Protects against clickjacking and other attacks

### 🔒 Data Privacy

**Client-Side Processing**
- All benchmark processing happens in your browser
- No sensitive data is transmitted to external servers (except AI providers)
- Results can be stored locally or optionally in your own Supabase instance

**Optional Database Storage**
- Benchmark results can be saved to your own Supabase instance
- You control the database and have full access to your data
- No vendor lock-in - export your data anytime

**No Tracking**
- No analytics or tracking scripts
- No user behavior monitoring
- No data collection beyond what you explicitly save

### 🔧 Security Best Practices

**API Key Management**
```typescript
// API keys are handled securely
const keys = JSON.parse(localStorage.getItem('llm-lab-api-keys') || '{}');

// Direct API calls with your keys
const response = await provider.call(model, prompt, {
  apiKey: keys.providerKey // Never logged or stored elsewhere
});
```

**Input Sanitization**
- All user inputs are properly escaped and validated
- Custom task prompts are treated as text, not executable code
- XSS protection through CSP and React's built-in escaping

**Error Handling**
- API errors don't expose sensitive information
- Failed requests are logged locally without credentials
- Graceful degradation when services are unavailable

### 🚨 Security Recommendations

**For Users:**
1. **Use Strong API Keys**: Generate API keys with minimal required permissions
2. **Regular Key Rotation**: Periodically rotate your API keys for enhanced security
3. **Monitor Usage**: Keep track of API usage through provider dashboards
4. **Secure Environment**: Use the application on trusted devices and networks
5. **Clear Keys**: Use the "Clear All" feature when using shared computers

**For Developers:**
1. **Environment Variables**: Use `.env` files for development, never commit keys to version control
2. **Production Deployment**: Configure CSP headers at the server level for additional protection
3. **HTTPS Only**: Always deploy over HTTPS in production environments
4. **Regular Updates**: Keep dependencies updated for security patches

### 📊 Data Flow Diagram

```
Your Browser ←→ [LLM Lab] ←→ AI Provider APIs
     ↓                           (Direct connection)
localStorage                     
     ↓ (Optional)
Your Supabase DB
```

**Key Points:**
- API keys stored only in your browser
- Direct communication with AI providers
- Optional data persistence in your own database
- No intermediary servers handling sensitive data

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **API Keys** from at least one LLM provider (see [API Setup](#api-setup))
- **Supabase Account** (optional, for data persistence)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/llm-lab.git
   cd llm-lab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup** (optional)
   ```bash
   cp .env.example .env
   # Add your API keys to .env file
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 🔑 API Setup

LLM Lab supports multiple AI providers. You'll need API keys from the providers you want to test:

### 🤖 Supported Providers

| Provider | Models Available | Free Tier | Setup Link |
|----------|------------------|-----------|------------|
| **OpenAI** | GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo | $5 credit | [Get API Key](https://platform.openai.com/api-keys) |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku | $5 credit | [Get API Key](https://console.anthropic.com/settings/keys) |
| **Google AI** | Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini Pro | Generous free tier | [Get API Key](https://aistudio.google.com/app/apikey) |
| **Meta/Llama** | Llama 3.1 405B, Llama 3.1 70B, Llama 3.1 8B, Llama 2 70B | Free tier available | [Get API Key](https://huggingface.co/settings/tokens) |
| **Mistral AI** | Mistral Large 2, Mistral Large, Mistral Medium, Mistral Small, Codestral | $5 credit | [Get API Key](https://console.mistral.ai/api-keys/) |

### 💡 Quick Setup Tips

1. **Start Small**: Begin with **OpenAI GPT-4o Mini** or **Google Gemini Flash** for cost-effective testing
2. **Best Performance**: Try **Anthropic Claude 3.5 Sonnet** for reasoning and coding tasks
3. **Large Context**: Use **Google Gemini 1.5 Pro** for tasks requiring extensive context (up to 2M tokens)
4. **Budget-Friendly**: Most providers offer $5 free credits - no payment required initially
5. **Security**: API keys are stored locally in your browser and never sent to our servers

## 🎯 Usage Guide

### 1. **Configure API Keys**
- Navigate to the API Configuration section
- Enter your API keys for desired providers
- Use the built-in setup guide for step-by-step instructions
- Keys are stored securely in your browser's local storage

### 2. **Select a Benchmark Task**
- Choose from predefined tasks (coding, reasoning, creative, analysis, general)
- Create custom tasks using the AI-powered task generator
- View task details including prompts and expected outputs

### 3. **Choose Models to Test**
- Select multiple models from different providers
- Models without configured API keys will be marked but can still be selected
- Toggle between grid and list view for better organization

### 4. **Run Benchmarks**
- Click "Run Benchmark" to start testing
- Only models with configured API keys will be tested
- Monitor real-time progress with live updates

### 5. **Analyze Results**
- View detailed performance metrics and rankings
- Explore interactive visualizations and charts
- Compare costs, response times, and quality scores
- Export comprehensive PDF reports

### 6. **Save and Review**
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

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18.3.1**: Component-based UI framework
- **TypeScript 5.5.3**: Type-safe JavaScript development
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Vite 5.4.2**: Fast build tool and development server
- **Lucide React**: Beautiful icon library

### Backend & Services
- **Supabase**: Database, authentication, and real-time subscriptions
- **Direct API Integration**: Direct communication with AI providers
- **PWA Support**: Service workers and offline capabilities

### Key Libraries
- **PDF Generation**: jsPDF with autoTable for comprehensive reports
- **API Clients**: Provider-specific SDKs for optimal integration
- **State Management**: React hooks and context for efficient state handling

### Project Structure
```
src/
├── components/          # React components
│   ├── APIConfiguration.tsx
│   ├── BenchmarkResults.tsx
│   ├── BenchmarkDetails.tsx
│   ├── DataVisualization.tsx
│   └── ...
├── services/           # Business logic and API clients
│   ├── apiService.ts
│   ├── databaseService.ts
│   ├── pdfExportService.ts
│   └── aiAssistantService.ts
├── utils/              # Utility functions
│   └── benchmarkEngine.ts
├── data/               # Static data and configurations
│   ├── models.ts
│   └── tasks.ts
└── types/              # TypeScript type definitions
    └── index.ts
```

## 🗄️ Database Setup (Optional)

LLM Lab can run entirely in the browser, but connecting to Supabase enables data persistence and history tracking.

### Supabase Setup

1. **Create a Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Configure environment variables**
   ```bash
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Run database migrations**
   The database schema will be automatically created when you first save a benchmark.

### Database Schema

- **benchmarks**: Stores benchmark configurations and metadata
- **benchmark_results**: Stores individual model results and metrics

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Type checking
npm run type-check   # TypeScript type checking
```

### Development Guidelines

1. **Code Style**: Follow TypeScript best practices and ESLint rules
2. **Components**: Keep components focused and reusable
3. **Type Safety**: Maintain strict TypeScript typing
4. **Performance**: Optimize for both development and production builds
5. **Accessibility**: Ensure all components are accessible
6. **Security**: Follow security best practices for API key handling

### Adding New Providers

1. **Update model data** in `src/data/models.ts`
2. **Add API client** logic in `src/services/apiService.ts`
3. **Update configuration** in `src/components/APIConfiguration.tsx`
4. **Update CSP** in `index.html` to allow connections to the new provider
5. **Test integration** with sample API calls

### Adding New Benchmark Tasks

1. **Add task definition** to `src/data/tasks.ts`
2. **Update task categories** if needed
3. **Test with multiple models** to ensure fair evaluation
4. **Consider quality assessment** criteria for the task type

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deployment Options

- **Netlify**: Connect your GitHub repo for automatic deployments
- **Vercel**: Import project and deploy with zero configuration
- **Static Hosting**: Upload `dist/` folder to any static host
- **Docker**: Use the included Dockerfile for containerized deployment

### Environment Variables for Production

```bash
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Security Considerations for Production

1. **Configure server-level CSP headers** for additional protection
2. **Use HTTPS only** for all production deployments
3. **Set up proper CORS policies** if using custom domains
4. **Monitor for security updates** in dependencies
5. **Configure rate limiting** if needed

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
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Security Contributions

If you discover security vulnerabilities:
1. **Do not** open a public issue
2. **Email** security concerns to the maintainers
3. **Provide** detailed information about the vulnerability
4. **Allow** reasonable time for fixes before disclosure

### Code of Conduct

Please be respectful and inclusive. We're building a welcoming community for everyone interested in AI model evaluation.

## 📚 Documentation

### API Reference
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Google AI API Documentation](https://ai.google.dev/docs)
- [Hugging Face API Documentation](https://huggingface.co/docs/api-inference)
- [Mistral AI API Documentation](https://docs.mistral.ai/)

### Resources
- [Benchmark Task Examples](./docs/benchmark-tasks.md)
- [Quality Assessment Criteria](./docs/quality-assessment.md)
- [Cost Optimization Guide](./docs/cost-optimization.md)
- [Security Best Practices](./docs/security-guide.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Bolt](https://bolt.new)** - For powering the development of this application
- **AI Providers** - OpenAI, Anthropic, Google, Meta, and Mistral for their amazing APIs
- **Open Source Community** - For the incredible tools and libraries that make this possible
- **Contributors** - Everyone who helps improve LLM Lab
- **Security Researchers** - For responsible disclosure of security issues

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/llm-lab/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/llm-lab/discussions)
- **Security**: [Security Policy](SECURITY.md)
- **Email**: support@llmlab.dev

---

<div align="center">

**Made with ❤️ and [Bolt](https://bolt.new)**

[⭐ Star us on GitHub](https://github.com/yourusername/llm-lab) | [🐦 Follow on Twitter](https://twitter.com/llmlab)

</div>