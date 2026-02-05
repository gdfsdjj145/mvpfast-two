import { NextRequest, NextResponse } from 'next/server';
import { getConfigByKey, getAllConfigsAsObject } from '@/models/systemConfig';

// 允许公开访问的配置 key 列表
const PUBLIC_CONFIG_KEYS = [
  'analytics.googleAnalyticsId',
  'system.siteName',
  'auth.loginType',
  'auth.loginTypes',
  'payment.methods',
];

// 公开配置的默认值（不依赖 config.ts）
const PUBLIC_CONFIG_DEFAULTS: Record<string, any> = {
  'system.siteName': 'MvpFast',
  'auth.loginType': 'password',
  'auth.loginTypes': ['password'],
  'payment.methods': ['wechat'],
  'analytics.googleAnalyticsId': '',
};

/**
 * GET /api/admin/configs/public
 * 公开访问的配置接口，无需认证
 *
 * 用法：
 * - 获取单个配置：/api/admin/configs/public?key=system.siteName
 * - 获取所有公开配置：/api/admin/configs/public?all=true
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const all = searchParams.get('all');

    // 获取所有公开配置
    if (all === 'true') {
      const allConfigs = await getAllConfigsAsObject();
      const publicConfigs: Record<string, any> = {};

      for (const configKey of PUBLIC_CONFIG_KEYS) {
        publicConfigs[configKey] = allConfigs[configKey] ?? PUBLIC_CONFIG_DEFAULTS[configKey] ?? null;
      }

      return NextResponse.json({ configs: publicConfigs });
    }

    // 获取单个配置
    if (!key) {
      return NextResponse.json(
        { error: 'Missing key parameter. Use ?key=xxx or ?all=true' },
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
      // 返回默认值
      return NextResponse.json({ value: PUBLIC_CONFIG_DEFAULTS[key] ?? null });
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
