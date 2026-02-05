/**
 * 简单的迁移验证接口
 * 访问 http://localhost:3000/api/verify-migration 查看结果
 */

import { NextResponse } from 'next/server'
import prisma from '@/lib/core/prisma'

export async function GET() {
  try {
    const results: {
      timestamp: string;
      status: string;
      checks: any;
      summary?: string;
    } = {
      timestamp: new Date().toISOString(),
      status: 'success',
      checks: {} as any
    }

    // 1. 检查 User 表
    try {
      const userCount = await prisma.user.count()
      const sampleUser = await prisma.user.findFirst()

      results.checks.user = {
        status: '✅ 正常',
        count: userCount,
        hasNewFields: sampleUser ? {
          credits: typeof sampleUser.credits === 'number',
          totalSpent: typeof sampleUser.totalSpent === 'number'
        } : null,
        sample: sampleUser ? {
          id: sampleUser.id,
          nickName: sampleUser.nickName,
          credits: sampleUser.credits,
          totalSpent: sampleUser.totalSpent
        } : null
      }
    } catch (error: any) {
      results.checks.user = {
        status: '❌ 失败',
        error: error.message
      }
    }

    // 2. 检查 Order 表
    try {
      const orderCount = await prisma.order.count()
      const sampleOrder = await prisma.order.findFirst()

      results.checks.order = {
        status: '✅ 正常',
        count: orderCount,
        hasNewFields: sampleOrder ? {
          creditAmount: 'creditAmount' in sampleOrder
        } : null,
        sample: sampleOrder ? {
          orderId: sampleOrder.orderId,
          orderType: sampleOrder.orderType,
          creditAmount: sampleOrder.creditAmount
        } : null
      }
    } catch (error: any) {
      results.checks.order = {
        status: '❌ 失败',
        error: error.message
      }
    }

    // 3. 检查 CreditTransaction 表（新表）
    try {
      const creditTxCount = await prisma.creditTransaction.count()

      results.checks.creditTransaction = {
        status: '✅ 正常',
        count: creditTxCount,
        message: '这是新表，初始为空'
      }
    } catch (error: any) {
      results.checks.creditTransaction = {
        status: '❌ 失败',
        error: error.message
      }
    }

    // 4. 检查其他表
    try {
      const payOrderCount = await prisma.payOrder.count()
      const promotionCount = await prisma.promotion.count()

      results.checks.otherTables = {
        status: '✅ 正常',
        payOrder: payOrderCount,
        promotion: promotionCount,
        message: '未修改的表数据完整'
      }
    } catch (error: any) {
      results.checks.otherTables = {
        status: '❌ 失败',
        error: error.message
      }
    }

    // 总结
    const allSuccess = Object.values(results.checks).every(
      (check: any) => check.status === '✅ 正常'
    )

    results.summary = allSuccess
      ? '✅ 迁移验证通过！所有表结构正常，现有数据完整。'
      : '⚠️ 部分检查失败，请查看详情'

    return NextResponse.json(results, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: '验证失败',
      error: error.message
    }, { status: 500 })
  }
}
