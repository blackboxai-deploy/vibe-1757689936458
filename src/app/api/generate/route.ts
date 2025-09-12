import { NextRequest, NextResponse } from 'next/server';
import { BlackboxRequest, BlackboxResponse } from '@/lib/types';
import { blackboxAI } from '@/lib/blackbox-ai';

export async function POST(request: NextRequest) {
  try {
    const body: BlackboxRequest = await request.json();
    
    // Validate request
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate code using Blackbox AI
    const result: BlackboxResponse = await blackboxAI.generateCode(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Generate API error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        code: '',
        language: 'javascript'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Blackbox AI Code Generation API',
      endpoints: {
        'POST /api/generate': 'Generate code from prompt',
        'POST /api/chat': 'Stream generate code with real-time updates',
        'POST /api/download': 'Download project as ZIP'
      }
    },
    { status: 200 }
  );
}