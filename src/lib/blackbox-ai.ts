import { BlackboxRequest, BlackboxResponse, StreamResponse } from './types';

const BLACKBOX_API_URL = 'https://api.blackbox.ai/v1/chat/completions';

export class BlackboxAI {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BLACKBOX_API_KEY || '';
  }

  async generateCode(request: BlackboxRequest): Promise<BlackboxResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(request);
      const userPrompt = this.buildUserPrompt(request);

      const response = await fetch(BLACKBOX_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'blackboxai',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Blackbox AI API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseResponse(data, request);
    } catch (error) {
      console.error('Blackbox AI generation error:', error);
      return {
        code: '',
        language: request.language || 'javascript',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async *streamGenerate(request: BlackboxRequest): AsyncGenerator<StreamResponse, void, unknown> {
    try {
      const systemPrompt = this.buildSystemPrompt(request);
      const userPrompt = this.buildUserPrompt(request);

      const response = await fetch(BLACKBOX_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'blackboxai',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          stream: true
        })
      });

      if (!response.ok) {
        yield { type: 'error', data: `API error: ${response.status}` };
        return;
      }

      yield { type: 'start', data: 'Starting generation...' };

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        yield { type: 'error', data: 'No response stream available' };
        return;
      }

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content || '';
              if (content) {
                yield {
                  type: 'content',
                  data: content,
                  metadata: { language: request.language }
                };
              }
            } catch {
              // Ignore parsing errors for malformed chunks
            }
          }
        }
      }

      yield { type: 'end', data: 'Generation complete' };
    } catch (error) {
      yield {
        type: 'error',
        data: error instanceof Error ? error.message : 'Stream generation failed'
      };
    }
  }

  private buildSystemPrompt(request: BlackboxRequest): string {
    const { type, language, framework } = request;
    
    let prompt = 'You are an expert software developer and code generator. ';
    
    switch (type) {
      case 'full-app':
        prompt += `Create a complete, production-ready application using ${language || 'JavaScript'}`;
        if (framework) prompt += ` with ${framework}`;
        prompt += '. Include all necessary files, proper project structure, error handling, and best practices.';
        break;
      case 'component':
        prompt += `Create a reusable component using ${language || 'JavaScript'}`;
        if (framework) prompt += ` with ${framework}`;
        prompt += '. Make it well-documented and follow best practices.';
        break;
      case 'snippet':
        prompt += `Create a focused code snippet in ${language || 'JavaScript'} that solves the specific problem.`;
        break;
      case 'fix':
        prompt += `Analyze and fix the provided code. Explain the issues and provide the corrected version.`;
        break;
      default:
        prompt += `Generate high-quality ${language || 'JavaScript'} code based on the requirements.`;
    }
    
    prompt += ' Always include comments explaining the code logic and provide clean, readable output.';
    return prompt;
  }

  private buildUserPrompt(request: BlackboxRequest): string {
    let prompt = request.prompt;
    
    if (request.language) {
      prompt += `\n\nLanguage: ${request.language}`;
    }
    
    if (request.framework) {
      prompt += `\nFramework: ${request.framework}`;
    }
    
    if (request.type === 'full-app') {
      prompt += '\n\nPlease provide a complete project structure with multiple files if needed.';
    }
    
    return prompt;
  }

  private parseResponse(data: Record<string, unknown>, request: BlackboxRequest): BlackboxResponse {
    try {
      const choices = (data as { choices?: Array<{ message?: { content?: string } }> }).choices;
      const content = choices?.[0]?.message?.content || '';
      
      // Extract code from the response
      const codeBlocks = content.match(/```[\w]*\n([\s\S]*?)```/g) || [];
      const code = codeBlocks.length > 0 && codeBlocks[0]
        ? codeBlocks[0].replace(/```[\w]*\n/, '').replace(/```$/, '').trim()
        : content;

      return {
        code,
        language: request.language || 'javascript',
        explanation: content.includes('```') 
          ? content.split('```')[0].trim() 
          : undefined,
        projectName: this.extractProjectName(request.prompt)
      };
    } catch {
      return {
        code: '',
        language: request.language || 'javascript',
        error: 'Failed to parse response'
      };
    }
  }

  private extractProjectName(prompt: string): string {
    // Simple extraction of project name from prompt
    const match = prompt.match(/(?:create|build|make)\s+(?:a|an)?\s*(.+?)(?:\s+(?:app|application|project|website))/i);
    if (match) {
      return match[1].trim().replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
    }
    return 'generated-project';
  }
}

export const blackboxAI = new BlackboxAI();