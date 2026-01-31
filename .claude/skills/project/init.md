---
name: init
description: AI 引导式项目初始化（3 步完成）
author: MvpFast
---

# 项目初始化向导

## 触发场景

用户说"初始化项目"、"setup"、"init"、"创建管理员"等。

## 前置检查

确认 dev server 已启动：

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/admin/init 2>/dev/null
```

如果无法连接，提示用户先运行 `pnpm dev` 启动开发服务器。

---

## 对话流程（3 步）

### Step 1: 管理员账号

使用 `AskUserQuestion` 收集：

**问题 1 — 管理员邮箱**（必填，文本输入）

**问题 2 — 密码方式**（选项）：
| 选项 | 说明 |
|------|------|
| 自定义密码 | 用户自行输入，≥6 位 |
| 生成强密码（推荐） | AI 生成 16 位随机密码（大小写字母 + 数字 + 特殊字符） |

如果用户选择「生成强密码」，用以下规则生成：
- 16 个字符
- 包含大写、小写、数字、特殊字符（!@#$%^&*）
- 展示给用户并提示保存

如果用户选择「自定义密码」，追问密码内容，校验 ≥6 位。

### Step 2: 项目名称与主题色

使用 `AskUserQuestion` 收集：

**问题 1 — 项目名称**（文本输入）：
- 默认值: `MvpFast`
- 用于: 站点标题、i18n 内容、Logo 生成、系统配置
- 验证: 非空，≤30 字符

**问题 2 — 主题色**（选项）：
| 选项 | 色值 |
|------|------|
| 靛蓝色（推荐） | `#6366f1` |
| 翠绿色 | `#10b981` |
| 琥珀色 | `#f59e0b` |
| 玫红色 | `#f43f5e` |

主题色用于 DaisyUI 主色和 Logo 生成。用户也可选「Other」自定义 hex 色值。

### Step 3: 域名

使用 `AskUserQuestion` 收集：

**问题 — 生产环境域名**（文本输入）：
- 默认值: `example.com`
- 示例: `myproject.com`
- 用于: .env.production、sitemap、i18n 中的域名引用
- 无需输入 `https://` 前缀

如果用户不输入或选择默认，使用 `example.com`。

---

## 执行

收集完 3 步信息后，展示执行计划：

```
=== 初始化计划 ===
1. 管理员账号: {adminEmail} (role: admin)
2. 项目名称: {projectName}
3. 主题色: {color}
4. 域名: {domain}

将执行以下操作:
- 创建管理员账号并写入数据库
- 生成项目 Logo 和 Favicon (SVG)
- 修改 i18n 内容（header、footer、landing page）
- 创建 .env.development 和 .env.production
- 更新 DaisyUI 主题色
- 更新应用配置常量
- 标记系统初始化完成

确认执行？
```

使用 `AskUserQuestion` 让用户确认。

用户确认后，按顺序执行 3 个命令：

**1. 修改本地项目文件：**

```bash
npx tsx scripts/init-project.ts --name "<projectName>" --domain "<domain>" --color "<color>" --locale "zh"
```

修改内容：
- `.env.development` — `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `.env.production` — `NEXT_PUBLIC_SITE_URL=https://<domain>`
- `src/i18n/messages/zh.json` — 项目名替换、header 导航重置、footer 重置、FAQ 重置、案例清空
- `src/i18n/messages/en.json` — 同上英文版
- `src/app/(main)/globals.css` — DaisyUI 主题色 `--p`
- `src/constants/config.ts` — `APP_CONFIG.NAME`

**2. 生成 Logo：**

```bash
npx tsx scripts/generate-logo.ts --name "<projectName>" --color "<color>"
```

生成文件：
- `public/brand/logo.svg` — 方形图标 Logo
- `public/brand/title-logo.svg` — 横版 Logo（图标 + 文字）
- `public/favicons/favicon.svg` — SVG Favicon

**3. 创建管理员 + 系统配置（调用 API）：**

```bash
curl -s -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"projectName":"<projectName>","adminEmail":"<adminEmail>","adminPassword":"<password>","locale":"zh","domain":"<domain>"}'
```

---

## 完成

3 个命令全部成功后，展示结果：

```
项目初始化完成！

管理员账号: {adminEmail}
管理员密码: {password}  ← 请妥善保存
项目名称: {projectName}
域名: {domain}
主题色: {color}

已修改文件:
- .env.development / .env.production
- src/i18n/messages/zh.json / en.json
- src/app/(main)/globals.css
- src/constants/config.ts
- public/brand/logo.svg / title-logo.svg
- public/favicons/favicon.svg

后续步骤:
1. 访问登录页: http://localhost:3000/zh/auth/signin
2. 使用管理员邮箱和密码登录
3. 进入后台: http://localhost:3000/zh/dashboard
4. 编辑 i18n 文件自定义 landing page 内容
5. 替换 public/brand/ 下的 Logo 为正式设计稿（可选）
```

如果密码是自动生成的，特别强调提示用户保存密码。

---

## 错误处理

- **dev server 未启动**: 提示运行 `pnpm dev`
- **系统已初始化 (403)**: 告知用户已完成初始化，可直接登录。文件修改脚本仍可重复运行
- **参数不合法 (400)**: 提示具体错误，引导重新输入
- **数据库错误 (500)**: 建议检查 `.env` 中 `DATABASE_URL`
- **Logo/文件修改失败**: 不阻塞 API 初始化，提示用户手动运行脚本

## 独立使用

各脚本可单独运行，无需走完整初始化流程：

```bash
# 单独修改项目文件
npx tsx scripts/init-project.ts --name "MyProject" --domain "mysite.com" --color "#10b981"

# 单独生成 Logo
npx tsx scripts/generate-logo.ts --name "MyProject" --color "#10b981" --style geometric --shape hexagon
```
