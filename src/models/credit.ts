import prisma from '@/lib/core/prisma'
import { Prisma } from '@prisma/client'

export type CreditTransaction = {
  id: string
  created_time: Date
  userId: string
  type: string
  amount: number
  balance: number
  orderId?: string | null
  description: string
  metadata?: Prisma.JsonValue | null
}

export type CreditTransactionCreateInput = {
  userId: string
  type: 'recharge' | 'consume' | 'refund'
  amount: number
  balance: number
  orderId?: string
  description: string
  metadata?: Prisma.JsonValue
}

/**
 * 充值积分（事务操作）
 * @param params - 充值参数
 * @returns 更新后的用户信息
 */
export async function rechargeCredits(params: {
  userId: string
  amount: number
  orderId: string
  description: string
}) {
  const { userId, amount, orderId, description } = params

  if (amount <= 0) {
    throw new Error('充值积分必须大于0')
  }

  return await prisma.$transaction(async (tx) => {
    // 1. 更新用户积分
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        credits: { increment: amount },
        totalSpent: { increment: amount / 100 } // 假设100积分=1元
      }
    })

    // 2. 记录交易
    await tx.creditTransaction.create({
      data: {
        userId,
        type: 'recharge',
        amount,
        balance: user.credits,
        orderId,
        description
      }
    })

    return user
  })
}

/**
 * 消费积分（事务操作）
 * @param params - 消费参数
 * @returns 更新后的用户信息
 */
export async function consumeCredits(params: {
  userId: string
  amount: number
  description: string
  metadata?: Prisma.JsonValue
}) {
  const { userId, amount, description, metadata } = params

  if (amount <= 0) {
    throw new Error('消费积分必须大于0')
  }

  return await prisma.$transaction(async (tx) => {
    // 1. 查询用户当前积分
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    if (user.credits < amount) {
      throw new Error(`积分不足，当前余额: ${user.credits}，需要: ${amount}`)
    }

    // 2. 扣除积分
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { credits: { decrement: amount } }
    })

    // 3. 记录交易（amount 为负数表示消费）
    await tx.creditTransaction.create({
      data: {
        userId,
        type: 'consume',
        amount: -amount,
        balance: updatedUser.credits,
        description,
        metadata
      }
    })

    return updatedUser
  })
}

/**
 * 退款积分（事务操作）
 * @param params - 退款参数
 * @returns 更新后的用户信息
 */
export async function refundCredits(params: {
  userId: string
  amount: number
  orderId: string
  description: string
}) {
  const { userId, amount, orderId, description } = params

  if (amount <= 0) {
    throw new Error('退款积分必须大于0')
  }

  return await prisma.$transaction(async (tx) => {
    // 1. 扣除用户积分
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    if (user.credits < amount) {
      throw new Error(`积分不足，无法退款。当前余额: ${user.credits}`)
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: amount },
        totalSpent: { decrement: amount / 100 }
      }
    })

    // 2. 记录退款交易
    await tx.creditTransaction.create({
      data: {
        userId,
        type: 'refund',
        amount: -amount,
        balance: updatedUser.credits,
        orderId,
        description
      }
    })

    return updatedUser
  })
}

/**
 * 获取用户积分余额
 * @param userId - 用户ID
 * @returns 积分余额
 */
export async function getUserCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true }
  })
  return user?.credits || 0
}

/**
 * 获取用户完整积分信息
 * @param userId - 用户ID
 * @returns 用户积分信息
 */
export async function getUserCreditInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
      totalSpent: true
    }
  })

  if (!user) {
    return {
      credits: 0,
      totalSpent: 0
    }
  }

  return user
}

/**
 * 获取积分交易记录
 * @param params - 查询参数
 * @returns 交易记录列表
 */
export async function getCreditTransactions(params: {
  userId: string
  skip?: number
  take?: number
  type?: 'recharge' | 'consume' | 'refund'
}) {
  const { userId, skip, take = 20, type } = params

  const where: Prisma.CreditTransactionWhereInput = {
    userId
  }

  if (type) {
    where.type = type
  }

  const [items, count] = await Promise.all([
    prisma.creditTransaction.findMany({
      where,
      skip,
      take,
      orderBy: { created_time: 'desc' }
    }),
    prisma.creditTransaction.count({ where })
  ])

  return {
    items,
    count
  }
}

/**
 * 获取单条交易记录
 * @param transactionId - 交易ID
 * @returns 交易记录
 */
export async function getCreditTransaction(transactionId: string) {
  return await prisma.creditTransaction.findUnique({
    where: { id: transactionId }
  })
}

/**
 * 获取积分统计信息
 * @param userId - 用户ID
 * @returns 统计信息
 */
export async function getCreditStats(userId: string) {
  const [userInfo, transactions] = await Promise.all([
    getUserCreditInfo(userId),
    getCreditTransactions({ userId, take: 1000 })
  ])

  const totalRecharge = transactions.items
    .filter(t => t.type === 'recharge')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalConsume = transactions.items
    .filter(t => t.type === 'consume')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const totalRefund = transactions.items
    .filter(t => t.type === 'refund')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return {
    currentBalance: userInfo.credits,
    totalSpent: userInfo.totalSpent,
    totalRecharge,
    totalConsume,
    totalRefund,
    transactionCount: transactions.count
  }
}

/**
 * 检查用户是否有足够的积分
 * @param userId - 用户ID
 * @param requiredAmount - 需要的积分数
 * @returns 是否有足够积分
 */
export async function hasEnoughCredits(
  userId: string,
  requiredAmount: number
): Promise<boolean> {
  const credits = await getUserCredits(userId)
  return credits >= requiredAmount
}

/**
 * 管理员调整积分（增加或减少）
 * @param params - 调整参数
 * @returns 更新后的用户信息
 */
export async function adjustCredits(params: {
  userId: string
  amount: number // 正数增加，负数减少
  adminId: string
  reason: string
}) {
  const { userId, amount, adminId, reason } = params

  if (amount === 0) {
    throw new Error('调整积分不能为0')
  }

  return await prisma.$transaction(async (tx) => {
    // 1. 查询用户当前积分
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true, nickName: true }
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    // 如果是减少积分，检查余额
    if (amount < 0 && user.credits < Math.abs(amount)) {
      throw new Error(`积分不足，当前余额: ${user.credits}，尝试减少: ${Math.abs(amount)}`)
    }

    // 2. 更新用户积分
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        credits: amount > 0 ? { increment: amount } : { decrement: Math.abs(amount) }
      }
    })

    // 3. 记录交易
    const transactionType = amount > 0 ? 'recharge' : 'consume'
    await tx.creditTransaction.create({
      data: {
        userId,
        type: transactionType,
        amount: amount,
        balance: updatedUser.credits,
        description: `管理员调整: ${reason}`,
        metadata: {
          adminId,
          adjustType: amount > 0 ? 'increase' : 'decrease',
          originalBalance: user.credits
        }
      }
    })

    return updatedUser
  })
}

/**
 * 获取所有用户的积分交易记录（管理员用）
 * @param params - 查询参数
 * @returns 交易记录列表
 */
export async function getAllCreditTransactions(params: {
  page?: number
  pageSize?: number
  userId?: string
  type?: 'recharge' | 'consume' | 'refund'
  startDate?: Date
  endDate?: Date
}) {
  const { page = 1, pageSize = 20, userId, type, startDate, endDate } = params
  const skip = (page - 1) * pageSize

  const where: Prisma.CreditTransactionWhereInput = {}

  if (userId) {
    where.userId = userId
  }

  if (type) {
    where.type = type
  }

  if (startDate || endDate) {
    where.created_time = {}
    if (startDate) {
      where.created_time.gte = startDate
    }
    if (endDate) {
      where.created_time.lte = endDate
    }
  }

  const [items, total] = await Promise.all([
    prisma.creditTransaction.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { created_time: 'desc' }
    }),
    prisma.creditTransaction.count({ where })
  ])

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
}

/**
 * 赠送新用户初始积分（注册时调用）
 * @param userId - 用户ID
 * @returns 是否成功赠送
 */
export async function grantInitialCredits(userId: string): Promise<boolean> {
  try {
    // 获取积分配置
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'credits.initialCredits', isActive: true },
    })

    if (!config?.value) {
      return false
    }

    const creditsConfig = config.value as {
      initial_credits_enabled: boolean
      initial_credits_amount: number
      initial_credits_valid_days: number
      initial_credits_description: string
    }

    // 检查是否开启初始积分赠送
    if (!creditsConfig.initial_credits_enabled || creditsConfig.initial_credits_amount <= 0) {
      return false
    }

    // 使用事务赠送积分
    await prisma.$transaction(async (tx) => {
      // 更新用户积分
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          credits: { increment: creditsConfig.initial_credits_amount },
        },
      })

      // 记录积分交易
      await tx.creditTransaction.create({
        data: {
          userId,
          type: 'recharge',
          amount: creditsConfig.initial_credits_amount,
          balance: user.credits,
          description: creditsConfig.initial_credits_description || '新用户注册赠送积分',
          metadata: {
            source: 'initial_credits',
            validDays: creditsConfig.initial_credits_valid_days,
          },
        },
      })
    })

    console.log(`[Credits] Granted ${creditsConfig.initial_credits_amount} initial credits to user ${userId}`)
    return true
  } catch (error) {
    console.error('[Credits] Failed to grant initial credits:', error)
    return false
  }
}

/**
 * 获取积分系统总体统计（管理员用）
 * @returns 统计信息
 */
export async function getCreditSystemStats() {
  const [
    totalUsers,
    usersWithCredits,
    totalCreditsInSystem,
    totalRechargeAmount,
    totalConsumeAmount,
    recentTransactions
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { credits: { gt: 0 } } }),
    prisma.user.aggregate({ _sum: { credits: true } }),
    prisma.creditTransaction.aggregate({
      where: { type: 'recharge' },
      _sum: { amount: true }
    }),
    prisma.creditTransaction.aggregate({
      where: { type: 'consume' },
      _sum: { amount: true }
    }),
    prisma.creditTransaction.count({
      where: {
        created_time: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7天内
        }
      }
    })
  ])

  return {
    totalUsers,
    usersWithCredits,
    totalCreditsInSystem: totalCreditsInSystem._sum.credits || 0,
    totalRechargeAmount: totalRechargeAmount._sum.amount || 0,
    totalConsumeAmount: Math.abs(totalConsumeAmount._sum.amount || 0),
    recentTransactions
  }
}
