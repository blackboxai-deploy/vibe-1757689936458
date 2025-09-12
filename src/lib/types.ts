export interface BlackboxRequest {
  prompt: string;
  language?: string;
  framework?: string;
  type?: 'component' | 'full-app' | 'snippet' | 'fix';
}

export interface BlackboxResponse {
  code: string;
  language: string;
  explanation?: string;
  files?: GeneratedFile[];
  projectName?: string;
  error?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  code?: string;
  language?: string;
  projectData?: ProjectData;
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  files: GeneratedFile[];
  createdAt: Date;
  updatedAt: Date;
  language: string;
  framework?: string;
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  projects: ProjectData[];
}

export interface BlackboxConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export type SupportedLanguage = 
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'csharp'
  | 'php'
  | 'ruby'
  | 'go'
  | 'rust'
  | 'html'
  | 'css'
  | 'sql';

export type AppTemplate = {
  id: string;
  name: string;
  description: string;
  language: SupportedLanguage;
  framework?: string;
  prompt: string;
  tags: string[];
};

export interface StreamResponse {
  type: 'start' | 'content' | 'end' | 'error';
  data: string;
  metadata?: {
    language?: string;
    fileName?: string;
    progress?: number;
  };
}