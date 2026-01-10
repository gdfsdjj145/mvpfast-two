---
name: wechat-login
description: 指导 AI 如何在 mvpfast-web 项目中实现和修改微信登录功能
author: MvpFast
---

# 微信登录实现指南

这个技能指导 AI 理解和修改项目中的微信登录功能，包括 PC 端扫码登录和移动端快捷登录。

---

## 快速理解

当用户说类似以下需求时，使用本技能：
- "修改微信登录"
- "微信扫码登录不工作"
- "添加微信登录功能"
- "优化登录页面"

---

## 登录方式概览

```
┌─────────────────────────────────────────────────────────────┐
│                      登录方式                                │
├─────────────────┬─────────────────┬─────────────────────────┤
│   PC端扫码       │   移动端微信     │   手机/邮箱验证码        │
│   (WxLogin SDK) │   (公众号OAuth)  │   (credentials)        │
└────────┬────────┴────────┬────────┴────────┬────────────────┘
         │                 │                 │
         ▼                 ▼                 ▼
    微信开放平台        微信公众号          阿里云短信/邮件
         │                 │                 │
         └────────────────┬┴─────────────────┘
                          ▼
                    NextAuth JWT
                          │
                          ▼
                   Session Cookie
```

---

## 核心文件结构

```
src/
├── auth.ts                              # NextAuth 配置
├── components/
│   └── weChat/
│       ├── WeChatPc.tsx                 # PC端扫码组件 (WxLogin SDK)
│       └── WeChatMobile.tsx             # 移动端登录按钮
├── app/
│   ├── [local]/auth/signin/
│   │   ├── page.tsx                     # 登录页面
│   │   └── actions.ts                   # Server Actions
│   └── api/wx/
│       └── callback/route.ts            # 微信回调处理
├── lib/
│   └── prisma.ts                        # 数据库客户端
└── models/
    └── user.ts                          # 用户模型操作

public/
└── css/
    └── wxlogin.css                      # 微信二维码自定义样式

prisma/
└── schema.prisma                        # User 模型定义
```

---

## PC端扫码登录流程

### 流程图

```
用户访问登录页 → WeChatPc 组件加载
        │
        ▼
加载微信 WxLogin SDK
        │
        ▼
生成二维码 (带 state=open_xxx)
        │
        ▼
用户扫码确认
        │
        ▼
微信重定向到 /api/wx/callback?code=xxx&state=open_xxx
        │
        ▼
服务端用 code 换取 access_token
        │
        ▼
获取用户信息 (openid, unionid, nickname, headimgurl)
        │
        ▼
查找或创建用户
        │
        ▼
生成 JWT 并设置 Cookie
        │
        ▼
重定向到首页 (已登录)
```

### 1. 前端组件 - WeChatPc.tsx

**位置**: `src/components/weChat/WeChatPc.tsx`

```tsx
'use client';
import React, { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    WxLogin: new (config: {
      self_redirect?: boolean;
      id: string;
      appid: string;
      scope: string;
      redirect_uri: string;
      state?: string;
      style?: 'black' | 'white';
      href?: string;
      fast_login?: boolean;
      onReady?: (isReady: boolean) => void;
    }) => void;
  }
}

const WeChatPc = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateState = () => {
      return Math.random().toString(36).substring(2, 15) +
             Math.random().toString(36).substring(2, 15);
    };

    const initWxLogin = () => {
      const appid = process.env.NEXT_PUBLIC_WECHAT_OPEN_APPID;
      const domain = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const redirectUri = encodeURIComponent(`${domain}/api/wx/callback`);
      const state = `open_${generateState()}`; // 关键：open_ 前缀区分开放平台

      new window.WxLogin({
        self_redirect: false,
        id: 'wx_login_container',
        appid: appid || '',
        scope: 'snsapi_login',
        redirect_uri: redirectUri,
        state: state,
        style: 'black',
        href: '/css/wxlogin.css',
        onReady: (isReady) => setLoading(!isReady),
      });
    };

    // 加载 SDK
    const script = document.createElement('script');
    script.src = 'https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js';
    script.onload = initWxLogin;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="relative min-h-[200px]">
      {loading && <div>加载中...</div>}
      <div id="wx_login_container" className="flex justify-center" />
    </div>
  );
};
```

### 2. 自定义样式 - wxlogin.css

**位置**: `public/css/wxlogin.css`

```css
.impowerBox .qrcode {
  width: 120px;
  margin: 0 auto;
}
.impowerBox .title {
  display: none;
}
.impowerBox .info {
  width: 120px;
  margin: 0 auto;
}
.status_icon {
  display: none;
}
.impowerBox .status {
  text-align: center;
}
```

### 3. 回调处理 - callback/route.ts

**位置**: `src/app/api/wx/callback/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  // 通过 state 前缀区分登录方式
  const isOpenPlatform = state?.startsWith('open_');

  if (isOpenPlatform) {
    // 1. 用 code 换取 access_token
    const tokenData = await getWechatOpenAccessToken(code);
    const { access_token, openid, unionid } = tokenData;

    // 2. 获取用户信息
    const userInfo = await getWechatUserInfo(access_token, openid);
    const { nickname, headimgurl } = userInfo;

    // 3. 查找或创建用户
    let user = await prisma.user.findFirst({
      where: { wechatUnionId: unionid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          wechatOpenId: openid,
          wechatUnionId: unionid,
          nickName: nickname,
          avatar: headimgurl,
        },
      });
    }

    // 4. 生成 JWT
    const token = await encode({
      token: { sub: user.id, ... },
      secret: process.env.NEXTAUTH_SECRET!,
      salt: 'next-auth.session-token',
    });

    // 5. 设置 Cookie 并重定向
    const response = NextResponse.redirect(new URL('/', request.nextUrl.origin));
    response.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60,
    });

    return response;
  }

  // 公众号登录流程...
}
```

---

## 数据库模型

**位置**: `prisma/schema.prisma`

```prisma
model User {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  avatar        String?
  created_time  DateTime @db.Date @default(now())
  email         String?
  nickName      String
  phone         String?
  wechatOpenId  String?
  wechatUnionId String?  // 用于跨应用用户关联

  @@unique([wechatOpenId, phone, email])
}
```

---

## NextAuth 配置

**位置**: `src/auth.ts`

```ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      phone?: string | null;
      wechatOpenId?: string | null;
      wechatUnionId?: string | null;
      nickName?: string | null;
      avatar?: string | null;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'credentials',
      async authorize(credentials) {
        const { identifier, code, type } = credentials;

        if (type === 'wx') {
          // 微信登录：通过 openId 查找用户
          return prisma.user.findFirst({
            where: { wechatOpenId: identifier },
          });
        }

        // 手机/邮箱验证码登录...
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 2 * 60 * 60, // 2小时
  },
  callbacks: {
    async session({ token, session }) {
      // 从数据库获取最新用户信息
      const user = await prisma.user.findUnique({
        where: { id: token.sub },
      });
      if (user) {
        session.user = { ...user };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.wechatOpenId = user.wechatOpenId;
        token.wechatUnionId = user.wechatUnionId;
      }
      return token;
    },
  },
});
```

---

## 环境变量

```bash
# 网站域名 (用于回调地址)
NEXT_PUBLIC_SITE_URL=https://www.example.com

# 微信开放平台配置 (PC端扫码登录)
NEXT_PUBLIC_WECHAT_OPEN_APPID=wxxxxxxxxxxx
WECHAT_OPEN_APPID=wxxxxxxxxxxx
WECHAT_OPEN_APPSECRET=xxxxxxxxxxxxxxxx

# 微信公众号配置 (移动端登录)
NEXT_PUBLIC_WECHAT_APPID=wxxxxxxxxxxx

# NextAuth 配置
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://www.example.com
```

---

## WxLogin SDK 参数说明

| 参数 | 必须 | 说明 |
|------|------|------|
| `self_redirect` | 否 | `true`: iframe内跳转, `false`: 顶层窗口跳转 |
| `id` | 是 | 二维码容器 ID |
| `appid` | 是 | 微信开放平台 AppID |
| `scope` | 是 | 授权作用域，填 `snsapi_login` |
| `redirect_uri` | 是 | 回调地址，需 URL 编码 |
| `state` | 否 | 防 CSRF 攻击参数 |
| `style` | 否 | `black` 或 `white` |
| `href` | 否 | 自定义样式 CSS 文件链接 (必须 HTTPS) |
| `fast_login` | 否 | 设为 `0` 禁用快速登录 |
| `onReady` | 否 | 加载完成回调 |

---

## 常见问题排查

### 二维码不显示

1. 检查 `NEXT_PUBLIC_WECHAT_OPEN_APPID` 是否配置
2. 确认开放平台应用已通过审核
3. 检查回调域名是否与开放平台配置一致

### 扫码后无法登录

1. 检查 `state` 参数是否正确传递
2. 确认 `WECHAT_OPEN_APPSECRET` 配置正确
3. 查看服务器日志中的错误信息

### 用户信息获取失败

1. 确认 access_token 未过期
2. 检查 unionid 是否需要绑定开放平台

---

## 修改检查清单

修改登录功能时，检查以下文件：

- [ ] `src/components/weChat/WeChatPc.tsx` - PC端组件
- [ ] `src/components/weChat/WeChatMobile.tsx` - 移动端组件
- [ ] `src/app/api/wx/callback/route.ts` - 回调处理
- [ ] `src/auth.ts` - NextAuth 配置
- [ ] `prisma/schema.prisma` - User 模型
- [ ] `public/css/wxlogin.css` - 二维码样式
- [ ] `.env` - 环境变量配置
