---
name: add-page
description: 指导 AI 如何在 mvpfast-web 项目中生成页面（表单页、列表页、详情页等）
author: MvpFast
---

# 页面生成指南

这个技能指导 AI 如何根据用户需求生成完整的页面，包括前端页面、表单、列表、模态框等组件。

---

## 快速理解

当用户说类似以下需求时，使用本技能：
- "帮我生成一个反馈页面"
- "创建一个用户管理页面"
- "新增一个表单页面"
- "做一个后台列表页"

---

## 页面类型和生成策略

### 1. 前台普通页面（公开访问）

**场景**: 首页、关于页、联系页等不需要登录的页面

**生成位置**: `src/app/[local]/[page-name]/page.tsx`

**模板**:
```tsx
// src/app/[local]/about/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="font-xft">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">关于我们</h1>
        {/* 页面内容 */}
      </main>
      <Footer />
    </div>
  );
}
```

---

### 2. 后台管理列表页（需要登录）

**场景**: 用户管理、订单管理、数据列表等后台页面

**生成位置**: `src/app/[local]/dashboard/[feature]/`

**需要创建的文件**:
```
src/app/[local]/dashboard/[feature]/
├── page.tsx          # 主页面（列表展示）
├── actions.ts        # Server Actions（数据操作）
└── modal/
    └── AddModal.tsx  # 新增/编辑模态框
```

#### 2.1 列表页面模板 (`page.tsx`)

```tsx
'use client';
import React, { useState, useEffect } from 'react';
import AddModal from './modal/AddModal';
import { getList, addItem, updateItem, deleteItem } from './actions';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import Table from '@/components/dashboard/table';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

// 定义数据类型
interface ItemType {
  id: string;
  // 根据实际字段定义
  title: string;
  content: string;
  created_time: Date;
}

const ListPage = () => {
  // 状态管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemType | null>(null);
  const [items, setItems] = useState<ItemType[]>([]);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');

  // 获取列表数据
  const fetchData = async (page = pageInfo.page, keyword = currentSearch) => {
    try {
      setLoading(true);
      const res = await getList(page, pageInfo.pageSize, keyword);
      setItems(res.data);
      setPageInfo(res.pagination);
    } catch (error) {
      toast.error('获取数据失败');
      console.error('获取数据错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索处理
  const handleSearch = () => {
    setCurrentSearch(searchKeyword);
    fetchData(1, searchKeyword);
  };

  // 重置搜索
  const resetSearch = () => {
    setSearchKeyword('');
    setCurrentSearch('');
    fetchData(1, '');
  };

  // 新增
  const handleAdd = async (data: Omit<ItemType, 'id' | 'created_time'>) => {
    try {
      setLoading(true);
      const res = await addItem(data);
      if (res.success) {
        toast.success('添加成功');
        setIsModalOpen(false);
        fetchData();
      } else {
        toast.error(res.message || '添加失败');
      }
    } catch (error) {
      toast.error('添加失败');
      console.error('添加错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 更新
  const handleUpdate = async (id: string, data: Partial<ItemType>) => {
    try {
      setLoading(true);
      const res = await updateItem(id, data);
      if (res.success) {
        toast.success('更新成功');
        setIsModalOpen(false);
        fetchData();
      } else {
        toast.error(res.message || '更新失败');
      }
    } catch (error) {
      toast.error('更新失败');
      console.error('更新错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除吗？')) return;

    try {
      setLoading(true);
      const res = await deleteItem(id);
      if (res.success) {
        toast.success('删除成功');
        fetchData();
      } else {
        toast.error(res.message || '删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
      console.error('删除错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 打开模态框
  const handleOpenModal = (item: ItemType | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // 表单提交
  const handleSubmit = async (data: Omit<ItemType, 'id' | 'created_time'>) => {
    if (editingItem) {
      await handleUpdate(editingItem.id, data);
    } else {
      await handleAdd(data);
    }
  };

  // 分页
  const handlePageChange = (page: number) => {
    fetchData(page);
  };

  // 初始化
  useEffect(() => {
    fetchData();
  }, []);

  // 回车搜索
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 表格列配置
  const columns = [
    {
      label: '标题',
      prop: 'title',
    },
    {
      label: '内容',
      prop: 'content',
    },
    {
      label: '创建时间',
      prop: 'created_time',
      render: (row: ItemType) => dayjs(row.created_time).format('YYYY-MM-DD HH:mm'),
    },
    {
      label: '操作',
      prop: 'action',
      render: (row: ItemType) => (
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => handleOpenModal(row)}
          >
            编辑
          </button>
          <button
            className="btn btn-sm btn-error btn-outline"
            onClick={() => handleDelete(row.id)}
          >
            删除
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      {/* 工具栏 */}
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            placeholder="搜索..."
            className="input input-bordered w-full"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading}
          >
            搜索
          </button>
          {currentSearch && (
            <button
              className="btn btn-outline"
              onClick={resetSearch}
              disabled={loading}
            >
              重置
            </button>
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
          disabled={loading}
        >
          {loading && <span className="loading loading-spinner loading-sm"></span>}
          新增
        </button>
      </div>

      {/* 表格 */}
      {loading && items.length === 0 ? (
        <div className="flex justify-center p-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          {currentSearch && (
            <div className="p-2 bg-blue-50 text-blue-700">
              当前搜索: &quot;{currentSearch}&quot;
              {pageInfo.total > 0 ? `（共 ${pageInfo.total} 条）` : '（无结果）'}
            </div>
          )}
          <Table
            data={items}
            columns={columns}
            options={{ change: handlePageChange }}
            pagination={pageInfo}
          />
        </>
      )}

      {/* 模态框 */}
      <AddModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingItem}
      />
    </div>
  );
};

export default ListPage;
```

#### 2.2 Server Actions 模板 (`actions.ts`)

```ts
'use server';
import {
  createItem,
  findItems,
  countItems,
  updateItemById,
  deleteItemById
} from '@/models/[feature]';

// 获取列表
export const getList = async (
  page: number = 1,
  pageSize: number = 10,
  searchKeyword: string = ''
) => {
  const skip = (page - 1) * pageSize;

  // 构建搜索条件
  const where = searchKeyword
    ? {
        title: {
          $regex: searchKeyword,
          $options: 'i'
        }
      }
    : {};

  const [total, items] = await Promise.all([
    countItems(where),
    findItems(where, skip, pageSize, { created_time: 'desc' })
  ]);

  return {
    data: items,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  };
};

// 新增
export const addItem = async (data: any) => {
  try {
    await createItem(data);
    return { success: true, message: '添加成功' };
  } catch (error) {
    console.error(error);
    return { success: false, message: '添加失败' };
  }
};

// 更新
export const updateItem = async (id: string, data: any) => {
  try {
    await updateItemById(id, data);
    return { success: true, message: '更新成功' };
  } catch (error) {
    console.error('更新错误:', error);
    return { success: false, message: '更新失败' };
  }
};

// 删除
export const deleteItem = async (id: string) => {
  try {
    await deleteItemById(id);
    return { success: true, message: '删除成功' };
  } catch (error) {
    console.error('删除错误:', error);
    return { success: false, message: '删除失败' };
  }
};
```

#### 2.3 模态框模板 (`modal/AddModal.tsx`)

```tsx
import React, { useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  initialData?: any;
}

interface FormData {
  title: string;
  content: string;
  // 根据实际字段定义
}

export default function AddModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
  });

  // 初始化表单数据
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
      });
    } else {
      setFormData({
        title: '',
        content: '',
      });
    }
  }, [initialData]);

  // 处理输入变化
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: '', content: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* 头部 */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {initialData ? '编辑' : '新增'}
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 文本输入 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">标题</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input input-bordered"
              placeholder="请输入标题"
              required
            />
          </div>

          {/* 多行文本 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">内容</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="textarea textarea-bordered h-24"
              placeholder="请输入内容"
              required
            />
          </div>

          {/* 按钮 */}
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? '确认修改' : '确认添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### 3. 提交表单页面（前台用户提交）

**场景**: 反馈表单、联系表单、申请表单等

**生成位置**: `src/app/[local]/[feature]/page.tsx`

**模板**:
```tsx
'use client';
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { submitForm } from './actions';
import { toast } from 'react-hot-toast';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function FeedbackPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await submitForm(formData);

      if (res.success) {
        toast.success('提交成功！');
        setSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
      } else {
        toast.error(res.message || '提交失败');
      }
    } catch (error) {
      toast.error('提交失败，请稍后重试');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-xft min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">反馈表单</h1>

          {submitted ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">提交成功！</h2>
              <p className="text-gray-600 mb-4">感谢您的反馈，我们会尽快处理。</p>
              <button
                className="btn btn-primary"
                onClick={() => setSubmitted(false)}
              >
                继续提交
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">姓名</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="请输入您的姓名"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">邮箱</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="请输入您的邮箱"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">反馈内容</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="textarea textarea-bordered h-32 w-full"
                  placeholder="请输入您的反馈内容"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading && <span className="loading loading-spinner loading-sm"></span>}
                提交反馈
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

---

## 表单字段类型参考

### 常用表单控件

```tsx
{/* 文本输入 */}
<input type="text" className="input input-bordered" />

{/* 邮箱 */}
<input type="email" className="input input-bordered" />

{/* 密码 */}
<input type="password" className="input input-bordered" />

{/* 数字 */}
<input type="number" className="input input-bordered" />

{/* 多行文本 */}
<textarea className="textarea textarea-bordered" />

{/* 下拉选择 */}
<select className="select select-bordered">
  <option value="">请选择</option>
  <option value="1">选项1</option>
  <option value="2">选项2</option>
</select>

{/* 复选框 */}
<input type="checkbox" className="checkbox" />

{/* 单选按钮 */}
<input type="radio" className="radio" name="group" />

{/* 开关 */}
<input type="checkbox" className="toggle" />

{/* 日期 */}
<input type="date" className="input input-bordered" />

{/* 文件上传 */}
<input type="file" className="file-input file-input-bordered" />
```

---

## 生成流程检查清单

当用户请求生成页面时，按以下顺序执行：

### 1. 确认需求
- [ ] 页面类型（列表页/表单页/详情页）
- [ ] 是否需要登录（放在 dashboard 下还是公开）
- [ ] 数据字段有哪些
- [ ] 需要哪些操作（CRUD）

### 2. 生成数据库模型（如需要）
参考 `/add-route` 技能

### 3. 生成 Model 层
位置: `src/models/[feature].ts`

### 4. 生成页面文件
- `page.tsx` - 主页面
- `actions.ts` - Server Actions
- `modal/AddModal.tsx` - 模态框（如需要）

### 5. 配置路由保护（如需要）
在 `src/middleware.ts` 的 `protectedRoutes` 添加路径

---

## 样式规范

- 使用 **DaisyUI** 组件类
- 使用 **Tailwind CSS** 工具类
- 按钮: `btn btn-primary`, `btn btn-outline`, `btn btn-error`
- 输入: `input input-bordered`
- 表格: `table`
- 卡片: `card`
- 加载: `loading loading-spinner`
- 提示: 使用 `react-hot-toast`

---

## 示例：生成反馈功能

用户说："帮我生成一个反馈页面，包括提交表单和后台页面"

**需要生成的文件**:

1. **数据库模型** (`prisma/schema.prisma` 添加)
2. **Model 层** (`src/models/feedback.ts`)
3. **前台表单** (`src/app/[local]/feedback/page.tsx`, `actions.ts`)
4. **后台管理** (`src/app/[local]/dashboard/feedback/page.tsx`, `actions.ts`, `modal/AddModal.tsx`)
5. **API 路由**（可选，如需外部调用）

详细代码见各模板。
