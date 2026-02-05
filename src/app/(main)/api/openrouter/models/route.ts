import { NextRequest, NextResponse } from 'next/server';
import { OpenRouter } from '@openrouter/sdk';

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
 * OpenRouter Models List API
 *
 * GET /api/openrouter/models
 *
 * Query parameters:
 *   - search: string (optional) - Filter models by name
 *   - provider: string (optional) - Filter by provider (e.g., "openai", "anthropic")
 *
 * Returns list of available models from OpenRouter
 */
export async function GET(request: NextRequest) {
  try {
    const openRouter = createOpenRouterClient();

    if (!openRouter) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase();
    const provider = searchParams.get('provider')?.toLowerCase();

    // Fetch models using SDK
    const response = await openRouter.models.list();
    let models = response.data || [];

    // Filter by search term
    if (search) {
      models = models.filter((model: any) =>
        model.id?.toLowerCase().includes(search) ||
        model.name?.toLowerCase().includes(search)
      );
    }

    // Filter by provider
    if (provider) {
      models = models.filter((model: any) =>
        model.id?.toLowerCase().startsWith(provider + '/')
      );
    }

    // Sort by id
    models.sort((a: any, b: any) => (a.id || '').localeCompare(b.id || ''));

    return NextResponse.json({
      success: true,
      data: models,
      total: models.length,
    });
  } catch (error: any) {
    console.error('OpenRouter Models API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
