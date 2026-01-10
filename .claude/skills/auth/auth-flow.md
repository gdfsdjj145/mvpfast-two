---
name: auth-flow
description: 指导 AI 理解和修改 mvpfast-web 项目的完整登录认证流程
author: MvpFast
---

# 登录认证流程指南

这个技能指导 AI 理解项目的完整登录认证系统，包括多种登录方式和 NextAuth 集成。

---

## 快速理解

当用户说类似以下需求时，使用本技能：
- "修改登录流程"
- "添加新的登录方式"
- "登录页面样式调整"
- "Session 相关问题"
- "用户认证问题"

---

## 支持的登录方式

| 登录方式 | 适用场景 | 实现方式 |
|---------|---------|---------|
| 微信扫码 | PC 端 | WxLogin SDK + 开放平台 |
| 微信快捷登录 | 移动端 | 公众号 OAuth |
| 手机验证码 | 通用 | 阿里云短信 |
| 邮箱验证码 | 通用 | SMTP 邮件 |

---

## 核心文件

```
src/
├── auth.ts                              # ⭐ NextAuth 主配置
├── middleware.ts                        # 路由保护中间件
├── components/
│   └── weChat/
│       ├── WeChatPc.tsx                 # PC端微信扫码
│       └── WeChatMobile.tsx             # 移动端微信登录
├── app/
│   ├── [local]/auth/signin/
│   │   ├── page.tsx                     # ⭐ 登录页面
│   │   └── actions.ts                   # 验证码发送/校验
│   └── api/
│       ├── auth/[...nextauth]/route.ts  # NextAuth API
│       └── wx/callback/route.ts         # 微信回调
├── config/index.ts                      # 登录方式配置
└── lib/
    ├── prisma.ts                        # 数据库
    └── sms.ts                           # 短信服务

prisma/schema.prisma                     # User 模型
```

---

## 登录页面配置

**位置**: `src/config/index.ts`

```ts
export const config = {
  loginType: 'wx',                    // 默认登录方式
  loginTypes: ['wx', 'phone', 'email'], // 可用的登录方式
};
```

---

## 登录页面结构

**位置**: `src/app/[local]/auth/signin/page.tsx`

```tsx
'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import WxChatPc from '@/components/weChat/WeChatPc';
import WeChatMobile from '@/components/weChat/WeChatMobile';

// 登录方式标签
const LOGIN_HASH = {
  wx: '💬 微信登录',
  phone: '📱 手机登录',
  email: '📫 邮箱登录',
};

// 微信登录组件 - 自动检测设备
const WeChatLogin = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => setIsMobile(window.innerWidth < 768);
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (isMobile) {
    return (
      <div className="text-center py-4">
        <WeChatMobile />
        <p className="mt-4 text-sm text-gray-500">点击按钮后跳转微信</p>
      </div>
    );
  }

  return <WxChatPc />; // SDK 自带提示文字
};

export default function SignInPage() {
  const [type, setType] = useState(config.loginType);
  const [form, setForm] = useState({ identifier: '', code: '' });

  const handleLogin = async () => {
    const res = await signIn('credentials', {
      type,
      ...form,
      redirect: false,
    });
    // 处理登录结果...
  };

  return (
    <div>
      {/* 微信登录 */}
      {type === 'wx' && <WeChatLogin />}

      {/* 手机/邮箱验证码登录 */}
      {type !== 'wx' && (
        <form>
          <input placeholder={type === 'email' ? '邮箱' : '手机号'} />
          <input placeholder="验证码" />
          <button onClick={handleLogin}>登录</button>
        </form>
      )}

      {/* 切换登录方式 */}
      <div className="flex gap-4">
        {config.loginTypes.map((item) => (
          type !== item && (
            <button onClick={() => setType(item)}>
              {LOGIN_HASH[item]}
            </button>
          )
        ))}
      </div>
    </div>
  );
}
```

---

## 验证码 Server Actions

**位置**: `src/app/[local]/auth/signin/actions.ts`

```ts
'use server';
import prisma from '@/lib/prisma';
import { sendSms } from '@/lib/sms';
import { sendMail } from '@/lib/mail';

// 发送验证码
export async function sendCode(
  type: string,
  params: { identifier: string }
) {
  const code = Math.random().toString().slice(2, 8); // 6位数字
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5分钟过期

  // 存储验证码
  await prisma.verificationCode.create({
    data: {
      identifier: params.identifier,
      code,
      expires_at: expires,
    },
  });

  // 发送验证码
  if (type === 'phone') {
    await sendSms(params.identifier, code);
  } else if (type === 'email') {
    await sendMail(params.identifier, '登录验证码', `您的验证码是: ${code}`);
  }

  return { message: '验证码已发送' };
}

// 验证码校验
export async function verifyCode(
  type: string,
  params: { identifier: string; code: string }
) {
  if (type === 'wx') return true; // 微信登录不需要验证码

  const record = await prisma.verificationCode.findFirst({
    where: {
      identifier: params.identifier,
      code: params.code,
      expires_at: { gte: new Date() },
    },
    orderBy: { created_time: 'desc' },
  });

  return !!record;
}
```

---

## NextAuth 配置

**位置**: `src/auth.ts`

```ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyCode } from './app/[local]/auth/signin/actions';
import prisma from './lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'credentials',
      async authorize(credentials) {
        const { identifier, code, type } = credentials;

        // 微信登录
        if (type === 'wx') {
          return prisma.user.findFirst({
            where: { wechatOpenId: identifier },
          });
        }

        // 验证码登录
        const isValid = await verifyCode(type, { identifier, code });
        if (!isValid) return null;

        // 查找或创建用户
        const whereField = type === 'email' ? 'email' : 'phone';
        let user = await prisma.user.findFirst({
          where: { [whereField]: identifier },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              [whereField]: identifier,
              nickName: generateRandomName(),
            },
          });
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 2 * 60 * 60, // 2小时
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async session({ token, session }) {
      const user = await prisma.user.findUnique({
        where: { id: token.sub },
      });
      if (user) {
        session.user = {
          id: user.id,
          email: user.email,
          phone: user.phone,
          wechatOpenId: user.wechatOpenId,
          wechatUnionId: user.wechatUnionId,
          nickName: user.nickName,
          avatar: user.avatar,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});
```

---

## User 数据模型

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
  wechatUnionId String?

  @@unique([wechatOpenId, phone, email])
}

model VerificationCode {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  code         String
  created_time DateTime @db.Date @default(now())
  identifier   String
  expires_at   DateTime @db.Date
}
```

---

## 环境变量

```bash
# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://www.example.com
NEXT_PUBLIC_SITE_URL=https://www.example.com

# 微信开放平台 (PC端扫码)
NEXT_PUBLIC_WECHAT_OPEN_APPID=wxxxxxxxxxxx
WECHAT_OPEN_APPID=wxxxxxxxxxxx
WECHAT_OPEN_APPSECRET=xxxxxxxxxxxxxxxx

# 微信公众号 (移动端)
NEXT_PUBLIC_WECHAT_APPID=wxxxxxxxxxxx

# 阿里云短信
ALIYUN_ACCESS_KEY_ID=your-key-id
ALIYUN_ACCESS_KEY_SECRET=your-key-secret
ALIYUN_SMS_SIGN_NAME=签名名称
ALIYUN_SMS_TEMPLATE_CODE=SMS_xxxxxxxx

# 邮件
MAIL_HOST=smtp.example.com
MAIL_PORT=465
MAIL_USER=user@example.com
MAIL_PASS=password
```

---

## 获取当前用户

### 服务端

```ts
import { auth } from '@/auth';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return <div>欢迎, {session.user.nickName}</div>;
}
```

### 客户端

```tsx
'use client';
import { useSession } from 'next-auth/react';

export function UserInfo() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>加载中...</div>;
  if (!session) return <div>未登录</div>;

  return <div>欢迎, {session.user.nickName}</div>;
}
```

### API 路由

```ts
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  // 处理请求...
}
```

---

## 登出

```tsx
import { signOut } from 'next-auth/react';

<button onClick={() => signOut({ callbackUrl: '/' })}>
  退出登录
</button>
```

---

## 添加新登录方式

1. 在 `config.loginTypes` 添加新类型
2. 在 `LOGIN_HASH` 添加显示文字
3. 在 `auth.ts` 的 `authorize` 函数添加处理逻辑
4. 如需要，创建对应的验证/发送逻辑

---

## 修改检查清单

- [ ] `src/config/index.ts` - 登录方式配置
- [ ] `src/app/[local]/auth/signin/page.tsx` - 登录页面
- [ ] `src/app/[local]/auth/signin/actions.ts` - 验证码逻辑
- [ ] `src/auth.ts` - NextAuth 配置
- [ ] `src/components/weChat/` - 微信组件
- [ ] `prisma/schema.prisma` - 用户模型
- [ ] `.env` - 环境变量
