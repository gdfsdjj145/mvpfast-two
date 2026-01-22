#!/usr/bin/env tsx

/**
 * 创建管理员账号脚本
 *
 * 根据邮箱或手机号创建/升级管理员账号
 *
 * 使用方法:
 *   npx tsx scripts/create-admin.ts admin@example.com
 *   npx tsx scripts/create-admin.ts 13800138000
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const identifier = process.argv[2];

  if (!identifier) {
    console.error('❌ 请提供邮箱或手机号');
    console.log('\n使用方法:');
    console.log('  npx tsx scripts/create-admin.ts admin@example.com');
    console.log('  npx tsx scripts/create-admin.ts 13800138000\n');
    process.exit(1);
  }

  // 判断是邮箱还是手机号
  const isEmail = identifier.includes('@');
  const whereClause = isEmail ? { email: identifier } : { phone: identifier };
  const identifierType = isEmail ? '邮箱' : '手机号';

  console.log(`正在查找用户（${identifierType}: ${identifier}）...\n`);

  // 查找用户
  let user = await prisma.user.findFirst({ where: whereClause });

  if (user) {
    // 用户已存在，更新角色
    if (user.role === 'admin' || user.role === 'superadmin') {
      console.log(`✅ 用户已经是管理员（角色: ${user.role}）`);
      console.log(`   ID: ${user.id}`);
      console.log(`   昵称: ${user.nickName}`);
      console.log(`   邮箱: ${user.email || '-'}`);
      console.log(`   手机: ${user.phone || '-'}\n`);
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin' },
      });

      console.log('✅ 用户角色已升级为管理员');
      console.log(`   ID: ${user.id}`);
      console.log(`   昵称: ${user.nickName}`);
      console.log(`   邮箱: ${user.email || '-'}`);
      console.log(`   手机: ${user.phone || '-'}\n`);
    }
  } else {
    // 用户不存在，创建新管理员
    user = await prisma.user.create({
      data: {
        ...(isEmail ? { email: identifier } : { phone: identifier }),
        nickName: `Admin_${identifier.substring(0, 8)}`,
        role: 'admin',
      },
    });

    console.log('✅ 管理员账号创建成功');
    console.log(`   ID: ${user.id}`);
    console.log(`   昵称: ${user.nickName}`);
    console.log(`   邮箱: ${user.email || '-'}`);
    console.log(`   手机: ${user.phone || '-'}`);
    console.log(`   角色: ${user.role}\n`);
    console.log('⚠️  注意: 请使用邮箱/手机验证码登录激活账号\n');
  }

  console.log('完成！');
}

main()
  .catch((e) => {
    console.error('创建管理员时发生错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
