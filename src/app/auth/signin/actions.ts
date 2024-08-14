'use server';
import prisma from '@/app/lib/prisma';
import { getGeneratorName } from '@/app/lib/generatorName';

export const createQrCode = async (ticket: string) => {
  await prisma.verificationWxQrCode.create({
    data: {
      identifier: ticket,
      expires: new Date(Date.now() + 60),
      isScan: false,
    },
  });

  return {
    code: 0,
    data: {},
    msg: '',
  };
};

export const checkQrCode = async (
  ticket: string
): Promise<{
  openId: string;
  isScan: boolean;
}> => {
  const qrcode: any = await prisma.verificationWxQrCode.findUnique({
    where: {
      identifier: ticket,
    },
    select: {
      isScan: true,
      openId: true,
    },
  });
  if (!qrcode?.isScan) {
    return {
      isScan: false,
      openId: '',
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      wechatOpenId: qrcode.openId as string,
    },
  });

  if (!user) {
    // 没用用户 创建用户

    await prisma.user.create({
      data: {
        wechatOpenId: qrcode.openId as string,
        createdDate: new Date(),
        nickName: getGeneratorName(),
      },
    });

    return {
      openId: qrcode.openId as string,
      isScan: true,
    };
  }

  // 已创建用户

  return {
    openId: user.wechatOpenId,
    isScan: true,
  };
};
