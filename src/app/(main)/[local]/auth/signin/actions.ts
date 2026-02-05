'use server';
import prisma from '@/lib/core/prisma';
import { getGeneratorName } from '@/lib/utils/name-generator';
import sendEmail from '@/lib/services/email';
import sendPhone from '@/lib/services/sms';
import { grantInitialCredits } from '@/models/credit';
import bcrypt from 'bcryptjs';

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

  // 开发环境：跳过实际发送，直接提示使用万能验证码
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEV MODE] 跳过实际发送验证码，请使用万能验证码: 000000');
    console.log('[DEV MODE] 目标:', identifier);
    return {
      code: 0,
      data: {},
      message: '开发环境：请使用万能验证码 000000',
    };
  }

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

  // 开发环境：允许使用万能验证码 "000000"
  if (process.env.NODE_ENV === 'development' && code === '000000') {
    console.log('[DEV MODE] 使用万能验证码登录:', identifier);
    return true;
  }

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

    const newUser = await prisma.user.create({
      data: {
        wechatOpenId: qrcode.openId as string,
        nickName: getGeneratorName(),
        phone: null,
        email: null,
      },
    });

    // 新用户注册，赠送初始积分
    await grantInitialCredits(newUser.id);

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

// 密码加密
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

// 密码验证
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// 账号密码登录验证
export const verifyPasswordLogin = async (params: {
  identifier: string;
  password: string;
  identifierType: 'email' | 'phone';
}) => {
  const { identifier, password, identifierType } = params;

  // 查找用户
  const user = await prisma.user.findFirst({
    where: identifierType === 'email' ? { email: identifier } : { phone: identifier },
  });

  if (!user) {
    return { success: false, error: '用户不存在' };
  }

  if (!user.password) {
    return { success: false, error: '该账号未设置密码，请使用验证码登录' };
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return { success: false, error: '密码错误' };
  }

  return { success: true, user };
};

// 用户注册
export const registerUser = async (params: {
  identifier: string;
  password: string;
  identifierType: 'email' | 'phone';
  code: string;
}) => {
  const { identifier, password, identifierType, code } = params;

  // 验证验证码
  const isCodeValid = await verifyCode(identifierType, { identifier, code });
  if (!isCodeValid) {
    return { success: false, error: '验证码错误或已过期' };
  }

  // 检查用户是否已存在
  const existingUser = await prisma.user.findFirst({
    where: identifierType === 'email' ? { email: identifier } : { phone: identifier },
  });

  if (existingUser) {
    // 如果用户已存在但没有密码，则更新密码
    if (!existingUser.password) {
      const hashedPassword = await hashPassword(password);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
      });
      return { success: true, message: '密码设置成功' };
    }
    return { success: false, error: '该账号已注册' };
  }

  // 创建新用户
  const hashedPassword = await hashPassword(password);
  const newUser = await prisma.user.create({
    data: {
      [identifierType]: identifier,
      password: hashedPassword,
      nickName: getGeneratorName(),
      wechatOpenId: null,
      phone: identifierType === 'phone' ? identifier : null,
      email: identifierType === 'email' ? identifier : null,
    },
  });

  // 新用户注册，赠送初始积分
  await grantInitialCredits(newUser.id);

  return { success: true, message: '注册成功' };
};
