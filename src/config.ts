export const config = {
  // 是否开启数据库功能
  // 登录、支付功能都需要开启数据能力
  db: true,
  // 登录集成功能
  // 首次以微信登录为主
  loginType: 'wx',
  // 登录方式 最少一个
  // wx 微信登录  phone 手机登录 email 邮箱登录
  loginTypes: ['wx'],
  // 支付方式
  payConfig: [
    {
      key: 'wechat',
      name: '微信支付',
      icon: '/微信支付.png',
      activeColor: 'green',
      use: true,
    },
    {
      key: 'yungou',
      name: 'YunGou',
      icon: '/yungou.png',
      activeColor: 'blue',
      use: false,
    },
  ],
  // 商品信息
  goods: [
    {
      key: 'normal',
      name: '商品1',
      description: '快来购买啊',
      includedFeatures: ['独孤九剑', '少林大力金刚脚', '铁头功'],
      price: 199,
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
      original: 349,
      price: 249,
      mostPopular: true,
      href: '/pay?key=most',
    },
  ],
};
