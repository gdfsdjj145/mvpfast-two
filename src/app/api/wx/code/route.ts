import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  const result = await request.json();

  const qrCode = await prisma.verificationWxQrCode.findUnique({
    where: {
      identifier: result.ticket,
    },
  });

  if (!qrCode) {
    // 二维码不存在
    return NextResponse.json(
      {
        data: {},
        msg: '二维码不存在',
      },
      {
        status: 500,
      }
    );
  }

  // 二维码存在  修改二维码数据状态
  await prisma.verificationWxQrCode.update({
    where: {
      identifier: result.ticket,
    },
    data: {
      isScan: true,
      openId: result.openId,
    },
  });

  return NextResponse.json(
    {
      data: {},
      msg: '已修改二维码状态',
    },
    {
      status: 200,
    }
  );
}
