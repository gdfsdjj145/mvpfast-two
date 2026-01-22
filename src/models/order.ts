import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type Order = {
  id: string
  created_time: Date
  identifier: string
  name: string
  orderId: string
  orderType: string
  price: number
  promoter?: string | null
  promotionPrice: number
  transactionId: string
  creditAmount?: number | null
}

export type OrderCreateInput = Omit<Order, 'id' | 'created_time'>
export type OrderUpdateInput = Partial<OrderCreateInput>

// 创建订单
export async function createOrder(data: OrderCreateInput) {
  return prisma.order.create({
    data
  })
}

// 获取单个订单
export async function getOrder(where: Prisma.OrderWhereUniqueInput) {
  return prisma.order.findUnique({
    where
  })
}

// 获取多个订单
export async function getOrders(params: {
  skip?: number
  take?: number
  where?: Prisma.OrderWhereInput
  orderBy?: Prisma.OrderOrderByWithRelationInput
}) {
  const { skip, take, where, orderBy } = params

  const [items, count] = await Promise.all([
    prisma.order.findMany({
      skip,
      take,
      where,
      orderBy,
    }),
    prisma.order.count({ where })
  ])

  return {
    items,
    count
  }
}

// 更新订单
export async function updateOrder(params: {
  where: Prisma.OrderWhereUniqueInput
  data: OrderUpdateInput
}) {
  const { where, data } = params

  return prisma.order.update({
    where,
    data
  })
}

// 删除订单
export async function deleteOrder(where: Prisma.OrderWhereUniqueInput) {
  return prisma.order.delete({
    where
  })
}

// 获取订单列表（支持分页、搜索、排序）- 管理员使用
export async function getOrderList(params: {
  page?: number
  pageSize?: number
  search?: string
  orderType?: string
  startDate?: string
  endDate?: string
  orderBy?: 'created_time' | 'price'
  order?: 'asc' | 'desc'
}) {
  const {
    page = 1,
    pageSize = 10,
    search,
    orderType,
    startDate,
    endDate,
    orderBy,
    order = 'desc',
  } = params

  const skip = (page - 1) * pageSize

  // 构建查询条件
  const where: Prisma.OrderWhereInput = {}

  if (search) {
    where.OR = [
      { orderId: { contains: search, mode: 'insensitive' } },
      { transactionId: { contains: search, mode: 'insensitive' } },
      { identifier: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (orderType) {
    where.orderType = orderType
  }

  // 日期范围筛选
  if (startDate || endDate) {
    where.created_time = {}
    if (startDate) {
      where.created_time.gte = new Date(startDate)
    }
    if (endDate) {
      where.created_time.lte = new Date(endDate + 'T23:59:59.999Z')
    }
  }

  // 构建排序条件
  const sortField = orderBy || 'created_time'
  const sortOrder = order || 'desc'

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortField]: sortOrder },
    }),
    prisma.order.count({ where }),
  ])

  return {
    orders,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

// 获取订单统计信息
export async function getOrderStats() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalOrders,
    todayOrders,
    monthOrders,
    totalRevenue,
    todayRevenue,
    monthRevenue,
  ] = await Promise.all([
    // 总订单数
    prisma.order.count(),
    // 今日订单数
    prisma.order.count({
      where: { created_time: { gte: todayStart } },
    }),
    // 本月订单数
    prisma.order.count({
      where: { created_time: { gte: monthStart } },
    }),
    // 总收入
    prisma.order.aggregate({
      _sum: { price: true },
    }),
    // 今日收入
    prisma.order.aggregate({
      where: { created_time: { gte: todayStart } },
      _sum: { price: true },
    }),
    // 本月收入
    prisma.order.aggregate({
      where: { created_time: { gte: monthStart } },
      _sum: { price: true },
    }),
  ])

  return {
    totalOrders,
    todayOrders,
    monthOrders,
    totalRevenue: totalRevenue._sum.price || 0,
    todayRevenue: todayRevenue._sum.price || 0,
    monthRevenue: monthRevenue._sum.price || 0,
  }
}
