// 创建后台管理测试数据
// 运行方式: npx tsx scripts/create-test-data.ts

import prisma from '../src/lib/prisma';

async function createTestData() {
  console.log('=== 创建后台管理测试数据 ===\n');

  try {
    // 1. 创建测试兑换码
    console.log('1. 创建测试兑换码...');

    // 清理旧的测试数据
    await prisma.redemptionCode.deleteMany({
      where: {
        description: { contains: '[测试数据]' },
      },
    });

    const testCodes = [
      { code: 'WELCOME100', creditAmount: 100, maxUses: 100, description: '[测试数据] 新用户欢迎礼包' },
      { code: 'VIP500', creditAmount: 500, maxUses: 10, description: '[测试数据] VIP专属福利' },
      { code: 'PROMO50', creditAmount: 50, maxUses: 50, description: '[测试数据] 活动促销码' },
      { code: 'GIFT200', creditAmount: 200, maxUses: 5, description: '[测试数据] 赠品兑换码' },
      { code: 'EXPIRED01', creditAmount: 100, maxUses: 10, description: '[测试数据] 已过期测试', expiresAt: new Date('2024-01-01') },
    ];

    for (const code of testCodes) {
      await prisma.redemptionCode.upsert({
        where: { code: code.code },
        update: {},
        create: {
          ...code,
          usedCount: 0,
          isActive: true,
          createdBy: '000000000000000000000001',
        },
      });
    }
    console.log(`   ✅ 创建了 ${testCodes.length} 个测试兑换码\n`);

    // 2. 批量创建一批兑换码
    console.log('2. 批量创建兑换码...');
    const batchId = 'TESTBATCH001';

    // 先删除旧批次
    await prisma.redemptionCode.deleteMany({
      where: { batchId },
    });

    const batchCodes = Array.from({ length: 10 }, (_, i) => ({
      code: `TB${String(i + 1).padStart(4, '0')}`,
      creditAmount: 100,
      maxUses: 1,
      usedCount: 0,
      isActive: true,
      description: '[测试数据] 批量生成码',
      createdBy: '000000000000000000000001',
      batchId,
    }));

    await prisma.redemptionCode.createMany({
      data: batchCodes,
    });
    console.log(`   ✅ 批量创建了 ${batchCodes.length} 个兑换码 (批次: ${batchId})\n`);

    // 3. 模拟一些使用记录
    console.log('3. 模拟兑换使用记录...');

    // 获取一些真实用户
    const users = await prisma.user.findMany({ take: 3 });

    if (users.length > 0) {
      // 获取 PROMO50 兑换码
      const promoCode = await prisma.redemptionCode.findUnique({
        where: { code: 'PROMO50' },
      });

      if (promoCode) {
        for (let i = 0; i < Math.min(users.length, 2); i++) {
          const user = users[i];

          // 检查是否已经有记录
          const existing = await prisma.redemptionRecord.findUnique({
            where: {
              codeId_userId: {
                codeId: promoCode.id,
                userId: user.id,
              },
            },
          });

          if (!existing) {
            await prisma.redemptionRecord.create({
              data: {
                codeId: promoCode.id,
                code: promoCode.code,
                userId: user.id,
                userIdentifier: user.nickName || user.phone || user.email || '未知用户',
                creditAmount: promoCode.creditAmount,
              },
            });

            // 更新使用次数
            await prisma.redemptionCode.update({
              where: { id: promoCode.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }
        console.log(`   ✅ 为 PROMO50 添加了使用记录\n`);
      }
    }

    // 4. 添加一些积分交易记录
    console.log('4. 添加积分交易记录...');

    if (users.length > 0) {
      const testUser = users[0];

      // 删除旧的测试交易记录
      await prisma.creditTransaction.deleteMany({
        where: {
          userId: testUser.id,
          description: { contains: '[测试]' },
        },
      });

      const transactions = [
        { type: 'recharge', amount: 100, description: '[测试] 新用户奖励' },
        { type: 'consume', amount: -30, description: '[测试] API调用消费' },
        { type: 'recharge', amount: 50, description: '[测试] 兑换码充值' },
        { type: 'consume', amount: -20, description: '[测试] 功能使用消费' },
      ];

      let balance = testUser.credits;
      for (const tx of transactions) {
        balance += tx.amount;
        await prisma.creditTransaction.create({
          data: {
            userId: testUser.id,
            type: tx.type,
            amount: tx.amount,
            balance,
            description: tx.description,
          },
        });
      }

      // 更新用户积分
      await prisma.user.update({
        where: { id: testUser.id },
        data: { credits: balance },
      });

      console.log(`   ✅ 为用户 ${testUser.nickName} 添加了 ${transactions.length} 条交易记录\n`);
    }

    // 5. 统计信息
    console.log('5. 当前数据统计...');
    const stats = await Promise.all([
      prisma.redemptionCode.count(),
      prisma.redemptionCode.count({ where: { isActive: true } }),
      prisma.redemptionRecord.count(),
      prisma.creditTransaction.count(),
      prisma.user.count(),
    ]);

    console.log(`   - 兑换码总数: ${stats[0]}`);
    console.log(`   - 有效兑换码: ${stats[1]}`);
    console.log(`   - 兑换记录数: ${stats[2]}`);
    console.log(`   - 积分交易数: ${stats[3]}`);
    console.log(`   - 用户总数: ${stats[4]}`);

    console.log('\n=== 测试数据创建完成 ✅ ===');
    console.log('\n现在你可以:');
    console.log('  1. 访问 /dashboard/redemption 查看兑换码管理');
    console.log('  2. 访问 /dashboard/credits 查看积分记录');
    console.log('  3. 访问 /dashboard/users 查看用户管理');
    console.log('\n测试兑换码:');
    console.log('  - WELCOME100 (100积分, 100次)');
    console.log('  - VIP500 (500积分, 10次)');
    console.log('  - PROMO50 (50积分, 50次)');
    console.log('  - GIFT200 (200积分, 5次)');
    console.log('  - TB0001-TB0010 (100积分, 各1次)');

  } catch (error: any) {
    console.error('\n❌ 创建失败:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
