/**
 * 健康检查 API
 *
 * 用于 Docker 容器健康检查和负载均衡器探测
 *
 * @example
 * GET /api/health
 * 返回: { status: 'ok', timestamp: '...', uptime: 123.45 }
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * 健康状态类型
 */
interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: 'ok' | 'error';
  };
}

/**
 * GET /api/health
 *
 * 返回应用健康状态
 */
export async function GET(): Promise<NextResponse<HealthStatus>> {
  const startTime = Date.now();

  // 检查数据库连接
  let databaseStatus: 'ok' | 'error' = 'ok';
  try {
    // 执行简单查询验证数据库连接
    await prisma.$runCommandRaw({ ping: 1 });
  } catch {
    databaseStatus = 'error';
  }

  // 计算总体状态
  const overallStatus = databaseStatus === 'ok' ? 'ok' : 'degraded';

  const response: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: databaseStatus,
    },
  };

  // 根据状态返回不同的 HTTP 状态码
  const httpStatus = overallStatus === 'ok' ? 200 : 503;

  return NextResponse.json(response, { status: httpStatus });
}
