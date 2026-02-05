import prisma from '@/lib/core/prisma'
import { Prisma } from '@prisma/client'
import { nanoid } from 'nanoid'

export type RedemptionCode = {
  id: string
  created_time: Date
  updated_time: Date
  code: string
  creditAmount: number
  maxUses: number
  usedCount: number
  expiresAt: Date | null
  isActive: boolean
  description: string | null
  createdBy: string
  batchId: string | null
}

export type RedemptionRecord = {
  id: string
  created_time: Date
  codeId: string
  code: string
  userId: string
  userIdentifier: string
  creditAmount: number
}

/**
 * 生成唯一兑换码
 * @param length - 兑换码长度
 * @returns 兑换码字符串
 */
function generateCode(length: number = 8): string {
  // 使用大写字母和数字，排除容易混淆的字符 (0, O, I, 1, L)
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * 创建单个兑换码
 * @param params - 创建参数
 * @returns 创建的兑换码
 */
export async function createRedemptionCode(params: {
  creditAmount: number
  maxUses?: number
  expiresAt?: Date | null
  description?: string
  createdBy: string
  code?: string // 可选自定义兑换码
}) {
  const { creditAmount, maxUses = 1, expiresAt = null, description, createdBy, code } = params

  if (creditAmount <= 0) {
    throw new Error('积分数量必须大于0')
  }

  // 生成唯一兑换码
  let finalCode = code || generateCode()

  // 如果是自定义兑换码，检查是否已存在
  if (code) {
    const existing = await prisma.redemptionCode.findUnique({
      where: { code }
    })
    if (existing) {
      throw new Error('兑换码已存在')
    }
  } else {
    // 确保生成的兑换码唯一
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.redemptionCode.findUnique({
        where: { code: finalCode }
      })
      if (!existing) break
      finalCode = generateCode()
      attempts++
    }
    if (attempts >= 10) {
      throw new Error('无法生成唯一兑换码，请重试')
    }
  }

  return await prisma.redemptionCode.create({
    data: {
      code: finalCode,
      creditAmount,
      maxUses,
      expiresAt,
      description,
      createdBy,
      isActive: true,
      usedCount: 0
    }
  })
}

/**
 * 批量创建兑换码
 * @param params - 批量创建参数
 * @returns 创建的兑换码列表
 */
export async function batchCreateRedemptionCodes(params: {
  count: number
  creditAmount: number
  maxUses?: number
  expiresAt?: Date | null
  description?: string
  createdBy: string
}) {
  const { count, creditAmount, maxUses = 1, expiresAt = null, description, createdBy } = params

  if (count <= 0 || count > 1000) {
    throw new Error('批量生成数量必须在1-1000之间')
  }

  if (creditAmount <= 0) {
    throw new Error('积分数量必须大于0')
  }

  const batchId = nanoid()
  const codes: string[] = []
  const existingCodes = new Set<string>()

  // 获取所有已存在的兑换码用于检查
  const allExisting = await prisma.redemptionCode.findMany({
    select: { code: true }
  })
  allExisting.forEach(c => existingCodes.add(c.code))

  // 生成唯一兑换码
  while (codes.length < count) {
    const code = generateCode()
    if (!existingCodes.has(code) && !codes.includes(code)) {
      codes.push(code)
    }
  }

  // 批量创建
  const data = codes.map(code => ({
    code,
    creditAmount,
    maxUses,
    expiresAt,
    description,
    createdBy,
    batchId,
    isActive: true,
    usedCount: 0
  }))

  await prisma.redemptionCode.createMany({ data })

  // 返回创建的兑换码
  return await prisma.redemptionCode.findMany({
    where: { batchId },
    orderBy: { created_time: 'asc' }
  })
}

/**
 * 获取兑换码列表
 * @param params - 查询参数
 * @returns 兑换码列表和分页信息
 */
export async function getRedemptionCodeList(params: {
  page?: number
  pageSize?: number
  search?: string
  isActive?: boolean
  batchId?: string
}) {
  const { page = 1, pageSize = 20, search, isActive, batchId } = params
  const skip = (page - 1) * pageSize

  const where: Prisma.RedemptionCodeWhereInput = {}

  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (typeof isActive === 'boolean') {
    where.isActive = isActive
  }

  if (batchId) {
    where.batchId = batchId
  }

  const [items, total] = await Promise.all([
    prisma.redemptionCode.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { created_time: 'desc' }
    }),
    prisma.redemptionCode.count({ where })
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
 * 获取兑换码详情（含使用记录）
 * @param id - 兑换码ID
 * @returns 兑换码详情和使用记录
 */
export async function getRedemptionCodeById(id: string) {
  const code = await prisma.redemptionCode.findUnique({
    where: { id }
  })

  if (!code) {
    return null
  }

  // 获取使用记录
  const records = await prisma.redemptionRecord.findMany({
    where: { codeId: id },
    orderBy: { created_time: 'desc' }
  })

  return {
    ...code,
    records
  }
}

/**
 * 更新兑换码
 * @param params - 更新参数
 * @returns 更新后的兑换码
 */
export async function updateRedemptionCode(params: {
  id: string
  isActive?: boolean
  description?: string
  maxUses?: number
  expiresAt?: Date | null
}) {
  const { id, ...data } = params

  const existing = await prisma.redemptionCode.findUnique({
    where: { id }
  })

  if (!existing) {
    throw new Error('兑换码不存在')
  }

  return await prisma.redemptionCode.update({
    where: { id },
    data
  })
}

/**
 * 删除兑换码
 * @param id - 兑换码ID
 * @returns 删除结果
 */
export async function deleteRedemptionCode(id: string) {
  const existing = await prisma.redemptionCode.findUnique({
    where: { id }
  })

  if (!existing) {
    throw new Error('兑换码不存在')
  }

  // 同时删除相关的使用记录
  await prisma.$transaction([
    prisma.redemptionRecord.deleteMany({ where: { codeId: id } }),
    prisma.redemptionCode.delete({ where: { id } })
  ])

  return { success: true }
}

/**
 * 用户兑换积分（事务操作）
 * @param params - 兑换参数
 * @returns 兑换结果
 */
export async function redeemCode(params: {
  code: string
  userId: string
  userIdentifier: string // 用户昵称/邮箱/手机
}) {
  const { code, userId, userIdentifier } = params

  return await prisma.$transaction(async (tx) => {
    // 1. 查找兑换码
    const redemptionCode = await tx.redemptionCode.findUnique({
      where: { code }
    })

    if (!redemptionCode) {
      throw new Error('兑换码不存在')
    }

    // 2. 检查兑换码状态
    if (!redemptionCode.isActive) {
      throw new Error('兑换码已失效')
    }

    if (redemptionCode.expiresAt && new Date() > redemptionCode.expiresAt) {
      throw new Error('兑换码已过期')
    }

    if (redemptionCode.usedCount >= redemptionCode.maxUses) {
      throw new Error('兑换码已达到使用上限')
    }

    // 3. 检查用户是否已使用过该兑换码
    const existingRecord = await tx.redemptionRecord.findUnique({
      where: {
        codeId_userId: {
          codeId: redemptionCode.id,
          userId
        }
      }
    })

    if (existingRecord) {
      throw new Error('您已经使用过该兑换码')
    }

    // 4. 更新用户积分
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        credits: { increment: redemptionCode.creditAmount }
      }
    })

    // 5. 创建使用记录
    await tx.redemptionRecord.create({
      data: {
        codeId: redemptionCode.id,
        code: redemptionCode.code,
        userId,
        userIdentifier,
        creditAmount: redemptionCode.creditAmount
      }
    })

    // 6. 更新兑换码使用次数
    await tx.redemptionCode.update({
      where: { id: redemptionCode.id },
      data: { usedCount: { increment: 1 } }
    })

    // 7. 记录积分交易
    await tx.creditTransaction.create({
      data: {
        userId,
        type: 'recharge',
        amount: redemptionCode.creditAmount,
        balance: user.credits,
        description: `兑换码充值: ${code}`,
        metadata: {
          codeId: redemptionCode.id,
          code: redemptionCode.code
        }
      }
    })

    return {
      success: true,
      creditAmount: redemptionCode.creditAmount,
      newBalance: user.credits
    }
  })
}

/**
 * 获取兑换码使用记录
 * @param params - 查询参数
 * @returns 使用记录列表
 */
export async function getRedemptionRecords(params: {
  codeId?: string
  userId?: string
  page?: number
  pageSize?: number
}) {
  const { codeId, userId, page = 1, pageSize = 20 } = params
  const skip = (page - 1) * pageSize

  const where: Prisma.RedemptionRecordWhereInput = {}

  if (codeId) {
    where.codeId = codeId
  }

  if (userId) {
    where.userId = userId
  }

  const [items, total] = await Promise.all([
    prisma.redemptionRecord.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { created_time: 'desc' }
    }),
    prisma.redemptionRecord.count({ where })
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
 * 获取兑换码统计信息（管理员用）
 * @returns 统计信息
 */
export async function getRedemptionStats() {
  const [
    totalCodes,
    activeCodes,
    totalUsed,
    totalCreditsIssued,
    recentRecords
  ] = await Promise.all([
    prisma.redemptionCode.count(),
    prisma.redemptionCode.count({ where: { isActive: true } }),
    prisma.redemptionCode.aggregate({ _sum: { usedCount: true } }),
    prisma.redemptionRecord.aggregate({ _sum: { creditAmount: true } }),
    prisma.redemptionRecord.count({
      where: {
        created_time: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7天内
        }
      }
    })
  ])

  return {
    totalCodes,
    activeCodes,
    totalUsed: totalUsed._sum.usedCount || 0,
    totalCreditsIssued: totalCreditsIssued._sum.creditAmount || 0,
    recentRecords
  }
}
