This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制环境变量示例文件并填写配置：

```bash
cp .env.example .env
```

#### 必需配置

| 变量名 | 说明 |
|--------|------|
| `DATABASE_URL` | MongoDB 连接字符串 |
| `NEXTAUTH_SECRET` | NextAuth 加密密钥 (生成: `openssl rand -base64 32`) |

#### 可选配置

根据需要的功能配置对应的环境变量：

- **微信支付**: `NEXT_PUBLIC_WECHAT_APPID`, `WECHAT_MCHID`, `WECHAT_SERIAL_NO`, `WECHAT_PRIVATE_KEY`
- **云购支付**: `NEXT_PUBLIC_YUNGOUOS_MCH_ID`, `NEXT_PUBLIC_YUNGOUOS_API_KEY`
- **阿里云短信**: `ALIYUN_ACCESS_KEY_ID`, `ALIYUN_ACCESS_KEY_SECRET`, `ALIYUN_SMS_SIGN_NAME`, `ALIYUN_SMS_TEMPLATE_CODE`
- **邮件服务**: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`

详细配置说明请参考 `.env.example` 文件。

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 常用命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 生产构建
pnpm lint         # 代码检查
pnpm test         # 运行测试 (监视模式)
pnpm test:run     # 运行一次测试
pnpm test:coverage # 测试覆盖率报告
```

## 环境变量验证

项目使用 Zod 进行环境变量校验，启动时会自动验证必需配置：

```typescript
import { serverEnv, clientEnv, isWechatPayConfigured } from '@/lib/env';

// 服务器端环境变量
const dbUrl = serverEnv.DATABASE_URL;

// 客户端环境变量
const apiUrl = clientEnv.NEXT_PUBLIC_API_URL;

// 检查功能是否配置
if (isWechatPayConfigured()) {
  // 微信支付已配置
}
```

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **UI**: React 19, Tailwind CSS 4, DaisyUI 5
- **数据库**: MongoDB + Prisma
- **认证**: NextAuth 5
- **国际化**: next-intl
- **测试**: Vitest

## 部署

### Vercel 部署 (推荐)

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署

详细部署说明请参考 [Next.js 部署文档](https://nextjs.org/docs/deployment)。

### Docker 部署

#### 快速开始

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置必要的环境变量

# 2. 启动所有服务 (应用 + MongoDB)
pnpm docker:up

# 3. 查看日志
pnpm docker:logs

# 4. 停止服务
pnpm docker:down
```

#### Docker 命令

```bash
pnpm docker:build    # 构建 Docker 镜像
pnpm docker:run      # 运行单独容器
pnpm docker:up       # 启动所有服务
pnpm docker:down     # 停止所有服务
pnpm docker:logs     # 查看服务日志
pnpm docker:rebuild  # 重新构建并启动
```

#### 单独构建镜像

```bash
# 构建镜像
docker build -t mvpfast-web .

# 运行容器
docker run -p 3000:3000 --env-file .env mvpfast-web
```

#### docker-compose.yml 配置

默认服务包括：
- **app**: Next.js 应用 (端口 3000)
- **mongo**: MongoDB 数据库 (端口 27017)
- **mongo-express**: 数据库管理界面 (可选，端口 8081)

启用 mongo-express：
```bash
docker compose --profile tools up -d
```

#### 环境变量说明

在 `.env` 文件中配置以下 Docker 相关变量：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | 3000 | 应用端口 |
| `MONGO_PORT` | 27017 | MongoDB 端口 |
| `MONGO_ROOT_USERNAME` | admin | MongoDB 管理员用户名 |
| `MONGO_ROOT_PASSWORD` | password | MongoDB 管理员密码 |
| `MONGO_DATABASE` | mvpfast | 数据库名称 |

#### 健康检查

应用提供健康检查端点：
```bash
curl http://localhost:3000/api/health
```

返回：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "version": "1.0.0",
  "checks": {
    "database": "ok"
  }
}
```

#### 生产部署建议

1. 使用外部 MongoDB 服务（如 MongoDB Atlas）而非容器内数据库
2. 配置反向代理（Nginx/Traefik）处理 SSL/TLS
3. 设置适当的资源限制
4. 配置日志收集（如 ELK Stack）
5. 使用 Docker Swarm 或 Kubernetes 进行编排
