import { NextRequest } from 'next/server';
import { BlackboxRequest } from '@/lib/types';
import { blackboxAI } from '@/lib/blackbox-ai';

export async function POST(request: NextRequest) {
  try {
    const body: BlackboxRequest = await request.json();
    
    // Validate request
    if (!body.prompt) {
      return new Response('Prompt is required', { status: 400 });
    }

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial message
          controller.enqueue(`data: ${JSON.stringify({ 
            type: 'start', 
            data: 'Starting code generation...' 
          })}\n\n`);

          let codeBlock = '';
          let isInCodeBlock = false;

          // Stream generate code
          for await (const chunk of blackboxAI.streamGenerate(body)) {
            if (chunk.type === 'content') {
              // Detect code blocks
              if (chunk.data.includes('```')) {
                isInCodeBlock = !isInCodeBlock;
                if (!isInCodeBlock && codeBlock) {
                  // End of code block - send the accumulated code
                  controller.enqueue(`data: ${JSON.stringify({
                    type: 'content',
                    data: codeBlock,
                    metadata: {
                      isCode: true,
                      language: chunk.metadata?.language || body.language
                    }
                  })}\n\n`);
                  codeBlock = '';
                }
              } else if (isInCodeBlock) {
                // Accumulate code content
                codeBlock += chunk.data;
              } else {
                // Regular content
                controller.enqueue(`data: ${JSON.stringify({
                  type: 'content',
                  data: chunk.data,
                  metadata: {
                    isCode: false,
                    language: chunk.metadata?.language || body.language
                  }
                })}\n\n`);
              }
            } else if (chunk.type === 'error') {
              controller.enqueue(`data: ${JSON.stringify({
                type: 'error',
                data: chunk.data
              })}\n\n`);
              break;
            } else if (chunk.type === 'end') {
              // Send any remaining code block
              if (codeBlock) {
                controller.enqueue(`data: ${JSON.stringify({
                  type: 'content',
                  data: codeBlock,
                  metadata: {
                    isCode: true,
                    language: body.language
                  }
                })}\n\n`);
              }
              
              controller.enqueue(`data: ${JSON.stringify({
                type: 'end',
                data: 'Code generation complete'
              })}\n\n`);
              break;
            }
          }

          controller.enqueue('data: [DONE]\n\n');
        } catch (error) {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'error',
            data: error instanceof Error ? error.message : 'Stream generation failed'
          })}\n\n`);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}