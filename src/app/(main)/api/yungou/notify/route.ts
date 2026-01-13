import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const result = await request.json();

  const { outTradeNo, payNo, money, sign, code } = result;

  console.log(result);

  const payOrder = await prisma.payOrder.findFirst({
    where: {
      identifier: outTradeNo,
      sign: sign,
    },
  });
  if (code && payOrder) {
    await prisma.payOrder.update({
      where: {
        id: payOrder.id,
      },
      data: { status: 'success' },
    });
  }

  return new NextResponse('SUCCESS');
}
