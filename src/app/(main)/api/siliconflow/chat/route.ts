import { NextRequest, NextResponse } from 'next/server';

const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

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

// 从环境变量获取 SiliconFlow API Key
function getSiliconFlowApiKey(): string | null {
  return process.env.SILICONFLOW_API_KEY || null;
}

/**
 * SiliconFlow Chat Completions API
 *
 * POST /api/siliconflow/chat
 *
 * Request body:
 * {
 *   model: string,           // Required: e.g., "Qwen/Qwen2.5-7B-Instruct", "deepseek-ai/DeepSeek-V3"
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
    const apiKey = getSiliconFlowApiKey();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'SiliconFlow API key not configured. Please set SILICONFLOW_API_KEY environment variable.' },
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

    // Build request payload
    const payload: Record<string, unknown> = {
      model: body.model,
      messages: body.messages,
    };

    // Add optional parameters
    if (body.stream !== undefined) payload.stream = body.stream;
    if (body.temperature !== undefined) payload.temperature = body.temperature;
    if (body.max_tokens !== undefined) payload.max_tokens = body.max_tokens;
    if (body.top_p !== undefined) payload.top_p = body.top_p;
    if (body.frequency_penalty !== undefined) payload.frequency_penalty = body.frequency_penalty;
    if (body.presence_penalty !== undefined) payload.presence_penalty = body.presence_penalty;

    // Make request to SiliconFlow
    const response = await fetch(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle streaming response
    if (body.stream) {
      if (!response.body) {
        return NextResponse.json(
          { error: 'Stream not available' },
          { status: 500 }
        );
      }

      // Return streaming response
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Handle non-streaming response
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'SiliconFlow API error', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('SiliconFlow API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
