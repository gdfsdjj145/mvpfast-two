'use server';
import prisma from '@/lib/prisma';
import { getGeneratorName } from '@/lib/generatorName';

export const handleUserLogin = async (session: any) => {
  console.log('session', session);

  if (!session) {
    throw new Error('用户未登录');
  }

  // 检查用户是否存在
  const existingUser = await prisma.user.findFirst({
    where: {
      supabaseId: session.user.id,
    },
  });

  // 如果用户不存在，创建新用户
  if (!existingUser) {
    const res = await prisma.user.create({
      data: {
        email: session.user.email,
        nickName: getGeneratorName(), // 生成随机昵称
        avatar: session.user.user_metadata?.avatar_url || null,
        supabaseId: session.user.id,
      },
    });
    return res;
  }

  const user = await prisma.user.findFirst({
    where: {
      supabaseId: session.user.id,
    },
  });
  return user;
};
