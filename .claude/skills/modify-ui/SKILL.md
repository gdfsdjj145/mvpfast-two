---
name: modify-ui
description: 根据用户 UI 描述，使用 DaisyUI 5 和 Tailwind CSS 4 给出优化建议和代码。用户说"修改UI"、"优化样式"、"美化页面"时使用。
author: MvpFast
user-invocable: true
---

# UI 修改与优化指南

这个技能帮助 AI 根据用户的 UI 描述，使用项目的 DaisyUI 5 + Tailwind CSS 4 技术栈给出 UI 优化建议和实现代码。

---

## 项目 UI 技术栈

```css
/* src/app/globals.css */
@import 'tailwindcss';

@plugin "daisyui" {
  themes: light --default;
}
```

| 技术 | 版本 | 用途 |
|------|------|------|
| Tailwind CSS | 4.x | 工具类 CSS |
| DaisyUI | 5.x | 组件库 |
| Framer Motion | 11.x | 动画 |
| React Icons | 5.x | 图标 |
| next/image | - | 图片优化 |

---

## DaisyUI 5 常用组件速查

### 按钮 Button

```tsx
// 基础按钮
<button className="btn">Default</button>
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-accent">Accent</button>
<button className="btn btn-neutral">Neutral</button>

// 状态变体
<button className="btn btn-info">Info</button>
<button className="btn btn-success">Success</button>
<button className="btn btn-warning">Warning</button>
<button className="btn btn-error">Error</button>

// 样式变体
<button className="btn btn-outline">Outline</button>
<button className="btn btn-ghost">Ghost</button>
<button className="btn btn-link">Link</button>
<button className="btn btn-glass">Glass</button>

// 尺寸
<button className="btn btn-xs">Tiny</button>
<button className="btn btn-sm">Small</button>
<button className="btn btn-md">Medium</button>
<button className="btn btn-lg">Large</button>

// 形状
<button className="btn btn-wide">Wide</button>
<button className="btn btn-block">Block</button>
<button className="btn btn-circle">●</button>
<button className="btn btn-square">■</button>

// 带图标
<button className="btn btn-primary">
  <FaPlus className="mr-2" />
  添加
</button>

// 加载状态
<button className="btn btn-primary" disabled>
  <span className="loading loading-spinner loading-sm"></span>
  加载中
</button>
```

### 输入框 Input

```tsx
// 基础输入
<input type="text" className="input input-bordered" placeholder="请输入" />

// 带标签
<div className="form-control">
  <label className="label">
    <span className="label-text">用户名</span>
  </label>
  <input type="text" className="input input-bordered" />
  <label className="label">
    <span className="label-text-alt">提示信息</span>
  </label>
</div>

// 变体
<input className="input input-primary" />
<input className="input input-secondary" />
<input className="input input-accent" />
<input className="input input-ghost" />

// 尺寸
<input className="input input-xs" />
<input className="input input-sm" />
<input className="input input-md" />
<input className="input input-lg" />

// 带图标
<label className="input input-bordered flex items-center gap-2">
  <FaSearch className="opacity-50" />
  <input type="text" className="grow" placeholder="搜索..." />
</label>
```

### 卡片 Card

```tsx
<div className="card bg-base-100 shadow-xl">
  <figure>
    <img src="..." alt="..." />
  </figure>
  <div className="card-body">
    <h2 className="card-title">标题</h2>
    <p>描述内容</p>
    <div className="card-actions justify-end">
      <button className="btn btn-primary">操作</button>
    </div>
  </div>
</div>

// 变体
<div className="card card-compact">...</div>  // 紧凑
<div className="card card-side">...</div>     // 水平
<div className="card image-full">...</div>    // 图片全覆盖
<div className="card glass">...</div>         // 玻璃效果
```

### 模态框 Modal

```tsx
// 方式1: dialog 元素
<button className="btn" onClick={() => document.getElementById('my_modal').showModal()}>
  打开
</button>
<dialog id="my_modal" className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">标题</h3>
    <p className="py-4">内容</p>
    <div className="modal-action">
      <form method="dialog">
        <button className="btn">关闭</button>
      </form>
    </div>
  </div>
  <form method="dialog" className="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

// 方式2: React state 控制（项目常用）
{isOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
      {/* 内容 */}
    </div>
  </div>
)}
```

### 表格 Table

```tsx
<div className="overflow-x-auto">
  <table className="table">
    <thead>
      <tr>
        <th></th>
        <th>名称</th>
        <th>描述</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>1</th>
        <td>内容</td>
        <td>内容</td>
        <td>
          <button className="btn btn-sm">编辑</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

// 变体
<table className="table table-zebra">...</table>  // 斑马纹
<table className="table table-pin-rows">...</table>  // 固定表头
```

### 徽章 Badge

```tsx
<span className="badge">默认</span>
<span className="badge badge-primary">Primary</span>
<span className="badge badge-secondary">Secondary</span>
<span className="badge badge-accent">Accent</span>
<span className="badge badge-ghost">Ghost</span>

// 尺寸
<span className="badge badge-lg">Large</span>
<span className="badge badge-md">Medium</span>
<span className="badge badge-sm">Small</span>
<span className="badge badge-xs">Tiny</span>

// 轮廓
<span className="badge badge-outline badge-primary">Outline</span>
```

### 加载 Loading

```tsx
<span className="loading loading-spinner loading-xs"></span>
<span className="loading loading-spinner loading-sm"></span>
<span className="loading loading-spinner loading-md"></span>
<span className="loading loading-spinner loading-lg"></span>

// 类型
<span className="loading loading-dots"></span>
<span className="loading loading-ring"></span>
<span className="loading loading-ball"></span>
<span className="loading loading-bars"></span>
<span className="loading loading-infinity"></span>
```

### Toast 提示

```tsx
// 使用 react-hot-toast（项目已集成）
import { toast } from 'react-hot-toast';

toast.success('成功');
toast.error('失败');
toast.loading('加载中...');
toast('普通提示');
```

---

## Tailwind CSS 4 常用工具类

### 布局 Layout

```tsx
// Flexbox
<div className="flex items-center justify-between gap-4">
<div className="flex flex-col gap-2">
<div className="flex-1">  // flex-grow: 1
<div className="shrink-0">  // flex-shrink: 0

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<div className="col-span-2">

// 容器
<div className="container mx-auto px-4">
<div className="max-w-7xl mx-auto">
<div className="max-w-md mx-auto">
```

### 间距 Spacing

```tsx
// Padding
<div className="p-4">       // 1rem
<div className="px-4 py-2"> // 水平1rem, 垂直0.5rem
<div className="pt-8">      // top 2rem

// Margin
<div className="m-4">
<div className="mx-auto">   // 水平居中
<div className="mt-8 mb-4">

// Gap
<div className="gap-4">
<div className="gap-x-4 gap-y-2">

// Space between
<div className="space-y-4">  // 子元素垂直间距
<div className="space-x-2">  // 子元素水平间距
```

### 响应式 Responsive

```tsx
// 断点
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px

<div className="hidden md:block">         // 中屏以上显示
<div className="block md:hidden">         // 中屏以下显示
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<div className="text-sm md:text-base lg:text-lg">
<div className="px-4 sm:px-6 lg:px-8">
```

### 动画与过渡

```tsx
// 过渡
<div className="transition-all duration-300">
<div className="transition-transform duration-500">
<div className="transition-opacity duration-200">

// 变换
<div className="hover:scale-105">
<div className="hover:-translate-y-1">
<div className="hover:rotate-3">

// 组合
<button className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
```

---

## 常见 UI 场景优化方案

### 1. 按钮优化

**用户描述**: "按钮看起来太普通了，想要更有吸引力"

```tsx
// 优化前
<button className="btn">提交</button>

// 优化后：渐变 + 动画 + 阴影
<button className="btn bg-gradient-to-r from-purple-600 to-pink-600 border-none text-white
  hover:scale-105 hover:shadow-xl transition-all duration-300 group">
  <FaRocket className="mr-2 group-hover:translate-x-1 transition-transform" />
  立即开始
</button>

// 优化后：玻璃效果
<button className="btn glass backdrop-blur-sm hover:bg-white/30">
  了解更多
</button>
```

### 2. 卡片优化

**用户描述**: "卡片缺乏层次感"

```tsx
// 优化前
<div className="card bg-white p-4">

// 优化后：悬浮效果 + 边框 + 过渡
<div className="card bg-white rounded-2xl p-6
  border border-gray-100 hover:border-primary/20
  shadow-sm hover:shadow-xl
  transition-all duration-300 hover:-translate-y-1">

// 优化后：渐变边框效果
<div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500">
  <div className="bg-white rounded-2xl p-6">
    内容
  </div>
</div>
```

### 3. 表单优化

**用户描述**: "表单看起来很无聊"

```tsx
// 优化前
<input className="input input-bordered" />

// 优化后：带图标 + 聚焦效果
<label className="input input-bordered flex items-center gap-2
  focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary
  transition-all duration-200">
  <FaUser className="text-gray-400" />
  <input type="text" className="grow bg-transparent outline-none" placeholder="用户名" />
</label>
```

### 4. 空状态优化

**用户描述**: "空列表太突兀"

```tsx
// 优化后
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
    <FaInbox className="text-4xl text-gray-300" />
  </div>
  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无数据</h3>
  <p className="text-gray-500 mb-6 max-w-sm">
    您还没有添加任何内容，点击下方按钮开始添加
  </p>
  <button className="btn btn-primary">
    <FaPlus className="mr-2" />
    添加内容
  </button>
</div>
```

### 5. 加载状态优化

**用户描述**: "加载状态太简单"

```tsx
// 优化后：骨架屏
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  <div className="h-32 bg-gray-200 rounded"></div>
</div>

// 优化后：带文字的加载
<div className="flex flex-col items-center justify-center py-12">
  <span className="loading loading-spinner loading-lg text-primary"></span>
  <p className="mt-4 text-gray-500 animate-pulse">加载中，请稍候...</p>
</div>
```

---

## Framer Motion 动画增强

### 淡入动画

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  内容
</motion.div>
```

### 列表交错动画

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {items.map((item, i) => (
    <motion.li key={i} variants={itemVariants}>
      {item}
    </motion.li>
  ))}
</motion.ul>
```

### 滚动触发动画

```tsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6 }}
>
  滚动到这里时显示
</motion.div>
```

---

## 常用图标库

项目使用 `react-icons`，常用图标集：

```tsx
import { FaUser, FaPlus, FaCheck, FaSearch } from 'react-icons/fa';  // Font Awesome
import { IoClose, IoMenu, IoSettings } from 'react-icons/io5';        // Ionicons
import { HiOutlineHeart, HiStar } from 'react-icons/hi';              // Heroicons
import { BiLoaderAlt } from 'react-icons/bi';                          // Box Icons
import { LuSend, LuDownload } from 'react-icons/lu';                   // Lucide
```
