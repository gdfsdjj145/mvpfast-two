// 创建测试用户
// 运行方式: npx tsx scripts/create-test-users.ts

import prisma from '../src/lib/core/prisma';

async function createTestUsers() {
  console.log('=== 创建测试用户 ===\n');

  try {
    const testUsers = [
      {
        phone: '13800138001',
        nickName: '测试用户A',
        role: 'user',
        credits: 0,
        totalSpent: 0,
      },
      {
        phone: '13800138002',
        nickName: '测试用户B',
        role: 'user',
        credits: 0,
        totalSpent: 0,
      },
    ];

    console.log('正在创建测试用户...\n');

    for (const userData of testUsers) {
      // 检查是否已存在
      const existing = await prisma.user.findFirst({
        where: { phone: userData.phone },
      });

      if (existing) {
        console.log(`⚠️  用户已存在: ${userData.nickName} (${userData.phone})`);
        continue;
      }

      const user = await prisma.user.create({
        data: userData,
      });

      console.log(`✅ 创建成功: ${user.nickName}`);
      console.log(`   手机号: ${user.phone}`);
      console.log(`   ID: ${user.id}`);
      console.log('');
    }

    // 显示所有测试用户
    console.log('\n=== 测试用户列表 ===');
    const users = await prisma.user.findMany({
      where: {
        phone: { in: ['13800138001', '13800138002'] },
      },
      select: {
        id: true,
        nickName: true,
        phone: true,
        credits: true,
        role: true,
      },
    });

    console.table(users);

    console.log('\n=== 测试用户创建完成 ✅ ===');
    console.log('\n提示: 使用这些手机号登录后可以测试兑换积分功能');

  } catch (error: any) {
    console.error('\n❌ 创建失败:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
