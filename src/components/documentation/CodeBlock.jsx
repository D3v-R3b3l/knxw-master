import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ language = 'text', code = '', children }) {
  const [copied, setCopied] = useState(false);

  // Use children if code prop is not provided, and ensure we have a string
  const codeContent = code || children || '';
  const cleanCode = typeof codeContent === 'string' ? codeContent.trim() : String(codeContent).trim();

  const copyToClipboard = async () => {
    if (!cleanCode) return;
    
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (!cleanCode) {
    return (
      <div className="bg-[#111111] border border-[#262626] rounded-lg p-4 my-4">
        <p className="text-[#a3a3a3] text-sm">No code provided</p>
      </div>
    );
  }

  return (
    <div className="relative group bg-[#111111] border border-[#262626] rounded-lg my-4 overflow-hidden">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a0a] border-b border-[#262626]">
        <span className="text-xs font-medium text-[#a3a3a3] uppercase tracking-wide">
          {language}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 px-2 py-1 text-xs text-[#a3a3a3] hover:text-white transition-colors duration-200 rounded"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code className={`language-${language} text-[#e5e7eb]`}>
            {cleanCode}
          </code>
        </pre>
      </div>
    </div>
  );
}