export const config = {
  // 是否开启数据库功能
  // 登录、支付功能都需要开启数据能力
  db: true,
  // 登录集成功能
  // 首次以微信登录为主
  loginType: 'wx',
  // 登录方式 最少一个
  // wx 微信登录  phone 手机登录 email 邮箱登录
  loginTypes: ['wx', 'email'],
  // 支付集成功能
  // 支付金额 分为单位  即 100元 == 100+00 = 10000
  amount: 1,
  // 产品描述
  description: 'MvpFast模板购买',
};
