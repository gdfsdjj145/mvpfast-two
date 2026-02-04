---
name: init-admin
description: 创建管理员账号（需要数据库已配置）。用户说"创建管理员"、"添加管理员"、"init-admin"时使用。
author: MvpFast
user-invocable: true
---

# 创建管理员账号

## 触发场景

用户说"创建管理员"、"添加管理员"、"init-admin"等。

通常在完成基础初始化（`/init`）后，配置好数据库连接后使用。

---

## 前置检查

### 1. 检查数据库配置

```bash
grep "^DATABASE_URL=" .env 2>/dev/null | grep -v "example\|your-\|xxx"
```

如果未配置，提示：

```
⚠️ 数据库未配置

请先在 .env 文件中配置 DATABASE_URL：

DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
AUTH_SECRET="your-random-secret"  # 运行: openssl rand -base64 32
```

### 2. 检查 dev server

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null
```

如果返回非 200，提示用户运行 `pnpm dev`。

---

## 收集信息

使用 `AskUserQuestion` 收集：

**问题 1 — 管理员邮箱**（必填，文本输入）
- 验证: 邮箱格式

**问题 2 — 密码方式**（选项）：
| 选项 | 说明 |
|------|------|
| 生成强密码（推荐） | AI 生成 16 位随机密码 |
| 自定义密码 | 用户自行输入，≥6 位 |

如果用户选择「生成强密码」，生成规则：
- 16 个字符
- 包含大写、小写、数字、特殊字符（!@#$%^&*）
- 展示给用户并提示保存

---

## 执行

### 方式 1：通过 API（推荐）

```bash
curl -s -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"adminEmail":"<email>","adminPassword":"<password>"}'
```

### 方式 2：通过脚本（API 失败时）

```bash
npx tsx scripts/create-admin.ts <email> <password>
```

如果脚本报 `Cannot find module '@prisma/client'`，先运行：

```bash
pnpm prisma generate
```

---

## 完成

```
✅ 管理员账号创建成功！

邮箱: {email}
密码: {password}  ← 请妥善保存！

登录地址: http://localhost:3000/zh/auth/signin
后台地址: http://localhost:3000/zh/dashboard
```

---

## 错误处理

| 错误 | 处理 |
|-----|------|
| DATABASE_URL 未配置 | 提示配置 .env |
| dev server 未启动 | 提示 `pnpm dev` |
| 邮箱已存在 | 提示使用该邮箱登录或使用其他邮箱 |
| Prisma 客户端未生成 | 运行 `pnpm prisma generate` |
| 数据库连接失败 | 检查 DATABASE_URL 和网络 |
