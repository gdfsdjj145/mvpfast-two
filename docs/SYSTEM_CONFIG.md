# 系统配置管理使用说明

## 概述

系统配置管理功能允许管理员通过 Web 界面动态修改系统配置，无需重启服务器。配置存储在数据库中，支持缓存和审计日志。

## 快速开始

### 1. 运行数据库迁移

首先运行 Prisma 迁移以创建新的数据表：

```bash
npx prisma generate
```

### 2. 迁移现有配置

将 `src/config.ts` 中的静态配置迁移到数据库：

```bash
npx tsx scripts/migrate-config.ts
```

### 3. 创建管理员账号

使用邮箱或手机号创建管理员：

```bash
# 使用邮箱
npx tsx scripts/create-admin.ts admin@example.com

# 使用手机号
npx tsx scripts/create-admin.ts 13800138000
```

### 4. 登录并访问系统配置

1. 使用管理员账号登录系统
2. 访问 Dashboard → 系统管理 → 系统配置
3. 在此页面可以查看、编辑、新增和删除配置

## 配置类型

### 配置分类

- **system**: 系统配置（数据库开关等）
- **auth**: 认证配置（登录方式等）
- **payment**: 支付配置（支付方式等）
- **product**: 商品配置（商品信息等）

### 配置数据类型

- **boolean**: 布尔值 (true/false)
- **string**: 字符串
- **array**: 数组（JSON 格式）
- **object**: 对象（JSON 格式）

## 现有配置项

| 配置键 | 类型 | 分类 | 说明 |
|--------|------|------|------|
| `system.db` | boolean | system | 是否开启数据库功能 |
| `auth.loginType` | string | auth | 默认登录方式 |
| `auth.loginTypes` | array | auth | 可用登录方式列表 |
| `payment.methods` | array | payment | 支付方式配置 |
| `product.goods` | array | product | 商品配置 |

## 权限说明

### 角色类型

- **user**: 普通用户（默认）
- **admin**: 系统管理员（可访问系统配置）
- **superadmin**: 超级管理员（预留）

### 权限验证

系统在三个层面进行权限验证：

1. **中间件层** (`src/middleware.ts`): 拦截非管理员访问管理页面
2. **API 层** (`src/lib/auth-utils.ts`): 验证 API 调用者权限
3. **页面层**: UI 显示权限提示

**开发环境**: 所有权限检查自动通过，方便开发调试

## 配置缓存

### 缓存机制

- **TTL**: 5 分钟
- **策略**: 首次访问从数据库加载，后续访问使用缓存
- **更新**: 配置修改后自动清除缓存

### 性能优化

- 减少数据库查询
- 数据库失败时降级到默认配置
- 支持未来升级到 Redis 缓存

## 审计日志

每次配置修改都会记录：

- 修改时间
- 修改人
- 旧值和新值
- 操作类型（创建/更新/删除）
- IP 地址和 User Agent

可在配置详情页查看历史记录。

## API 使用

### 获取配置列表

```typescript
GET /api/admin/configs?category=system&skip=0&take=10
```

### 创建/更新配置

```typescript
POST /api/admin/configs
{
  "key": "system.newConfig",
  "value": true,
  "type": "boolean",
  "category": "system",
  "description": "新配置项"
}
```

### 获取单个配置

```typescript
GET /api/admin/configs/system.db
```

### 删除配置

```typescript
DELETE /api/admin/configs/system.db
```

## 向后兼容性

现有代码无需修改：

```typescript
// 静态导入（向后兼容）
import { config } from '@/config';
console.log(config.db); // 使用默认值

// 动态获取（推荐）
import { getConfigObject } from '@/lib/config-service';
const dynamicConfig = await getConfigObject();
console.log(dynamicConfig.db); // 使用数据库配置
```

## 故障降级

当数据库不可用时：

1. 系统自动使用 `src/config.ts` 中的默认值
2. 记录错误日志
3. 不影响系统正常运行

## 常见问题

### Q: 修改配置后多久生效？

A: 最多 5 分钟（缓存 TTL）。如需立即生效，请重启服务器。

### Q: 如何备份配置？

A: 配置存储在 `SystemConfig` 表中，随数据库一起备份。

### Q: 删除的配置能恢复吗？

A: 删除是软删除（设置 `isActive: false`），可在数据库中恢复。

### Q: 开发环境如何测试权限？

A: 设置 `NODE_ENV=production` 或在代码中临时关闭开发模式检查。

## 文件结构

```
src/
├── models/
│   ├── systemConfig.ts          # 配置数据操作
│   └── configAuditLog.ts        # 审计日志操作
├── lib/
│   ├── config-service.ts        # 配置服务（带缓存）
│   └── auth-utils.ts            # 权限验证工具
├── app/(main)/
│   ├── api/admin/configs/       # API 路由
│   │   ├── route.ts
│   │   └── [key]/route.ts
│   └── [local]/
│       ├── dashboard/settings/system/  # 管理页面
│       │   └── page.tsx
│       └── 403/                 # 无权限页面
│           └── page.tsx
└── config.ts                    # 默认配置（向后兼容）

scripts/
├── migrate-config.ts            # 配置迁移脚本
└── create-admin.ts              # 管理员创建脚本

prisma/
└── schema.prisma                # 数据库模型
    ├── User (增加 role 字段)
    ├── SystemConfig
    └── ConfigAuditLog
```

## 技术亮点

- ✅ 三层权限验证
- ✅ 完整审计日志
- ✅ 5 分钟缓存机制
- ✅ 向后兼容设计
- ✅ 故障自动降级
- ✅ 开发环境友好
- ✅ TypeScript 类型安全
- ✅ DaisyUI 精美界面

## 下一步优化

- [ ] 升级到 Redis 缓存
- [ ] 添加配置版本控制
- [ ] 支持配置导入/导出
- [ ] 添加配置变更通知
- [ ] 支持配置回滚
