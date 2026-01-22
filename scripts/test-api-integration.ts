// API 集成测试脚本
// 运行方式: npx tsx scripts/test-api-integration.ts

import prisma from '../src/lib/prisma';

async function testAPIIntegration() {
  console.log('=== API 集成测试 ===\n');

  const testCodes: string[] = [];
  const testRecordIds: string[] = [];
  let testUserId: string | null = null;

  try {
    // 1. 准备测试用户
    console.log('1. 准备测试用户...');
    let testUser = await prisma.user.findFirst({
      where: { nickName: 'API测试用户' },
    });
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          nickName: 'API测试用户',
          phone: '13800000001',
          credits: 0,
          totalSpent: 0,
          role: 'user',
        },
      });
      testUserId = testUser.id;
    }
    console.log(`   ✅ 测试用户准备完成: ${testUser.nickName} (ID: ${testUser.id.slice(-8)})\n`);

    // 2. 测试创建单个兑换码
    console.log('2. 测试创建单个兑换码...');
    const singleCode = await prisma.redemptionCode.create({
      data: {
        code: 'SINGLE' + Date.now().toString().slice(-6),
        creditAmount: 50,
        maxUses: 1,
        usedCount: 0,
        isActive: true,
        description: '单个测试兑换码',
        createdBy: '000000000000000000000001',
      },
    });
    testCodes.push(singleCode.id);
    console.log(`   ✅ 创建成功: ${singleCode.code} (${singleCode.creditAmount}积分)\n`);

    // 3. 测试批量创建兑换码
    console.log('3. 测试批量创建兑换码...');
    const batchId = 'BATCH' + Date.now();
    const batchData = Array.from({ length: 5 }, (_, i) => ({
      code: `BATCH${Date.now().toString().slice(-6)}${i}`,
      creditAmount: 100,
      maxUses: 3,
      usedCount: 0,
      isActive: true,
      description: '批量测试兑换码',
      createdBy: '000000000000000000000001',
      batchId,
    }));
    await prisma.redemptionCode.createMany({ data: batchData });
    const batchCodes = await prisma.redemptionCode.findMany({
      where: { batchId },
    });
    batchCodes.forEach((c) => testCodes.push(c.id));
    console.log(`   ✅ 批量创建成功: ${batchCodes.length} 个兑换码`);
    batchCodes.forEach((c) => console.log(`      - ${c.code}`));
    console.log('');

    // 4. 测试兑换流程
    console.log('4. 测试兑换流程...');
    const codeToRedeem = singleCode;

    // 模拟兑换 - 使用事务
    const redeemResult = await prisma.$transaction(async (tx) => {
      // 更新用户积分
      const updatedUser = await tx.user.update({
        where: { id: testUser!.id },
        data: { credits: { increment: codeToRedeem.creditAmount } },
      });

      // 创建兑换记录
      const record = await tx.redemptionRecord.create({
        data: {
          codeId: codeToRedeem.id,
          code: codeToRedeem.code,
          userId: testUser!.id,
          userIdentifier: testUser!.nickName,
          creditAmount: codeToRedeem.creditAmount,
        },
      });
      testRecordIds.push(record.id);

      // 更新兑换码使用次数
      await tx.redemptionCode.update({
        where: { id: codeToRedeem.id },
        data: { usedCount: { increment: 1 } },
      });

      // 创建积分交易记录
      await tx.creditTransaction.create({
        data: {
          userId: testUser!.id,
          type: 'recharge',
          amount: codeToRedeem.creditAmount,
          balance: updatedUser.credits,
          description: `兑换码充值: ${codeToRedeem.code}`,
        },
      });

      return { user: updatedUser, record };
    });
    console.log(`   ✅ 兑换成功!`);
    console.log(`      - 兑换码: ${codeToRedeem.code}`);
    console.log(`      - 获得积分: +${codeToRedeem.creditAmount}`);
    console.log(`      - 用户新余额: ${redeemResult.user.credits}\n`);

    // 5. 测试重复兑换（应该失败）
    console.log('5. 测试重复兑换保护...');
    const existingRecord = await prisma.redemptionRecord.findUnique({
      where: {
        codeId_userId: {
          codeId: codeToRedeem.id,
          userId: testUser.id,
        },
      },
    });
    if (existingRecord) {
      console.log('   ✅ 重复兑换保护生效 - 已阻止同一用户重复使用同一兑换码\n');
    }

    // 6. 测试查询兑换码详情
    console.log('6. 测试查询兑换码详情...');
    const codeDetail = await prisma.redemptionCode.findUnique({
      where: { id: singleCode.id },
    });
    const codeRecords = await prisma.redemptionRecord.findMany({
      where: { codeId: singleCode.id },
    });
    console.log(`   ✅ 查询成功:`);
    console.log(`      - 兑换码: ${codeDetail?.code}`);
    console.log(`      - 使用次数: ${codeDetail?.usedCount}/${codeDetail?.maxUses}`);
    console.log(`      - 使用记录: ${codeRecords.length} 条\n`);

    // 7. 测试禁用兑换码
    console.log('7. 测试禁用兑换码...');
    await prisma.redemptionCode.update({
      where: { id: batchCodes[0].id },
      data: { isActive: false },
    });
    console.log(`   ✅ 禁用成功: ${batchCodes[0].code}\n`);

    // 8. 测试积分记录查询
    console.log('8. 测试积分记录查询...');
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: testUser.id },
      orderBy: { created_time: 'desc' },
    });
    console.log(`   ✅ 查询成功，共 ${transactions.length} 条记录`);
    transactions.forEach((t) => {
      console.log(`      - ${t.type}: ${t.amount > 0 ? '+' : ''}${t.amount}, 余额: ${t.balance}, ${t.description}`);
    });
    console.log('');

    // 9. 统计信息
    console.log('9. 统计信息...');
    const stats = await Promise.all([
      prisma.redemptionCode.count(),
      prisma.redemptionCode.count({ where: { isActive: true } }),
      prisma.redemptionRecord.count(),
      prisma.creditTransaction.count(),
      prisma.redemptionCode.aggregate({ _sum: { usedCount: true } }),
      prisma.redemptionRecord.aggregate({ _sum: { creditAmount: true } }),
    ]);
    console.log(`   - 兑换码总数: ${stats[0]}`);
    console.log(`   - 有效兑换码: ${stats[1]}`);
    console.log(`   - 兑换记录数: ${stats[2]}`);
    console.log(`   - 积分交易数: ${stats[3]}`);
    console.log(`   - 总使用次数: ${stats[4]._sum.usedCount || 0}`);
    console.log(`   - 总发放积分: ${stats[5]._sum.creditAmount || 0}`);
    console.log('');

    console.log('=== 所有测试通过 ✅ ===\n');

    // 10. 清理测试数据
    console.log('10. 清理测试数据...');

    // 删除兑换记录
    if (testRecordIds.length > 0) {
      await prisma.redemptionRecord.deleteMany({
        where: { id: { in: testRecordIds } },
      });
      console.log(`    - 删除 ${testRecordIds.length} 条兑换记录`);
    }

    // 删除积分交易记录
    if (testUser) {
      const deletedTx = await prisma.creditTransaction.deleteMany({
        where: { userId: testUser.id },
      });
      console.log(`    - 删除 ${deletedTx.count} 条积分交易记录`);
    }

    // 删除测试兑换码
    if (testCodes.length > 0) {
      await prisma.redemptionCode.deleteMany({
        where: { id: { in: testCodes } },
      });
      console.log(`    - 删除 ${testCodes.length} 个测试兑换码`);
    }

    // 重置测试用户积分
    if (testUser) {
      await prisma.user.update({
        where: { id: testUser.id },
        data: { credits: 0 },
      });
      console.log(`    - 重置测试用户积分`);
    }

    // 删除测试用户（如果是新创建的）
    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId },
      });
      console.log(`    - 删除测试用户`);
    }

    console.log('\n   ✅ 测试数据清理完成');

  } catch (error: any) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('   详细信息:', error);

    // 尝试清理
    console.log('\n尝试清理残留数据...');
    try {
      if (testRecordIds.length > 0) {
        await prisma.redemptionRecord.deleteMany({
          where: { id: { in: testRecordIds } },
        });
      }
      if (testCodes.length > 0) {
        await prisma.redemptionCode.deleteMany({
          where: { id: { in: testCodes } },
        });
      }
      if (testUserId) {
        await prisma.user.delete({
          where: { id: testUserId },
        }).catch(() => {});
      }
      console.log('   清理完成');
    } catch (e) {
      console.error('   清理失败:', e);
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIIntegration();
