'use server';
import prisma from '@/app/lib/prisma';
import Mint from 'mint-filter';
import { sensitives } from '../lib/sensitive_words';

const mint = new Mint(sensitives);

type User = {
  id: string;
  nickName: string | null;
};

export const getUser = async (openId: string): Promise<User> => {
  const user: any = await prisma.user.findUnique({
    where: {
      wechatOpenId: openId,
    },
    select: {
      nickName: true,
      id: true,
    },
  });

  return user;
};

export const getGroups = async (
  id: string
): Promise<
  Array<{
    id: string;
    createUserId: string;
    name: string;
    describe: string;
  }>
> => {
  const groupUsers = await prisma.groupUser.findMany({
    where: {
      userId: id,
    },
  });

  const groupKeys = groupUsers.map((item) => item.groupId);

  const groups = await prisma.group.findMany({
    where: {
      id: {
        in: [...groupKeys],
      },
    },
  });

  return groups || [];
};

export const getGroupUsers = async (params: any) => {
  const groupUsers = await prisma.groupUser.findMany({
    where: {
      groupId: params.id,
    },
  });

  return groupUsers || [];
};

export const getActives = async (params: any) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); // 设置为今天的开始时间

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const actives = await prisma.active.findMany({
    where: {
      AND: [
        {
          groupId: params.id,
        },
        {
          createdDate: {
            gte: todayStart,
            lt: todayEnd,
          },
        },
      ],
    },
  });

  return actives || [];
};

export const createGroup = async (params: any) => {
  const nameMatches = mint.verify(params.name);
  const describeMatches = mint.verify(params.describe);

  console.log(nameMatches, describeMatches);

  if (!nameMatches || !describeMatches) {
    return {
      code: 500,
      data: {},
      msg: '名称或描述有违规词',
    };
  }

  const data = await prisma.group.create({
    data: {
      createUserId: params.id,
      createdDate: new Date(),
      name: params.name,
      describe: params.describe,
    },
  });

  await prisma.groupUser.create({
    data: {
      userId: params.id,
      userName: params.nickName,
      groupId: data.id,
      active: 0,
      createdDate: new Date(),
    },
  });

  return {
    code: 0,
    data: {},
    msg: '',
  };
};

export const createActive = async (params: any) => {
  const data = await prisma.active.create({
    data: {
      createdDate: new Date(),
      userName: params.userName,
      userId: params.userId,
      groupId: params.groupId,
    },
  });

  await prisma.groupUser.update({
    where: {
      id: params.groupUserId,
    },
    data: {
      active: params.active,
    },
  });

  return {
    code: 0,
    data,
    msg: '',
  };
};

export const getOutGroup = async (params: any) => {
  await prisma.groupUser.delete({
    where: {
      id: params.id,
    },
  });

  return {
    code: 0,
    data: {},
    msg: '',
  };
};

export const addGroup = async (params: any) => {
  const gu = await prisma.groupUser.findMany({
    where: {
      AND: [
        {
          userId: params.userId,
        },
        {
          groupId: params.groupId,
        },
      ],
    },
  });
  if (gu.length) {
    return {
      code: 500,
      data: {},
      msg: '你已在该群中',
    };
  }

  try {
    const group = await prisma.group.findUnique({
      where: {
        id: params.groupId,
      },
    });
    if (!group) {
      return {
        code: 500,
        data: {},
        msg: '链接不正确',
      };
    }
  } catch (e) {
    return {
      code: 500,
      data: {},
      msg: '链接不正确',
    };
  }

  await prisma.groupUser.create({
    data: {
      userId: params.userId,
      userName: params.nickName,
      groupId: params.groupId,
      active: 0,
      createdDate: new Date(),
    },
  });
  return {
    code: 0,
    data: {},
    msg: '加入成功',
  };
};
