// ============================================
// 代码层面配置（静态配置）
// ============================================
// 此文件仅包含代码层面的静态配置项
// 以下配置通过数据库系统设置管理，不在此文件中：
// - 站点名称 (system.siteName)
// - 登录方式 (auth.loginType, auth.loginTypes)
// - 支付方式 (payment.methods)
// - 积分赠送 (credits.initialCredits)
// - 统计配置 (analytics.googleAnalyticsId)
// ============================================

// ============================================
// 类型定义
// ============================================

// 购买模式类型
export type PurchaseMode = 'direct' | 'credits';

// 积分套餐类型
export type CreditPackage = {
  id: string;
  credits: number;    // 积分数量
  price: number;      // 价格（元）
  bonus: number;      // 赠送积分
  popular?: boolean;  // 是否热门
};

// 商品类型
export type Product = {
  key: string;
  name: string;
  description: string;
  includedFeatures: string[];
  price: number;        // 单次购买模式价格
  creditPrice: number;  // 积分购买模式价格
  original: number;     // 原价
  mostPopular: boolean;
  href: string;
};

// ============================================
// 配置
// ============================================

export const config = {
  // 是否开启数据库功能
  // 登录、支付功能都需要开启数据能力
  db: true,

  // ============================================
  // 购买模式配置
  // ============================================
  // 'direct' - 单次购买模式：用户直接支付购买商品，商品使用 price 定价
  // 'credits' - 积分购买模式：用户先充值积分，再用积分购买商品，商品使用 creditPrice 定价
  purchaseMode: 'direct' as PurchaseMode,

  // ============================================
  // 积分充值套餐（仅 purchaseMode: 'credits' 时生效）
  // ============================================
  creditPackages: [
    { id: 'basic', credits: 100, price: 10, bonus: 0, popular: false },
    { id: 'standard', credits: 500, price: 50, bonus: 50, popular: true },
    { id: 'premium', credits: 1000, price: 100, bonus: 150, popular: false },
  ] as CreditPackage[],

  // ============================================
  // 商品配置
  // ============================================
  // 商品信息在 i18n 文件中也有配置，此处为默认值
  // 单次购买模式使用 price，积分购买模式使用 creditPrice
  goods: [
    {
      key: 'normal',
      name: '商品1',
      description: '快来购买啊',
      includedFeatures: ['独孤九剑', '少林大力金刚脚', '铁头功'],
      price: 199,
      creditPrice: 1990,
      original: 299,
      mostPopular: false,
      href: '/pay?key=normal',
    },
    {
      key: 'most',
      name: '商品2',
      description: '快来购买鸭',
      includedFeatures: [
        '独孤九剑',
        '少林大力金刚脚',
        '铁头功',
        '铁掌水上漂',
        '旋风扫荡腿',
      ],
      price: 249,
      creditPrice: 2490,
      original: 349,
      mostPopular: true,
      href: '/pay?key=most',
    },
  ] as Product[],
};
