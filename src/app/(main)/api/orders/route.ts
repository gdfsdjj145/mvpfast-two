import { NextResponse, NextRequest } from 'next/server';
import { createOrder, getOrders } from '@/models/order';

// 获取订单列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const take = parseInt(searchParams.get('take') || '10', 10);
    const orderType = searchParams.get('orderType');
    
    // 构建查询条件
    const where = orderType ? { orderType } : {};
    
    const { items, count } = await getOrders({
      skip,
      take,
      where,
      orderBy: { created_time: 'desc' }
    });
    
    return NextResponse.json(
      {
        data: { items, count },
        message: '获取订单列表成功',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return NextResponse.json(
      {
        data: null,
        message: '获取订单列表失败',
      },
      { status: 500 }
    );
  }
}

// 创建订单
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 验证必填字段
    const requiredFields = ['identifier', 'name', 'orderId', 'orderType', 'price', 'promotionPrice', 'transactionId'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          {
            data: null,
            message: `缺少必填字段: ${field}`,
          },
          { status: 400 }
        );
      }
    }
    
    const order = await createOrder(data);
    
    return NextResponse.json(
      {
        data: order,
        message: '创建订单成功',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json(
      {
        data: null,
        message: '创建订单失败',
      },
      { status: 500 }
    );
  }
} 