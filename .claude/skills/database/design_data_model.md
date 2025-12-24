---
name: design_data_model
description: 根据自然语言业务描述，反推数据模型并生成 Prisma Schema
author: MvpFast
---

# 数据模型设计技能

这个技能帮助 AI 从用户的自然语言业务描述中，反推数据模型设计，输出表结构、关系说明和可直接使用的 Prisma Schema。

---

## 使用场景

当用户描述类似以下需求时使用此技能：
- "我要做一个订阅制工具，有用户、套餐、支付记录"
- "帮我设计一个博客系统的数据库"
- "我需要一个电商的商品和订单模型"

---

## 分析流程

```
用户业务描述
      ↓
1. 识别核心实体（名词）
      ↓
2. 分析实体属性
      ↓
3. 推断实体关系
      ↓
4. 生成 Schema + Model 层代码
```

---

## 第一步：识别实体

从描述中提取 **名词** 作为潜在实体：

| 业务描述 | 识别的实体 |
|----------|-----------|
| "订阅制工具，有用户、套餐、支付记录" | User, Plan, Payment |
| "博客系统" | User, Post, Category, Tag, Comment |
| "电商商品和订单" | User, Product, Order, OrderItem |

---

## 第二步：分析属性

### 通用字段（每个模型必备）

```prisma
id           String   @id @default(auto()) @map("_id") @db.ObjectId
created_time DateTime @db.Date @default(now())
updated_time DateTime @db.Date @updatedAt    // 可选
```

### 常见业务字段推断

| 实体类型 | 常见字段 |
|----------|---------|
| 用户 User | nickName, email, phone, avatar, status |
| 套餐 Plan | name, description, price, duration, features |
| 订单 Order | orderNo, status, amount, paymentMethod |
| 支付 Payment | transactionId, amount, status, paidAt |
| 商品 Product | name, description, price, stock, images |
| 文章 Post | title, content, status, publishedAt |
| 分类 Category | name, slug, parentId |
| 评论 Comment | content, authorId, postId |

---

## 第三步：推断关系

### MongoDB 关系类型

#### 1. 一对一 (1:1)
```prisma
// 用户 - 用户详情
model User {
  id        String       @id @default(auto()) @map("_id") @db.ObjectId
  profileId String?      @db.ObjectId @unique
  profile   UserProfile? @relation(fields: [profileId], references: [id])
}

model UserProfile {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  bio    String?
  user   User?
}
```

#### 2. 一对多 (1:N)
```prisma
// 用户 - 订单（一个用户有多个订单）
model User {
  id     String  @id @default(auto()) @map("_id") @db.ObjectId
  orders Order[]
}

model Order {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @db.ObjectId
  user   User   @relation(fields: [userId], references: [id])
}
```

#### 3. 多对多 (M:N)
```prisma
// 文章 - 标签（多对多）
model Post {
  id     String   @id @default(auto()) @map("_id") @db.ObjectId
  tagIds String[] @db.ObjectId
  tags   Tag[]    @relation(fields: [tagIds], references: [id])
}

model Tag {
  id      String   @id @default(auto()) @map("_id") @db.ObjectId
  postIds String[] @db.ObjectId
  posts   Post[]   @relation(fields: [postIds], references: [id])
}
```

#### 4. 自引用关系
```prisma
// 分类树形结构
model Category {
  id       String     @id @default(auto()) @map("_id") @db.ObjectId
  name     String
  parentId String?    @db.ObjectId
  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  children Category[] @relation("CategoryTree")
}
```

---

## 第四步：输出格式

### 输出模板

当用户描述业务需求后，按以下格式输出：

````markdown
## 数据模型设计

### 实体识别

从您的描述中识别到以下实体：
- **实体1**: 说明
- **实体2**: 说明

### 关系说明

```
实体1 ──1:N──> 实体2   // 一个实体1有多个实体2
实体2 ──N:1──> 实体3   // 多个实体2属于一个实体3
实体1 <──M:N──> 实体4  // 实体1和实体4多对多
```

### ER 图（文字版）

```
┌─────────────┐       ┌─────────────┐
│    User     │       │    Plan     │
├─────────────┤       ├─────────────┤
│ id          │       │ id          │
│ nickName    │       │ name        │
│ email       │──1:N──│ price       │
│ planId ─────│───────│ duration    │
└─────────────┘       └─────────────┘
        │
        │ 1:N
        ▼
┌─────────────┐
│   Payment   │
├─────────────┤
│ id          │
│ userId      │
│ amount      │
└─────────────┘
```

### Prisma Schema

```prisma
// 复制到 prisma/schema.prisma

model ModelName {
  // 字段定义
}
```

### Model 层代码

```typescript
// 复制到 src/models/xxx.ts
```
````

---

## 完整示例

### 用户输入

> "我要做一个订阅制工具，有用户、套餐、支付记录"

### AI 输出

---

## 数据模型设计：订阅制工具

### 实体识别

从您的描述中识别到以下核心实体：

| 实体 | 说明 | 核心字段 |
|------|------|---------|
| **User** | 用户 | 基础信息、当前订阅状态 |
| **Plan** | 套餐/订阅计划 | 名称、价格、时长、权益 |
| **Subscription** | 订阅记录 | 用户与套餐的关联、有效期 |
| **Payment** | 支付记录 | 支付信息、交易状态 |

### 关系说明

```
User ──1:N──> Subscription   // 一个用户可以有多条订阅记录（历史）
Plan ──1:N──> Subscription   // 一个套餐可以被多个用户订阅
User ──1:N──> Payment        // 一个用户可以有多条支付记录
Subscription ──1:1──> Payment // 一条订阅对应一条支付（或多条，如续费）
```

### ER 图

```
┌─────────────────┐         ┌─────────────────┐
│      User       │         │      Plan       │
├─────────────────┤         ├─────────────────┤
│ id              │         │ id              │
│ nickName        │         │ name            │
│ email           │         │ description     │
│ phone           │         │ price           │
│ avatar          │         │ duration        │
│ status          │         │ features[]      │
│ currentPlanId?──│────┐    │ isActive        │
└────────┬────────┘    │    └────────┬────────┘
         │             │             │
         │ 1:N         └─────────────┘
         ▼                    1:N
┌─────────────────┐           │
│  Subscription   │◄──────────┘
├─────────────────┤
│ id              │
│ userId ─────────│──> User
│ planId ─────────│──> Plan
│ status          │
│ startDate       │
│ endDate         │
└────────┬────────┘
         │ 1:1
         ▼
┌─────────────────┐
│    Payment      │
├─────────────────┤
│ id              │
│ userId          │
│ subscriptionId  │
│ amount          │
│ transactionId   │
│ status          │
│ paidAt          │
└─────────────────┘
```

### Prisma Schema

```prisma
// ============================================
// 订阅制工具数据模型
// 复制以下内容到 prisma/schema.prisma
// ============================================

// 用户表
model User {
  id             String         @id @default(auto()) @map("_id") @db.ObjectId
  created_time   DateTime       @db.Date @default(now())
  updated_time   DateTime       @db.Date @updatedAt

  // 基础信息
  nickName       String
  email          String?
  phone          String?
  avatar         String?
  status         String         @default("active")  // active, inactive, banned

  // 当前订阅（快速查询）
  currentPlanId  String?        @db.ObjectId

  // 关系
  subscriptions  Subscription[]
  payments       Payment[]

  @@unique([email])
  @@unique([phone])
  @@index([currentPlanId])
}

// 套餐/订阅计划表
model Plan {
  id             String         @id @default(auto()) @map("_id") @db.ObjectId
  created_time   DateTime       @db.Date @default(now())
  updated_time   DateTime       @db.Date @updatedAt

  // 套餐信息
  name           String                              // 套餐名称：基础版、专业版、企业版
  description    String?                             // 套餐描述
  price          Float                               // 价格（分）
  originalPrice  Float?                              // 原价（用于显示折扣）
  duration       Int                                 // 时长（天）
  durationType   String         @default("month")    // day, month, year, lifetime

  // 权益
  features       String[]                            // 功能列表
  limits         Json?                               // 使用限制 {"apiCalls": 1000, "storage": "10GB"}

  // 状态
  isActive       Boolean        @default(true)
  sortOrder      Int            @default(0)

  // 关系
  subscriptions  Subscription[]

  @@index([isActive, sortOrder])
}

// 订阅记录表
model Subscription {
  id             String         @id @default(auto()) @map("_id") @db.ObjectId
  created_time   DateTime       @db.Date @default(now())

  // 关联
  userId         String         @db.ObjectId
  user           User           @relation(fields: [userId], references: [id])
  planId         String         @db.ObjectId
  plan           Plan           @relation(fields: [planId], references: [id])

  // 订阅状态
  status         String         @default("pending")  // pending, active, expired, cancelled
  startDate      DateTime?      @db.Date
  endDate        DateTime?      @db.Date

  // 来源
  source         String?                             // direct, promotion, gift

  // 关系
  payments       Payment[]

  @@index([userId, status])
  @@index([endDate])
}

// 支付记录表
model Payment {
  id              String        @id @default(auto()) @map("_id") @db.ObjectId
  created_time    DateTime      @db.Date @default(now())

  // 关联
  userId          String        @db.ObjectId
  user            User          @relation(fields: [userId], references: [id])
  subscriptionId  String?       @db.ObjectId
  subscription    Subscription? @relation(fields: [subscriptionId], references: [id])

  // 支付信息
  orderNo         String        @unique              // 订单号
  transactionId   String?       @unique              // 第三方交易号
  amount          Float                              // 支付金额（分）
  currency        String        @default("CNY")

  // 支付方式
  paymentMethod   String                             // wechat, alipay, stripe

  // 状态
  status          String        @default("pending")  // pending, paid, failed, refunded
  paidAt          DateTime?     @db.Date
  refundedAt      DateTime?     @db.Date

  // 备注
  remark          String?

  @@index([userId])
  @@index([status])
  @@index([orderNo])
}
```

### Model 层代码

```typescript
// src/models/subscription.ts
import prisma from '@/lib/prisma';

// ============ Plan 套餐 ============

export async function getActivePlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getPlanById(id: string) {
  return prisma.plan.findUnique({
    where: { id },
  });
}

// ============ Subscription 订阅 ============

export async function createSubscription(data: {
  userId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
}) {
  return prisma.subscription.create({
    data: {
      ...data,
      status: 'active',
    },
  });
}

export async function getUserActiveSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
      endDate: { gte: new Date() },
    },
    include: { plan: true },
    orderBy: { endDate: 'desc' },
  });
}

export async function getUserSubscriptions(userId: string) {
  return prisma.subscription.findMany({
    where: { userId },
    include: { plan: true },
    orderBy: { created_time: 'desc' },
  });
}

export async function expireSubscription(id: string) {
  return prisma.subscription.update({
    where: { id },
    data: { status: 'expired' },
  });
}

// ============ Payment 支付 ============

export async function createPayment(data: {
  userId: string;
  subscriptionId: string;
  orderNo: string;
  amount: number;
  paymentMethod: string;
}) {
  return prisma.payment.create({
    data: {
      ...data,
      status: 'pending',
    },
  });
}

export async function updatePaymentStatus(
  orderNo: string,
  status: 'paid' | 'failed' | 'refunded',
  transactionId?: string
) {
  const updateData: any = { status };

  if (status === 'paid') {
    updateData.paidAt = new Date();
    if (transactionId) updateData.transactionId = transactionId;
  } else if (status === 'refunded') {
    updateData.refundedAt = new Date();
  }

  return prisma.payment.update({
    where: { orderNo },
    data: updateData,
  });
}

export async function getPaymentByOrderNo(orderNo: string) {
  return prisma.payment.findUnique({
    where: { orderNo },
    include: { subscription: { include: { plan: true } } },
  });
}

export async function getUserPayments(userId: string, page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;

  const [total, items] = await Promise.all([
    prisma.payment.count({ where: { userId } }),
    prisma.payment.findMany({
      where: { userId },
      include: { subscription: { include: { plan: true } } },
      orderBy: { created_time: 'desc' },
      skip,
      take: pageSize,
    }),
  ]);

  return {
    items,
    pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  };
}

// ============ 业务逻辑 ============

// 检查用户是否有有效订阅
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserActiveSubscription(userId);
  return !!subscription;
}

// 订阅套餐（完整流程）
export async function subscribeToPlan(
  userId: string,
  planId: string,
  orderNo: string,
  paymentMethod: string
) {
  const plan = await getPlanById(planId);
  if (!plan) throw new Error('套餐不存在');

  // 计算订阅时长
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.duration);

  // 创建订阅和支付记录
  const [subscription] = await prisma.$transaction([
    prisma.subscription.create({
      data: {
        userId,
        planId,
        status: 'pending',
        startDate,
        endDate,
      },
    }),
  ]);

  const payment = await createPayment({
    userId,
    subscriptionId: subscription.id,
    orderNo,
    amount: plan.price,
    paymentMethod,
  });

  return { subscription, payment };
}

// 支付成功后激活订阅
export async function activateSubscription(orderNo: string, transactionId: string) {
  const payment = await getPaymentByOrderNo(orderNo);
  if (!payment || !payment.subscriptionId) {
    throw new Error('支付记录不存在');
  }

  await prisma.$transaction([
    // 更新支付状态
    prisma.payment.update({
      where: { orderNo },
      data: { status: 'paid', paidAt: new Date(), transactionId },
    }),
    // 激活订阅
    prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: { status: 'active' },
    }),
    // 更新用户当前套餐
    prisma.user.update({
      where: { id: payment.userId },
      data: { currentPlanId: payment.subscription?.planId },
    }),
  ]);
}
```

### 执行步骤

```bash
# 1. 复制 Schema 到 prisma/schema.prisma

# 2. 生成 Prisma Client
npx prisma generate

# 3. 推送到数据库
npx prisma db push

# 4. 复制 Model 层代码到 src/models/subscription.ts

# 5. 可选：打开 Prisma Studio 查看
npx prisma studio
```

---

## 常见业务模型模板

### 电商模型

```prisma
model Product {
  id           String      @id @default(auto()) @map("_id") @db.ObjectId
  created_time DateTime    @db.Date @default(now())
  name         String
  description  String?
  price        Float
  stock        Int         @default(0)
  images       String[]
  categoryId   String?     @db.ObjectId
  status       String      @default("active")
  orderItems   OrderItem[]
}

model Order {
  id           String      @id @default(auto()) @map("_id") @db.ObjectId
  created_time DateTime    @db.Date @default(now())
  orderNo      String      @unique
  userId       String      @db.ObjectId
  totalAmount  Float
  status       String      @default("pending")
  items        OrderItem[]
}

model OrderItem {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  orderId      String   @db.ObjectId
  order        Order    @relation(fields: [orderId], references: [id])
  productId    String   @db.ObjectId
  product      Product  @relation(fields: [productId], references: [id])
  quantity     Int
  price        Float
}
```

### 博客/CMS 模型

```prisma
model Post {
  id           String    @id @default(auto()) @map("_id") @db.ObjectId
  created_time DateTime  @db.Date @default(now())
  title        String
  slug         String    @unique
  content      String
  excerpt      String?
  coverImage   String?
  authorId     String    @db.ObjectId
  categoryId   String?   @db.ObjectId
  tagIds       String[]  @db.ObjectId
  status       String    @default("draft")  // draft, published
  publishedAt  DateTime? @db.Date
  viewCount    Int       @default(0)
  comments     Comment[]
}

model Category {
  id           String     @id @default(auto()) @map("_id") @db.ObjectId
  name         String
  slug         String     @unique
  parentId     String?    @db.ObjectId
}

model Tag {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  name         String   @unique
  slug         String   @unique
}

model Comment {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  created_time DateTime @db.Date @default(now())
  content      String
  authorId     String   @db.ObjectId
  postId       String   @db.ObjectId
  post         Post     @relation(fields: [postId], references: [id])
  parentId     String?  @db.ObjectId
  status       String   @default("pending")  // pending, approved, spam
}
```

### 预约/日程模型

```prisma
model Service {
  id           String        @id @default(auto()) @map("_id") @db.ObjectId
  name         String
  description  String?
  duration     Int                            // 时长（分钟）
  price        Float
  appointments Appointment[]
}

model Appointment {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  created_time DateTime @db.Date @default(now())
  userId       String   @db.ObjectId
  serviceId    String   @db.ObjectId
  service      Service  @relation(fields: [serviceId], references: [id])
  date         DateTime @db.Date
  startTime    String                         // "09:00"
  endTime      String                         // "10:00"
  status       String   @default("pending")   // pending, confirmed, cancelled, completed
  note         String?
}
```

### 多租户 SaaS 模型

```prisma
model Tenant {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  created_time DateTime @db.Date @default(now())
  name         String
  slug         String   @unique
  ownerId      String   @db.ObjectId
  planId       String?  @db.ObjectId
  status       String   @default("active")
  members      Member[]
}

model Member {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  tenantId     String   @db.ObjectId
  tenant       Tenant   @relation(fields: [tenantId], references: [id])
  userId       String   @db.ObjectId
  role         String   @default("member")    // owner, admin, member
  joinedAt     DateTime @db.Date @default(now())
}
```

---

## 设计原则

1. **每个表必备字段**: `id`, `created_time`
2. **外键命名**: `xxxId`（如 `userId`, `planId`）
3. **状态字段**: 使用 `status` String 而非枚举（灵活性更高）
4. **金额字段**: 使用 Float，单位为分（避免浮点精度问题）
5. **时间字段**: 使用 `DateTime @db.Date`
6. **可选字段**: 加 `?` 标记，如 `description String?`
7. **唯一约束**: 业务唯一字段加 `@unique`
8. **索引**: 常用查询字段加 `@@index`
