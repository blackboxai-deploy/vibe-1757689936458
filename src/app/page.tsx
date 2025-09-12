'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage } from '@/components/ChatMessage';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthForm } from '@/components/AuthForm';
import { ProjectCard } from '@/components/ProjectCard';
import { useBlackbox } from '@/hooks/use-blackbox';
import { User, SupportedLanguage, BlackboxRequest } from '@/lib/types';
import { toast } from 'sonner';

const SUPPORTED_LANGUAGES: { value: SupportedLanguage; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
];

const APP_TEMPLATES = [
  {
    id: 'react-todo',
    name: 'React Todo App',
    description: 'A complete todo application with React',
    prompt: 'Create a complete React todo app with add, delete, edit, and mark complete functionality. Include local storage and a clean modern UI.',
    language: 'typescript' as SupportedLanguage,
    framework: 'React'
  },
  {
    id: 'express-api',
    name: 'Express API',
    description: 'RESTful API with Express.js',
    prompt: 'Create a complete Express.js REST API with CRUD operations, middleware, error handling, and JSON responses. Include user authentication.',
    language: 'javascript' as SupportedLanguage,
    framework: 'Express.js'
  },
  {
    id: 'python-web-scraper',
    name: 'Python Web Scraper',
    description: 'Web scraper with beautiful soup',
    prompt: 'Create a Python web scraper using requests and BeautifulSoup to scrape product information from e-commerce sites. Include error handling and data export to CSV.',
    language: 'python' as SupportedLanguage,
    framework: 'BeautifulSoup'
  },
  {
    id: 'vue-dashboard',
    name: 'Vue Dashboard',
    description: 'Admin dashboard with Vue.js',
    prompt: 'Create a Vue.js admin dashboard with charts, tables, user management, and responsive design. Include dark mode toggle and real-time data updates.',
    language: 'typescript' as SupportedLanguage,
    framework: 'Vue.js'
  }
];

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('javascript');
  const [framework, setFramework] = useState('');
  const [projectType, setProjectType] = useState<'component' | 'full-app' | 'snippet' | 'fix'>('component');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isGenerating,
    currentProject,
    error,
    generateCode,
    streamGenerate,
    clearMessages,
    saveProject,

  } = useBlackbox();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('blackbox_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to load user:', e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const request: BlackboxRequest = {
      prompt: prompt.trim(),
      language: selectedLanguage,
      framework: framework || undefined,
      type: projectType
    };

    try {
      if (projectType === 'full-app') {
        await streamGenerate(request);
      } else {
        await generateCode(request);
      }
      setPrompt('');
    } catch (err) {
      console.error('Generation error:', err);
      toast.error('Failed to generate code. Please try again.');
    }
  };

  const handleTemplateSelect = (template: typeof APP_TEMPLATES[0]) => {
    setPrompt(template.prompt);
    setSelectedLanguage(template.language);
    setFramework(template.framework);
    setProjectType('full-app');
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setShowAuth(false);
    toast.success(`Welcome back, ${loggedInUser.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('blackbox_user');
    setUser(null);
    clearMessages();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Blackbox AI Agent
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Create apps with AI-powered code generation
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    Projects
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {user.name}
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowAuth(true)}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Sidebar - Templates & History */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Quick Templates */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Quick Start Templates
              </h3>
              <div className="space-y-2">
                {APP_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {template.description}
                      </p>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {template.language}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.framework}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Projects */}
            {user && currentProject && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Current Project
                </h3>
                <ProjectCard
                  project={currentProject}
                  onLoad={() => {}}
                  onDelete={() => {}}
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Configuration Bar */}
          <div className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Select value={projectType} onValueChange={(value: 'component' | 'full-app' | 'snippet' | 'fix') => setProjectType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="component">Component</SelectItem>
                  <SelectItem value="full-app">Full App</SelectItem>
                  <SelectItem value="snippet">Code Snippet</SelectItem>
                  <SelectItem value="fix">Fix Code</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLanguage} onValueChange={(value: SupportedLanguage) => setSelectedLanguage(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Framework (optional)"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-40"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={clearMessages}
                disabled={isGenerating}
              >
                Clear Chat
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">AI</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome to Blackbox AI Agent
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Describe the application or code you want to create, and I&apos;ll generate it for you using advanced AI.
                  Choose from templates above or start with a custom prompt.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onDownload={(projectData) => saveProject(projectData)}
                />
              ))
            )}
            
            {error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the app or code you want to create..."
                  className="flex-1 min-h-[100px] resize-none"
                  disabled={isGenerating}
                />
                <Button
                  type="submit"
                  disabled={!prompt.trim() || isGenerating}
                  className="px-8"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>•</span>
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span>•</span>
                <span>{selectedLanguage.toUpperCase()}</span>
                {framework && (
                  <>
                    <span>•</span>
                    <span>{framework}</span>
                  </>
                )}
                <span>•</span>
                <span className="capitalize">{projectType.replace('-', ' ')}</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <AuthForm
          onLogin={handleLogin}
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  );
}