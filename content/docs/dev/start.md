---
order: 3
key: start
title: 快速开始
description: MvpFast的介绍
---

# 开发

> 请确保 Node 环境>= 20.0.0 （作者使用的环境）

### 获取 MvpFast 代码

通过 github 获取模板代码之后，了解代码结构，分别是`mvpfast`和`mvpfast-wx-server`两个项目

```
// mvpfast
content //内容文件（博客、文章）
| content/blog
| content/docs
contentlayer.config.ts
next.config.mjs
next-env.d.ts
node_modules
package.json
postcss.config.mjs
prisma // 数据库orm
| prisma/schema.prisma
public
| public/docs
| public/fonts
README.md
src
| src/app
| | src/app/api //next 后台api
| | src/app/auth // nextauth 集成
| | src/app/blog // 博客页面
| | src/app/docs // 文档页面
| | src/app/favicon.ico // logo文件
| | src/app/globals.css
| | src/app/layout.tsx // 首页
| | src/app/pay // 支付页面
| src/auth.ts // nextauth 功能
| src/components // 组件文件
| src/lib // 功能集成
| | src/lib/email.ts //邮箱功能
| | src/lib/pay.ts // 支付功能
| | src/lib/phone.ts // 手机功能
| src/middleware.ts // 路由中间件
| src/store // 全局状态
tailwind.config.ts
tsconfig.json
```

```js
// mvpfast-wx-server
.git
.gitignore
config.js
container.config.json
Dockerfile
index.html
index.js
LICENSE
node_modules
package.json
README.md
```

## 运行 MvpFast 项目

### 1.获取对应环境变量

```js
// 数据库
DATABASE_URL = MongoAltas链接地址;
// STMP服务
MAIL_HOST = stmp服务地址;
MAIL_PORT = stmp服务端口;
MAIL_USER = smtp服务用户名;
MAIL_PASS = smtp服务账号密码;
// NextAuth
NEXTAUTH_SECRET = nextauth签名;
NEXTAUTH_SALT = nextauth签名;
// 阿里云sms服务
ALIYUN_ACCESS_KEY_ID = 阿里云access_key;
ALIYUN_ACCESS_KEY_SECRET = 阿里云access_secret_key;
ALIYUN_SMS_SIGN_NAME = sms服务签名;
ALIYUN_SMS_TEMPLATE_CODE = sms服务模板代码;
// 微信体系
WECHAT_APPID = 公众号id;
WECHAT_MCHID = 商家号id;
WECHAT_API_V3_KEY = v3接口私钥;
NEXT_PUBLIC_API_URL = 云托管服务访问地址;
WECHAT_SERIAL_NO = 证书序列号;
WECHAT_PRIVATE_KEY = 交易私钥;
```

### 2.安装依赖

在项目根目录

```
pnpm install
```

### 3.运行

```
pnpm run dev
```

## 运行微信服务

### 1.获取对应的环境变量

`mvpfast-wx-server`项目中的`config.js`文件

```js
callbackServer: nextjs的部署域名;
appid: 公众号id;
mchid: 商家号id;
publicKey: 交易公钥;
privateKey: 交易私钥;
```

### 2.部署到微信云托管

[微信云服务]: www.baidu.com

## 运行成功

完成所有准备工作，顺利的运行 **MvpFast**的项目，就可以访问`http://localhost:3000`访问项目了，可以开始开发自己的应用网站了

![start](/docs/assets/start.png)
