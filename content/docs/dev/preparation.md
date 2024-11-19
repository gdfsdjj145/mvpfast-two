---
order: 2
key: preparation
title: 准备工作
description: 开始开发前的准备工作
---

## 技术栈概览

MVPFAST 使用以下主要技术：

1. [Next.js](https://nextjs.org/) - React 框架
2. [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
3. [Prisma](https://www.prisma.io/) - 下一代 ORM
4. [NextAuth.js](https://next-auth.js.org/) - 身份认证解决方案
5. [DaisyUI](https://daisyui.com/) - Tailwind CSS 组件库
6. [MongoDB Atlas](https://www.mongodb.com/zh-cn/cloud/atlas/register) - 数据库
7. [Vercel](https://vercel.com/) - 云平台
8. [GitHub](https://github.com/) - 代码托管平台
9. [微信开发](https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html) - 公众号开发

## 环境变量配置

在项目根目录创建 `.env` 文件，添加以下环境变量：

```bash
env
数据库
DATABASE_URL="your_database_url"
NextAuth.js
NEXTAUTH_SECRET="your_nextauth_secret" // mvpfast默认值
NEXTAUTH_SALT="your_nextauth_salt" // mvpfast默认值
邮件服务（用于邮箱验证码登录）
MAIL_HOST=邮箱服务的 host
MAIL_PORT=邮箱服务的端口
MAIL_USER=邮箱服务的发出用户
MAIL_PASS=邮箱服务的发出用户的密码
短信服务（用于手机验证码登录）
ALIYUN_ACCESS_KEY_ID=阿里云账号 ACCESS_KEY
ALIYUN_ACCESS_KEY_SECRET=阿里云账号 SECRET_KEY
ALIYUN_SMS_SIGN_NAME=sms 服务签名
ALIYUN_SMS_TEMPLATE_CODE=sms 发送模板
微信登录（如需使用）
NEXT_PUBLIC_API_URL=支付回调地址 // 你的vercel部署域名
NEXT_PUBLIC_WECHAT_APPID=公众号id
WECHAT_MCHID=商家号
WECHAT_API_V3_KEY=v3支付私钥
WECHAT_SERIAL_NO=证书序列号
WECHAT_PRIVATE_KEY=证书密钥
```

请根据实际情况替换上述占位符。
