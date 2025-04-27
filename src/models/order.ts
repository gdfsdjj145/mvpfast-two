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
