---
name: check_env
description: 检查项目启动和部署所需的环境变量配置
author: MvpFast
---

# 环境变量检查指南

这个技能帮助检查 mvpfast-web 项目在不同场景下所需的环境变量配置。

---

## 快速检查命令

```bash
# 检查 .env 文件是否存在
ls -la .env

# 验证环境变量（开发时会抛出错误）
pnpm dev
```

---

## 最小启动配置（开发环境）

只需要 **2 个环境变量** 即可启动项目：

```env
# .env（最小配置）

# 1. 数据库连接（必需）
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/dbname"

# 2. NextAuth 密钥（必需）
# 生成命令: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret-key-here"
```

### 验证最小配置

```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env，只填写上面两个变量
# 然后启动
pnpm dev
```

**注意**: 开发环境下，`middleware.ts` 会跳过认证检查（`isDev = true`）。

---

## 功能模块所需变量

根据你需要启用的功能，添加对应的环境变量：

### 1. 基础登录功能

如果需要真实的登录功能（非开发模式免登录）：

```env
# NextAuth 完整配置
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SALT=""  # 可选
```

### 2. 手机验证码登录

需要阿里云短信服务：

```env
ALIYUN_ACCESS_KEY_ID="your-access-key-id"
ALIYUN_ACCESS_KEY_SECRET="your-access-key-secret"
ALIYUN_SMS_SIGN_NAME="你的短信签名"
ALIYUN_SMS_TEMPLATE_CODE="SMS_123456789"
```

### 3. 邮箱验证码登录

需要 SMTP 邮件服务：

```env
MAIL_HOST="smtp.qq.com"           # QQ邮箱
# MAIL_HOST="smtp.gmail.com"      # Gmail
# MAIL_HOST="smtp.163.com"        # 163邮箱
MAIL_PORT="465"                   # SSL: 465, TLS: 587
MAIL_USER="your-email@qq.com"
MAIL_PASS="your-smtp-password"    # 授权码，非登录密码
```

### 4. 微信扫码登录 & 微信支付

需要微信公众号/商户号：

```env
# 微信 AppID（公众号）
NEXT_PUBLIC_WECHAT_APPID="wx1234567890abcdef"

# 微信支付商户配置
WECHAT_MCHID="1234567890"
WECHAT_SERIAL_NO="证书序列号"
WECHAT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----"
```

### 5. 云购支付（替代微信支付）

更简单的支付集成方案：

```env
NEXT_PUBLIC_YUNGOUOS_MCH_ID="商户号"
NEXT_PUBLIC_YUNGOUOS_API_KEY="API密钥"
```

---

## 生产环境配置

### 必需变量

```env
# ========== 必需 ==========

# 数据库
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/prod-db"

# NextAuth
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://yourdomain.com"

# 网站 URL（用于 SEO、回调等）
NEXT_PUBLIC_API_URL="https://yourdomain.com"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

### 推荐变量

```env
# ========== 推荐 ==========

# SEO - Google 站点验证
GOOGLE_SITE_VERIFICATION="your-verification-code"

# 日志级别（生产环境建议 info 或 warn）
LOG_LEVEL="info"

# 数据加密密钥（不设置则使用 NEXTAUTH_SECRET）
ENCRYPTION_SECRET="another-secret-for-encryption"
```

### 功能模块（按需）

```env
# ========== 按需添加 ==========

# 登录方式（至少选一个）
# 手机验证码
ALIYUN_ACCESS_KEY_ID="..."
ALIYUN_ACCESS_KEY_SECRET="..."
ALIYUN_SMS_SIGN_NAME="..."
ALIYUN_SMS_TEMPLATE_CODE="..."

# 或 邮箱验证码
MAIL_HOST="..."
MAIL_PORT="..."
MAIL_USER="..."
MAIL_PASS="..."

# 或 微信扫码
NEXT_PUBLIC_WECHAT_APPID="..."

# 支付功能（选一个）
# 微信支付
WECHAT_MCHID="..."
WECHAT_SERIAL_NO="..."
WECHAT_PRIVATE_KEY="..."

# 或 云购支付
NEXT_PUBLIC_YUNGOUOS_MCH_ID="..."
NEXT_PUBLIC_YUNGOUOS_API_KEY="..."
```

---

## Vercel 部署配置

### 方式一：Vercel 控制台配置

1. 进入 Vercel 项目 → Settings → Environment Variables
2. 添加环境变量（注意选择 Production/Preview/Development）

### 方式二：Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 添加环境变量
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
# ... 其他变量

# 或者从 .env 文件导入
vercel env pull .env.production.local
```

### 方式三：vercel.json 配置

```json
{
  "env": {
    "NEXT_PUBLIC_SITE_URL": "https://yourdomain.com",
    "NEXT_PUBLIC_API_URL": "https://yourdomain.com"
  }
}
```

**注意**: 敏感变量（如 DATABASE_URL、SECRET）不要放在 vercel.json，应使用控制台或 CLI 添加。

### Vercel 环境变量分类

| 类型 | 作用域 | 说明 |
|------|--------|------|
| Production | 生产环境 | 正式域名访问时使用 |
| Preview | 预览环境 | PR 预览部署使用 |
| Development | 开发环境 | `vercel dev` 本地开发使用 |

### Vercel 生产环境完整配置示例

```
DATABASE_URL          = mongodb+srv://...         [Production]
NEXTAUTH_SECRET       = xxx                       [Production]
NEXTAUTH_URL          = https://yourdomain.com    [Production]
NEXT_PUBLIC_API_URL   = https://yourdomain.com    [Production]
NEXT_PUBLIC_SITE_URL  = https://yourdomain.com    [Production]

# 可选功能
ALIYUN_ACCESS_KEY_ID      = ...                   [Production]
ALIYUN_ACCESS_KEY_SECRET  = ...                   [Production]
ALIYUN_SMS_SIGN_NAME      = ...                   [Production]
ALIYUN_SMS_TEMPLATE_CODE  = ...                   [Production]
```

---

## 环境变量完整清单

### 服务器端变量（不暴露给客户端）

| 变量名 | 必需 | 描述 | 示例 |
|--------|------|------|------|
| `DATABASE_URL` | ✅ | MongoDB 连接字符串 | `mongodb+srv://...` |
| `NEXTAUTH_SECRET` | ✅ | Session 加密密钥 | 32位随机字符串 |
| `NEXTAUTH_URL` | 生产✅ | 网站基础 URL | `https://example.com` |
| `NEXTAUTH_SALT` | ❌ | Token 加密盐值 | - |
| `WECHAT_MCHID` | ❌ | 微信商户号 | `1234567890` |
| `WECHAT_SERIAL_NO` | ❌ | 微信证书序列号 | - |
| `WECHAT_PRIVATE_KEY` | ❌ | 微信 API 私钥 | PEM 格式 |
| `ALIYUN_ACCESS_KEY_ID` | ❌ | 阿里云 AK | - |
| `ALIYUN_ACCESS_KEY_SECRET` | ❌ | 阿里云 SK | - |
| `ALIYUN_SMS_SIGN_NAME` | ❌ | 短信签名 | `MvpFast` |
| `ALIYUN_SMS_TEMPLATE_CODE` | ❌ | 短信模板 | `SMS_123456` |
| `MAIL_HOST` | ❌ | SMTP 服务器 | `smtp.qq.com` |
| `MAIL_PORT` | ❌ | SMTP 端口 | `465` |
| `MAIL_USER` | ❌ | 邮箱账号 | - |
| `MAIL_PASS` | ❌ | 邮箱授权码 | - |
| `ENCRYPTION_SECRET` | ❌ | 数据加密密钥 | 32位随机字符串 |
| `LOG_LEVEL` | ❌ | 日志级别 | `info` |
| `GOOGLE_SITE_VERIFICATION` | ❌ | Google 验证 | - |

### 客户端变量（会暴露给浏览器）

| 变量名 | 必需 | 描述 | 示例 |
|--------|------|------|------|
| `NEXT_PUBLIC_API_URL` | 生产✅ | API 基础 URL | `https://example.com` |
| `NEXT_PUBLIC_SITE_URL` | 生产✅ | 网站 URL | `https://example.com` |
| `NEXT_PUBLIC_WECHAT_APPID` | ❌ | 微信 AppID | `wx1234...` |
| `NEXT_PUBLIC_YUNGOUOS_MCH_ID` | ❌ | 云购商户号 | - |
| `NEXT_PUBLIC_YUNGOUOS_API_KEY` | ❌ | 云购 API 密钥 | - |

---

## 检查脚本

项目内置了环境变量验证，位于 `src/lib/env.ts`：

```ts
import { serverEnv, clientEnv } from '@/lib/env';

// 检查功能是否可用
import {
  isWechatPayConfigured,
  isYungouPayConfigured,
  isSmsConfigured,
  isEmailConfigured
} from '@/lib/env';

if (isSmsConfigured()) {
  // 短信功能可用
}
```

### 手动验证命令

```bash
# 检查必需变量
node -e "
  const required = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error('缺少环境变量:', missing.join(', '));
    process.exit(1);
  }
  console.log('✅ 必需变量检查通过');
"
```

---

## 常见问题

### Q: 开发环境必须配置登录相关变量吗？

**A**: 不需要。开发环境会跳过认证检查，可以直接访问 `/dashboard` 等受保护页面。

### Q: NEXT_PUBLIC_ 前缀有什么用？

**A**: 带此前缀的变量会被打包到客户端 JS 中，可在浏览器访问。**不要用于敏感信息**。

### Q: Vercel 部署时变量没生效？

**A**:
1. 确认添加到了正确的环境（Production/Preview）
2. 重新部署（变量修改后需要重新部署）
3. 检查变量名是否正确（区分大小写）

### Q: 如何生成 NEXTAUTH_SECRET？

**A**:
```bash
openssl rand -base64 32
# 或
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Q: 微信私钥格式怎么填？

**A**: 将换行符替换为 `\n`：
```
原始:
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkq...
-----END PRIVATE KEY-----

env 格式:
WECHAT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...\n-----END PRIVATE KEY-----"
```

---

## 快速复制模板

### 开发环境最小配置

```env
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/dev"
NEXTAUTH_SECRET="dev-secret-change-in-production"
```

### 生产环境基础配置

```env
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/prod"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_API_URL="https://yourdomain.com"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

### 生产环境完整配置（带短信登录）

```env
# 基础
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/prod"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_API_URL="https://yourdomain.com"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"

# 短信登录
ALIYUN_ACCESS_KEY_ID="your-key-id"
ALIYUN_ACCESS_KEY_SECRET="your-key-secret"
ALIYUN_SMS_SIGN_NAME="YourApp"
ALIYUN_SMS_TEMPLATE_CODE="SMS_123456789"

# SEO
GOOGLE_SITE_VERIFICATION="your-verification-code"

# 日志
LOG_LEVEL="info"
```
