---
order: 5
key: pay
title: 支付
description: 支付的介绍
---

# 支付环节

> 本项目目前支持的支付体系是使用微信支付体系，我们需要先部署模板提供的微信服务代码`mvpfast-wx-server`

支付需要的环境变量，其中`v3支付私钥`在微信云服务中已经获取过，证书序列号看图，**注意，序列号和私钥都是要使用同一个证书**

```js
NEXT_PUBLIC_API_URL = 支付回调地址; // 你的vercel部署域名
WECHAT_APPID = 公众号id;
WECHAT_MCHID = 商家号;
WECHAT_API_V3_KEY = v3支付私钥;
WECHAT_SERIAL_NO = 证书序列号;
WECHAT_PRIVATE_KEY = 证书密钥;
```

![pay1](/docs/assets/pay1.png)

### 1.支付流程

下图展示**MVPFAST**支付模块的主要流程，模板已经为你处理好支付流程中的问题，你只需要配置好对应环境变量即可

![pay](/docs/assets/pay.png)

### 2.支付商品信息修改

```js
// pay/page.tsx
const BASEINFO = {
  amount: 1, // 商品价格（分单位）, 1 = 0.01元
  description: 'MvpFast模板购买', // 商品信息描述
};
```

模板配有简单的购买页面

![pay2](/docs/assets/pay2.png)

购买成功

![pay3](/docs/assets/pay3.png)

##### 注意

购买成功后，**微信商家号**会收到付款，`wx-server`页面收到支付回调的处理，模板当前回调处理只做了输出，如有业务处理，可修改`wx-server`代码，之后可以在商家号【交易订单】页面查询订单情况，**所以在本地调试时最好使用`amount:1`来测试**

![pay4](/docs/assets/pay4.png)
