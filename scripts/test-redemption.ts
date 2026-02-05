// 测试脚本 - 检测 API 和数据库操作是否正常
// 运行方式: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/test-redemption.ts

import prisma from '../src/lib/core/prisma';

async function testRedemptionFeature() {
  console.log('=== 兑换码功能测试 ===\n');

  try {
    // 1. 测试数据库连接
    console.log('1. 测试数据库连接...');
    await prisma.$connect();
    console.log('   ✅ 数据库连接成功\n');

    // 2. 测试创建兑换码
    console.log('2. 测试创建兑换码...');
    const testCode = await prisma.redemptionCode.create({
      data: {
        code: 'TEST' + Date.now().toString().slice(-6),
        creditAmount: 100,
        maxUses: 5,
        usedCount: 0,
        isActive: true,
        description: '测试兑换码',
        createdBy: '000000000000000000000001', // dev admin ID
      },
    });
    console.log(`   ✅ 创建成功: ${testCode.code} (${testCode.creditAmount}积分)\n`);

    // 3. 测试查询兑换码列表
    console.log('3. 测试查询兑换码列表...');
    const codeList = await prisma.redemptionCode.findMany({
      take: 5,
      orderBy: { created_time: 'desc' },
    });
    console.log(`   ✅ 查询成功，共 ${codeList.length} 条记录`);
    codeList.forEach((c) => {
      console.log(`      - ${c.code}: ${c.creditAmount}积分, ${c.usedCount}/${c.maxUses}次, ${c.isActive ? '有效' : '禁用'}`);
    });
    console.log('');

    // 4. 测试更新兑换码
    console.log('4. 测试更新兑换码...');
    const updated = await prisma.redemptionCode.update({
      where: { id: testCode.id },
      data: { description: '测试兑换码 - 已更新' },
    });
    console.log(`   ✅ 更新成功: ${updated.description}\n`);

    // 5. 测试积分交易记录查询
    console.log('5. 测试积分交易记录查询...');
    const transactions = await prisma.creditTransaction.findMany({
      take: 5,
      orderBy: { created_time: 'desc' },
    });
    console.log(`   ✅ 查询成功，共 ${transactions.length} 条交易记录`);
    transactions.forEach((t) => {
      console.log(`      - ${t.type}: ${t.amount > 0 ? '+' : ''}${t.amount}, 余额: ${t.balance}`);
    });
    console.log('');

    // 6. 测试用户列表查询
    console.log('6. 测试用户列表查询...');
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, nickName: true, credits: true, role: true },
    });
    console.log(`   ✅ 查询成功，共 ${users.length} 个用户`);
    users.forEach((u) => {
      console.log(`      - ${u.nickName || '未命名'}: ${u.credits}积分, 角色: ${u.role}`);
    });
    console.log('');

    // 7. 测试删除兑换码
    console.log('7. 测试删除测试数据...');
    await prisma.redemptionCode.delete({
      where: { id: testCode.id },
    });
    console.log(`   ✅ 删除成功: ${testCode.code}\n`);

    // 8. 统计信息
    console.log('8. 统计信息...');
    const [totalCodes, activeCodes, totalUsers, totalTransactions] = await Promise.all([
      prisma.redemptionCode.count(),
      prisma.redemptionCode.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.creditTransaction.count(),
    ]);
    console.log(`   - 兑换码总数: ${totalCodes}`);
    console.log(`   - 有效兑换码: ${activeCodes}`);
    console.log(`   - 用户总数: ${totalUsers}`);
    console.log(`   - 交易记录数: ${totalTransactions}`);
    console.log('');

    console.log('=== 所有测试通过 ✅ ===');

  } catch (error: any) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.code === 'P1001') {
      console.error('   提示: 数据库连接超时，请检查网络和 DATABASE_URL 配置');
    }
    if (error.code === 'P2002') {
      console.error('   提示: 唯一约束冲突，可能是测试数据未清理');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testRedemptionFeature();
