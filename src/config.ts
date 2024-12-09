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
      name: '开发模板代码',
      description:
        '包含了基础的网站开发功能，例如用户登录，数据库，博客，文章，支付等能力的集成方案。购买后，你可以永久的使用MvpFast的模板，并且享受该模板后续版本的更新功能，在网站上线过程中如遇到问题，可以享受作者的技术支持服务，帮你解决一切的技术问题。',
      includedFeatures: [
        '登录 + 数据库 + 支付功能等封装能力',
        '前端代码（NextJs + Tailwindcss）',
        '微信公众号服务代码',
      ],
      price: 199,
      original: 299,
      mostPopular: false,
      href: '/pay?key=normal',
    },
    {
      key: 'most',
      name: '开发模板代码 + 从0到1Nextjs全栈开发课程',
      description:
        '包含开发模板代码所有内容、从0到1的Nextjs全栈开发课程所有内容',
      includedFeatures: [
        '登录 + 数据库 + 支付功能等封装能力',
        '前端代码（NextJs + Tailwindcss）',
        '微信公众号服务代码',
        '从0到1的Nextjs全栈开发课程',
        '课程学习过程的内容解答',
        '技术支持服务',
      ],
      original: 349,
      price: 249,
      mostPopular: true,
      href: '/pay?key=most',
    },
  ],
};
