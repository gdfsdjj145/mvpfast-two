import { NextRequest, NextResponse } from 'next/server';
import { getConfigByKey } from '@/models/systemConfig';

// 允许公开访问的配置 key 列表
const PUBLIC_CONFIG_KEYS = [
  'analytics.googleAnalyticsId',
];

/**
 * GET /api/admin/configs/public?key=xxx
 * 公开访问的配置接口，无需认证
 * 仅返回允许公开访问的配置项
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Missing key parameter' },
        { status: 400 }
      );
    }

    // 检查是否为允许公开访问的配置
    if (!PUBLIC_CONFIG_KEYS.includes(key)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const config = await getConfigByKey(key);

    if (!config) {
      return NextResponse.json({ value: null });
    }

    return NextResponse.json({ value: config.value });
  } catch (error) {
    console.error('Public config fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
