import { NextRequest, NextResponse } from 'next/server';

const SILICONFLOW_MODELS_URL = 'https://api.siliconflow.cn/v1/models';

// 从环境变量获取 SiliconFlow API Key
function getSiliconFlowApiKey(): string | null {
  return process.env.SILICONFLOW_API_KEY || null;
}

/**
 * SiliconFlow Models List API
 *
 * GET /api/siliconflow/models
 *
 * Query parameters:
 *   - search: string (optional) - Filter models by name
 *   - type: string (optional) - Filter by type (e.g., "chat", "embedding")
 *
 * Returns list of available models from SiliconFlow
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = getSiliconFlowApiKey();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'SiliconFlow API key not configured. Please set SILICONFLOW_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase();
    const type = searchParams.get('type')?.toLowerCase();

    // Fetch models from SiliconFlow
    const response = await fetch(SILICONFLOW_MODELS_URL, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error?.message || 'Failed to fetch models' },
        { status: response.status }
      );
    }

    const data = await response.json();
    let models = data.data || [];

    // Filter by search term
    if (search) {
      models = models.filter((model: any) =>
        model.id?.toLowerCase().includes(search) ||
        model.name?.toLowerCase().includes(search)
      );
    }

    // Filter by type
    if (type) {
      models = models.filter((model: any) =>
        model.type?.toLowerCase() === type ||
        model.id?.toLowerCase().includes(type)
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
    console.error('SiliconFlow Models API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
