---
name: design-data-model
description: 根据自然语言业务描述，反推数据模型并生成 Prisma Schema。用户说"设计数据库"、"数据模型"、"表结构"时使用。
author: MvpFast
user-invocable: true
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

```markdown
## 数据模型设计

### 实体识别

从您的描述中识别到以下实体：
- **实体1**: 说明
- **实体2**: 说明

### 关系说明

实体1 ──1:N──> 实体2   // 一个实体1有多个实体2
实体2 ──N:1──> 实体3   // 多个实体2属于一个实体3
实体1 <──M:N──> 实体4  // 实体1和实体4多对多

### Prisma Schema

\`\`\`prisma
// 复制到 prisma/schema.prisma

model ModelName {
  // 字段定义
}
\`\`\`

### Model 层代码

\`\`\`typescript
// 复制到 src/models/xxx.ts
\`\`\`
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
