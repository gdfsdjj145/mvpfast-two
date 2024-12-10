---
order: 5
key: yungouos
title: YunGouOS第三方支付
description: YunGouOS第三方支付的介绍
---

> 使用国内 YunGouOS 的第三方支付平台，YunGouOS 作为第三方聚合平台，已存在 9 年历史

官网地址： https://www.yungouos.com/#/。

目前`YunGouOS`支持个人的微信签约，可以使用个人银行卡对接，**建议不要使用主要银行卡**💳。

邀请链接 🎁：https://dwz.cn/PZqBZIVm。

#### 微信签约（个人）

通过微信中的个人签约，费用可选 200 元的套餐。

![image-20241209105134715](/docs/assets/yungouos/1.png)

#### 配置

签约成功后可以在商户管理查看关键配置。

![image-20241209105651406](/docs/assets/yungouos/2.png)

```shell
// yungouos 环境变量

NEXT_PUBLIC_YUNGOUOS_API_KEY=xxxx // 支付密钥
NEXT_PUBLIC_YUNGOUOS_MCH_ID=xxxx // 商家号
```

修改`src/config.ts`中的主要配置

```ts
 // 支付方式

// use 可以都修改为true，为多个选项
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
      use: false, // 修改成true为使用yungou
    },
  ],
```

修改`/components/PayQrcode`中的`yungouos`配置

```tsx
const params = {
  out_trade_no: outTradeNo,
  total_fee: `0.01`, // 使用时修改成为 amount      0.01为测试
  mch_id: process.env.NEXT_PUBLIC_YUNGOUOS_MCH_ID,
  body: description,
};
```

#### 优点

- 第三方支付可以快速的接入，避免很多手续问题
- 个人也可以使用
