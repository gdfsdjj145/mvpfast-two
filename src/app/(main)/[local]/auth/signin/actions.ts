'use server';
import prisma from '@/lib/prisma';
import { getGeneratorName } from '@/lib/generatorName';
import sendEmail from '@/lib/email';
import sendPhone from '@/lib/phone';

const handlerSendCode = async (type: string, params: any, code: string) => {
  const { identifier } = params;

  const res = await prisma.verificationCode.findFirst({
    where: {
      identifier,
      expires_at: {
        gt: new Date(), //验证是否有效
      },
    },
  });

  if (res) {
    return {
      code: 0,
      data: {},
      message: '验证码已发送，验证码在有效期内',
    };
  }

  if (type === 'email') {
    const info = await sendEmail({
      to: identifier,
      code,
    });

    return info;
  }

  if (type === 'phone') {
    const info = await sendPhone(identifier, code);
    return info;
  }
};

// 发送验证码
export const sendCode = async (type: string, params: any) => {
  const { identifier } = params;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = new Date(Date.now() + 2 * 60 * 1000);

  const info: any = await handlerSendCode(type, params, code);

  if (info.success) {
    // 保存验证码到数据库
    await prisma.verificationCode.create({
      data: {
        identifier,
        code,
        expires_at,
      },
    });
  }

  return {
    code: 0,
    data: {},
    message: '验证码发送成功',
  };
};

// 验证码校验
export const verifyCode = async (type: string, params: any) => {
  const { identifier, code } = params;

  const res = await prisma.verificationCode.findFirst({
    where: {
      identifier,
      code,
      expires_at: {
        gt: new Date(), //验证是否有效
      },
    },
  });

  if (res) {
    // 验证成功
    await prisma.verificationCode.delete({
      where: { id: res.id },
    });
    return true;
  } else {
    // 验证失败
    return false;
  }
};

// 生成微信二维码
export const createQrCode = async (ticket: string) => {
  await prisma.verificationWxQrCode.create({
    data: {
      identifier: ticket,
      isScan: false,
    },
  });

  return {
    code: 0,
    data: {},
    message: '',
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

  const user = await prisma.user.findFirst({
    where: {
      wechatOpenId: qrcode.openId as string,
    },
  });

  console.log(user, 'user');

  if (!user) {
    // 没用用户 创建用户

    await prisma.user.create({
      data: {
        wechatOpenId: qrcode.openId as string,
        nickName: getGeneratorName(),
        phone: null,
        email: null,
      },
    });

    return {
      openId: qrcode.openId as string,
      isScan: true,
    };
  }

  // 已创建用户

  return {
    openId: user.wechatOpenId ?? '',
    isScan: true,
  };
};
