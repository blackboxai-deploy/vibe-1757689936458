'use client';

import { ChatMessage as ChatMessageType, ProjectData } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { CodePreview } from './CodePreview';
import { DownloadButton } from './DownloadButton';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  onDownload?: (projectData: ProjectData) => void;
}

export function ChatMessage({ message, onDownload }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn(
      "flex w-full mb-6",
      isUser ? "justify-end" : "justify-start"
    )}>
      <Card className={cn(
        "max-w-[85%] transition-all duration-200",
        isUser 
          ? "bg-blue-500 dark:bg-blue-600 text-white border-blue-600 dark:border-blue-500" 
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg"
      )}>
        <CardContent className="p-4">
          {/* Message Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                isUser 
                  ? "bg-blue-600 dark:bg-blue-700 text-white" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              )}>
                {isUser ? "U" : "AI"}
              </div>
              <span className={cn(
                "text-sm font-medium",
                isUser ? "text-blue-100" : "text-gray-600 dark:text-gray-300"
              )}>
                {isUser ? "You" : "Blackbox AI"}
              </span>
              {message.language && (
                <Badge variant="secondary" className="text-xs">
                  {message.language}
                </Badge>
              )}
            </div>
            <span className={cn(
              "text-xs",
              isUser ? "text-blue-200" : "text-gray-500 dark:text-gray-400"
            )}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Message Content */}
          <div className="space-y-3">
            {message.content && (
              <p className={cn(
                "text-sm leading-relaxed whitespace-pre-wrap",
                isUser ? "text-white" : "text-gray-800 dark:text-gray-200"
              )}>
                {message.content}
              </p>
            )}

            {/* Code Preview */}
            {message.code && (
              <div className="mt-4">
                <CodePreview
                  code={message.code}
                  language={message.language || 'javascript'}
                  fileName={`generated.${message.language === 'typescript' ? 'ts' : message.language === 'python' ? 'py' : 'js'}`}
                />
              </div>
            )}

            {/* Project Actions */}
            {message.projectData && isAssistant && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      {message.projectData.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {message.projectData.files?.length || 0} files • {message.projectData.language}
                      {message.projectData.framework && ` • ${message.projectData.framework}`}
                    </p>
                  </div>
                  <DownloadButton
                    projectData={message.projectData}
                    onDownload={onDownload}
                    size="sm"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}