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

## 环境变量配置

在项目根目录创建 `.env` 文件，添加以下环境变量：

```bash
env
数据库
DATABASE_URL="your_database_url"
NextAuth.js
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
邮件服务（用于邮箱验证码登录）
EMAIL_SERVER_HOST="your_email_server_host"
EMAIL_SERVER_PORT="your_email_server_port"
EMAIL_SERVER_USER="your_email_username"
EMAIL_SERVER_PASSWORD="your_email_password"
EMAIL_FROM="your_sender_email"
短信服务（用于手机验证码登录）
SMS_API_KEY="your_sms_api_key"
SMS_API_SECRET="your_sms_api_secret"
微信登录（如需使用）
WECHAT_APP_ID="your_wechat_app_id"
WECHAT_APP_SECRET="your_wechat_app_secret"
```

请根据实际情况替换上述占位符。
