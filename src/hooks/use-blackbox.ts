'use client';

import { useState, useCallback } from 'react';
import { BlackboxRequest, BlackboxResponse, ChatMessage, ProjectData } from '@/lib/types';

interface UseBlackboxReturn {
  messages: ChatMessage[];
  isGenerating: boolean;
  currentProject: ProjectData | null;
  error: string | null;
  generateCode: (request: BlackboxRequest) => Promise<void>;
  streamGenerate: (request: BlackboxRequest) => Promise<void>;
  clearMessages: () => void;
  saveProject: (project: ProjectData) => void;
  downloadProject: (projectId: string) => Promise<void>;
}

export function useBlackbox(): UseBlackboxReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const generateCode = useCallback(async (request: BlackboxRequest) => {
    setIsGenerating(true);
    setError(null);

    // Add user message
    addMessage({
      role: 'user',
      content: request.prompt,
    });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status}`);
      }

      const result: BlackboxResponse = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Add assistant message with code
      const assistantMessage = addMessage({
        role: 'assistant',
        content: result.explanation || 'Here\'s your generated code:',
        code: result.code,
        language: result.language,
      });

      // Create project data if it's a full app
      if (request.type === 'full-app' && result.files) {
        const project: ProjectData = {
          id: Date.now().toString(),
          name: result.projectName || 'Generated Project',
          description: request.prompt,
          files: result.files,
          createdAt: new Date(),
          updatedAt: new Date(),
          language: result.language,
          framework: request.framework,
          tags: [result.language, request.framework].filter(Boolean) as string[],
        };
        
        setCurrentProject(project);
        assistantMessage.projectData = project;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMessage);
      addMessage({
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [addMessage]);

  const streamGenerate = useCallback(async (request: BlackboxRequest) => {
    setIsGenerating(true);
    setError(null);

    // Add user message
    addMessage({
      role: 'user',
      content: request.prompt,
    });

    // Add empty assistant message to stream into
    const assistantMessage = addMessage({
      role: 'assistant',
      content: '',
    });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Stream generation failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let accumulatedCode = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content') {
                if (data.metadata?.isCode) {
                  accumulatedCode += data.data;
                } else {
                  accumulatedContent += data.data;
                }

                // Update the assistant message
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id
                      ? { 
                          ...msg, 
                          content: accumulatedContent,
                          code: accumulatedCode || undefined,
                          language: data.metadata?.language
                        }
                      : msg
                  )
                );
              }
            } catch {
              // Ignore malformed JSON chunks
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Stream generation failed';
      setError(errorMessage);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id
            ? { ...msg, content: `Sorry, I encountered an error: ${errorMessage}` }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentProject(null);
    setError(null);
  }, []);

  const saveProject = useCallback((project: ProjectData) => {
    setCurrentProject(project);
    // In a real app, you'd save to backend/localStorage
    localStorage.setItem('blackbox_projects', JSON.stringify([project]));
  }, []);

  const downloadProject = useCallback(async (projectId: string) => {
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${projectId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  }, []);

  return {
    messages,
    isGenerating,
    currentProject,
    error,
    generateCode,
    streamGenerate,
    clearMessages,
    saveProject,
    downloadProject,
  };
}