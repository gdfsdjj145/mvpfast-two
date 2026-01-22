// 清理测试数据
// 运行方式: npx tsx scripts/cleanup-test-data.ts

import prisma from '../src/lib/prisma';

async function cleanupTestData() {
  console.log('=== 清理测试数据 ===\n');

  try {
    // 1. 删除测试兑换记录
    console.log('1. 删除测试兑换记录...');
    const deletedRecords = await prisma.redemptionRecord.deleteMany({
      where: {
        code: { in: ['WELCOME100', 'VIP500', 'PROMO50', 'GIFT200', 'EXPIRED01'] },
      },
    });
    console.log(`   删除了 ${deletedRecords.count} 条兑换记录`);

    // 2. 删除批量兑换码的记录
    const batchRecords = await prisma.redemptionRecord.deleteMany({
      where: {
        code: { startsWith: 'TB' },
      },
    });
    console.log(`   删除了 ${batchRecords.count} 条批量兑换码记录`);

    // 3. 删除测试兑换码
    console.log('\n2. 删除测试兑换码...');
    const deletedCodes = await prisma.redemptionCode.deleteMany({
      where: {
        OR: [
          { description: { contains: '[测试数据]' } },
          { batchId: 'TESTBATCH001' },
          { code: { in: ['WELCOME100', 'VIP500', 'PROMO50', 'GIFT200', 'EXPIRED01'] } },
        ],
      },
    });
    console.log(`   删除了 ${deletedCodes.count} 个测试兑换码`);

    // 4. 删除测试积分交易
    console.log('\n3. 删除测试积分交易...');
    const deletedTx = await prisma.creditTransaction.deleteMany({
      where: {
        description: { contains: '[测试]' },
      },
    });
    console.log(`   删除了 ${deletedTx.count} 条测试交易记录`);

    // 5. 统计当前数据
    console.log('\n4. 当前数据统计...');
    const stats = await Promise.all([
      prisma.redemptionCode.count(),
      prisma.redemptionRecord.count(),
      prisma.creditTransaction.count(),
    ]);
    console.log(`   - 兑换码总数: ${stats[0]}`);
    console.log(`   - 兑换记录数: ${stats[1]}`);
    console.log(`   - 积分交易数: ${stats[2]}`);

    console.log('\n=== 测试数据清理完成 ✅ ===');

  } catch (error: any) {
    console.error('\n❌ 清理失败:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTestData();
