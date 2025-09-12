'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CodePreviewProps {
  code: string;
  language: string;
  fileName?: string;
  className?: string;
}

export function CodePreview({ code, language, fileName, className }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      python: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      html: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      css: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      java: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      cpp: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      csharp: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
      php: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      ruby: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      go: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      rust: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      sql: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    };
    return colors[lang.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={getLanguageColor(language)}>
              {language.toUpperCase()}
            </Badge>
            {fileName && (
              <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                {fileName}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8"
          >
            {copied ? (
              <span className="text-green-600 dark:text-green-400">Copied!</span>
            ) : (
              <span>Copy</span>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <pre className="overflow-auto max-h-96 p-4 text-sm leading-relaxed bg-gray-50 dark:bg-gray-900">
            <code className={cn(
              "font-mono",
              getLanguageHighlight(language)
            )}>
              {code}
            </code>
          </pre>
          
          {/* Line numbers overlay */}
          <div className="absolute top-0 left-0 p-4 pointer-events-none select-none">
            <div className="text-gray-400 dark:text-gray-500 text-sm font-mono leading-relaxed">
              {code.split('\n').map((_, index) => (
                <div key={index} className="text-right w-8 inline-block mr-4">
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getLanguageHighlight(language: string): string {
  // Basic syntax highlighting classes
  const highlights: Record<string, string> = {
    javascript: 'text-yellow-700 dark:text-yellow-300',
    typescript: 'text-blue-700 dark:text-blue-300',
    python: 'text-green-700 dark:text-green-300',
    html: 'text-orange-700 dark:text-orange-300',
    css: 'text-purple-700 dark:text-purple-300',
    java: 'text-red-700 dark:text-red-300',
    cpp: 'text-indigo-700 dark:text-indigo-300',
    csharp: 'text-violet-700 dark:text-violet-300',
    php: 'text-blue-700 dark:text-blue-300',
    ruby: 'text-red-700 dark:text-red-300',
    go: 'text-cyan-700 dark:text-cyan-300',
    rust: 'text-orange-700 dark:text-orange-300',
    sql: 'text-pink-700 dark:text-pink-300',
  };
  return highlights[language.toLowerCase()] || 'text-gray-700 dark:text-gray-300';
}