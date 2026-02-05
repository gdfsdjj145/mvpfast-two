'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  FileText,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  Save,
  AlertCircle,
  BookOpen,
  FilePlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/lib/utils/common';
import ImageUpload, {
  uploadImageFile,
} from '@/components/common/ImageUpload';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface PostData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  category: string | null;
  tags: string[];
  status: string;
  authorName: string;
  publishedAt: string | null;
  views: number;
  created_time: string;
  updated_time: string;
}

interface PostStats {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
}

interface PostForm {
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string;
  status: string;
}

const emptyForm: PostForm = {
  title: '',
  slug: '',
  description: '',
  content: '',
  coverImage: '',
  category: '',
  tags: '',
  status: 'draft',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function PostsPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [stats, setStats] = useState<PostStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // 编辑弹窗
  const [editingPost, setEditingPost] = useState<PostData | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const editModalRef = useRef<HTMLDialogElement>(null);

  // 删除确认弹窗
  const [deletingPost, setDeletingPost] = useState<PostData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const deleteModalRef = useRef<HTMLDialogElement>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
        stats: 'true',
      });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/posts?${params}`);
      const data = await res.json();

      if (data.success) {
        setPosts(data.data.posts);
        setTotalPages(data.data.totalPages);
        setTotal(data.data.total);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        toast.error(data.error || '获取文章列表失败');
      }
    } catch {
      toast.error('获取文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  // 打开新建弹窗
  const openCreateModal = () => {
    setIsNew(true);
    setEditingPost(null);
    setForm(emptyForm);
    setSlugManuallyEdited(false);
    editModalRef.current?.showModal();
  };

  // 打开编辑弹窗
  const openEditModal = async (post: PostData) => {
    setIsNew(false);
    setEditingPost(post);
    setSlugManuallyEdited(true);

    // 加载完整内容
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`);
      const data = await res.json();
      if (data.success) {
        const p = data.data;
        setForm({
          title: p.title,
          slug: p.slug,
          description: p.description || '',
          content: p.content || '',
          coverImage: p.coverImage || '',
          category: p.category || '',
          tags: (p.tags || []).join(', '),
          status: p.status,
        });
      }
    } catch {
      toast.error('加载文章内容失败');
      return;
    }

    editModalRef.current?.showModal();
  };

  // 保存文章
  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('请输入标题');
      return;
    }
    if (!form.slug.trim()) {
      toast.error('请输入 Slug');
      return;
    }
    if (!form.content.trim()) {
      toast.error('请输入内容');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        content: form.content,
        coverImage: form.coverImage.trim() || null,
        category: form.category.trim() || null,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        status: form.status,
      };

      const url = isNew
        ? '/api/admin/posts'
        : `/api/admin/posts/${editingPost!.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(isNew ? '文章创建成功' : '文章更新成功');
        editModalRef.current?.close();
        fetchPosts();
      } else {
        toast.error(data.error || '保存失败');
      }
    } catch {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 删除文章
  const openDeleteModal = (post: PostData) => {
    setDeletingPost(post);
    deleteModalRef.current?.showModal();
  };

  const handleDelete = async () => {
    if (!deletingPost) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${deletingPost.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('文章已删除');
        deleteModalRef.current?.close();
        fetchPosts();
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    } finally {
      setDeleting(false);
    }
  };


  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="stat bg-base-100 shadow rounded-xl p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
            <div className="stat-figure text-primary">
              <FileText size={24} />
            </div>
            <div className="stat-title text-xs">总文章数</div>
            <div className="stat-value text-2xl">{stats.total}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
            <div className="stat-figure text-success">
              <BookOpen size={24} />
            </div>
            <div className="stat-title text-xs">已发布</div>
            <div className="stat-value text-2xl">{stats.published}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
            <div className="stat-figure text-warning">
              <FilePlus size={24} />
            </div>
            <div className="stat-title text-xs">草稿</div>
            <div className="stat-value text-2xl">{stats.draft}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
            <div className="stat-figure text-secondary">
              <Eye size={24} />
            </div>
            <div className="stat-title text-xs">总浏览量</div>
            <div className="stat-value text-2xl">
              {stats.totalViews.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* 搜索和筛选 */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="join flex-1">
                <input
                  type="text"
                  placeholder="搜索文章标题..."
                  className="input input-bordered join-item flex-1 input-md"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary join-item"
                >
                  <Search size={16} />
                </button>
              </div>
            </form>
            <select
              className="select select-bordered select-md"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部状态</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
            </select>
            <button
              onClick={() => fetchPosts()}
              className="btn btn-ghost btn-square"
              title="刷新"
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={loading ? 'animate-spin' : ''}
              />
            </button>
            <button
              onClick={openCreateModal}
              className="btn btn-primary gap-1"
            >
              <Plus size={16} />
              新建文章
            </button>
          </div>
        </div>
      </div>

      {/* 文章列表 */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>标题</th>
                  <th>分类</th>
                  <th>状态</th>
                  <th>作者</th>
                  <th>日期</th>
                  <th>浏览量</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <span className="loading loading-spinner loading-md"></span>
                    </td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8 text-base-content/60"
                    >
                      暂无文章
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover">
                      <td>
                        <div>
                          <div className="font-medium">{post.title}</div>
                          <div className="text-xs text-base-content/60 font-mono">
                            /{post.slug}
                          </div>
                        </div>
                      </td>
                      <td>
                        {post.category ? (
                          <div className="badge badge-outline badge">
                            {post.category}
                          </div>
                        ) : (
                          <span className="text-base-content/40">-</span>
                        )}
                      </td>
                      <td>
                        {post.status === 'published' ? (
                          <div className="badge badge-success badge gap-1">
                            已发布
                          </div>
                        ) : (
                          <div className="badge badge-warning badge gap-1">
                            草稿
                          </div>
                        )}
                      </td>
                      <td className="text-sm">{post.authorName}</td>
                      <td>
                        <div className="text-xs text-base-content/60">
                          {formatDateTime(
                            post.publishedAt || post.created_time
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm">
                          <Eye size={14} className="text-base-content/60" />
                          {post.views}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditModal(post)}
                            className="btn btn-ghost btn-xs gap-1"
                            title="编辑"
                          >
                            <Edit3 size={14} />
                            编辑
                          </button>
                          <button
                            onClick={() => openDeleteModal(post)}
                            className="btn btn-ghost btn-xs text-error gap-1"
                            title="删除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-base-300">
              <div className="text-sm text-base-content/60">
                共 {total} 条记录，第 {page}/{totalPages} 页
              </div>
              <div className="join">
                <button
                  className="join-item btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <button className="join-item btn">第 {page} 页</button>
                <button
                  className="join-item btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 编辑弹窗 */}
      <dialog ref={editModalRef} className="modal">
        <div className="modal-box max-w-6xl max-h-[90vh] overflow-y-auto">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            {isNew ? '新建文章' : '编辑文章'}
          </h3>

          <div className="space-y-4">
            {/* 标题和 Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  标题 <span className="text-error">*</span>
                </legend>
                <input
                  type="text"
                  className="input w-full"
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((f) => ({
                      ...f,
                      title,
                      slug: slugManuallyEdited ? f.slug : slugify(title),
                    }));
                  }}
                  placeholder="文章标题"
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Slug <span className="text-error">*</span>
                </legend>
                <input
                  type="text"
                  className="input w-full font-mono"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setForm((f) => ({ ...f, slug: e.target.value }));
                  }}
                  placeholder="url-friendly-slug"
                />
              </fieldset>
            </div>

            {/* 描述 */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">描述</legend>
              <textarea
                className="textarea w-full"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="文章简短描述"
                rows={2}
              />
            </fieldset>

            {/* 分类、标签 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">分类</legend>
                <input
                  type="text"
                  className="input w-full"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  placeholder="例如：技术、产品"
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">标签</legend>
                <input
                  type="text"
                  className="input w-full"
                  value={form.tags}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tags: e.target.value }))
                  }
                  placeholder="用逗号分隔，例如：Next.js, React"
                />
              </fieldset>
            </div>

            {/* 封面图 */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">封面图</legend>
              <ImageUpload
                value={form.coverImage}
                onChange={(url) =>
                  setForm((f) => ({ ...f, coverImage: url }))
                }
                type="post"
              />
            </fieldset>

            {/* Markdown 编辑器 */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                内容 <span className="text-error">*</span>
              </legend>
              <div
                data-color-mode="light"
                onDrop={async (e) => {
                  const file = e.dataTransfer.files[0];
                  if (file?.type.startsWith('image/')) {
                    e.preventDefault();
                    const url = await uploadImageFile(file, 'post');
                    if (url) {
                      setForm((f) => ({
                        ...f,
                        content: f.content + `\n![](${url})\n`,
                      }));
                      toast.success('图片上传成功');
                    } else {
                      toast.error('图片上传失败');
                    }
                  }
                }}
                onPaste={async (e) => {
                  const items = e.clipboardData.items;
                  for (const item of items) {
                    if (item.type.startsWith('image/')) {
                      e.preventDefault();
                      const file = item.getAsFile();
                      if (!file) continue;
                      const url = await uploadImageFile(file, 'post');
                      if (url) {
                        setForm((f) => ({
                          ...f,
                          content: f.content + `\n![](${url})\n`,
                        }));
                        toast.success('图片上传成功');
                      } else {
                        toast.error('图片上传失败');
                      }
                      break;
                    }
                  }
                }}
              >
                <MDEditor
                  value={form.content}
                  onChange={(val) =>
                    setForm((f) => ({ ...f, content: val || '' }))
                  }
                  height={400}
                />
              </div>
            </fieldset>

            {/* 状态 */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">状态</legend>
              <div className="flex gap-4">
                <label className="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="status"
                    className="radio radio-primary"
                    checked={form.status === 'draft'}
                    onChange={() =>
                      setForm((f) => ({ ...f, status: 'draft' }))
                    }
                  />
                  <span>草稿</span>
                </label>
                <label className="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="status"
                    className="radio radio-success"
                    checked={form.status === 'published'}
                    onChange={() =>
                      setForm((f) => ({ ...f, status: 'published' }))
                    }
                  />
                  <span>发布</span>
                </label>
              </div>
            </fieldset>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost gap-2">
                <X size={18} />
                取消
              </button>
            </form>
            <button
              onClick={handleSave}
              className="btn btn-primary gap-2"
              disabled={saving}
            >
              {saving ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Save size={18} />
              )}
              {isNew ? '创建' : '保存'}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* 删除确认弹窗 */}
      <dialog ref={deleteModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg flex items-center gap-2 text-error">
            <AlertCircle size={20} />
            确认删除
          </h3>
          <p className="py-4">
            确定要删除文章 <strong>{deletingPost?.title}</strong> 吗？此操作不可撤销。
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost">取消</button>
            </form>
            <button
              onClick={handleDelete}
              className="btn btn-error gap-2"
              disabled={deleting}
            >
              {deleting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Trash2 size={18} />
              )}
              删除
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
