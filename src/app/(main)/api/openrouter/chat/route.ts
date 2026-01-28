import { NextRequest, NextResponse } from 'next/server';
import { OpenRouter } from '@openrouter/sdk';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  model: string;
  messages: Message[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

// 从环境变量获取 OpenRouter API Key
function getOpenRouterApiKey(): string | null {
  return process.env.OPENROUTER_API_KEY || null;
}

// 创建 OpenRouter 客户端
function createOpenRouterClient() {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) return null;

  return new OpenRouter({
    apiKey,
  });
}

/**
 * OpenRouter Chat Completions API
 *
 * POST /api/openrouter/chat
 *
 * Request body:
 * {
 *   model: string,           // Required: e.g., "openai/gpt-4o", "anthropic/claude-3.5-sonnet"
 *   messages: Message[],     // Required: array of {role, content}
 *   stream?: boolean,        // Optional: enable streaming response
 *   temperature?: number,    // Optional: 0-2, default 1
 *   max_tokens?: number,     // Optional: max response tokens
 *   top_p?: number,          // Optional: nucleus sampling
 *   frequency_penalty?: number,  // Optional: -2 to 2
 *   presence_penalty?: number,   // Optional: -2 to 2
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const openRouter = createOpenRouterClient();

    if (!openRouter) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    const body: ChatRequest = await request.json();

    // Validate required fields
    if (!body.model) {
      return NextResponse.json(
        { error: 'Model is required' },
        { status: 400 }
      );
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Build request options
    const options: Parameters<typeof openRouter.chat.send>[0] = {
      model: body.model,
      messages: body.messages,
      stream: body.stream ?? false,
    };

    // Add optional parameters
    if (body.temperature !== undefined) options.temperature = body.temperature;
    if (body.max_tokens !== undefined) (options as any).maxTokens = body.max_tokens;
    if (body.top_p !== undefined) (options as any).topP = body.top_p;
    if (body.frequency_penalty !== undefined) (options as any).frequencyPenalty = body.frequency_penalty;
    if (body.presence_penalty !== undefined) (options as any).presencePenalty = body.presence_penalty;

    // Handle streaming response
    if (body.stream) {
      const stream = await openRouter.chat.send({
        ...options,
        stream: true,
      });

      // Create a readable stream for SSE
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const data = JSON.stringify(chunk);
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error: any) {
            console.error('Stream error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Handle non-streaming response
    const completion = await openRouter.chat.send(options);
    return NextResponse.json(completion);
  } catch (error: any) {
    console.error('OpenRouter API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
