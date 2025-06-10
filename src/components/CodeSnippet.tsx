import React, { useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';

interface CodeSnippetProps {
  code: string;
  title: string;
}

const CodeSnippet: React.FC<CodeSnippetProps> = ({ code, title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Code2 className="h-5 w-5 text-blue-400" />
          <h3 className="text-white font-medium">{title}</h3>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
        >
          {copied ? (
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
      
      <div className="p-4">
        <pre className="text-sm text-gray-300 overflow-x-auto">
          <code className="language-javascript">{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeSnippet;