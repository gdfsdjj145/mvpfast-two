'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Ticket,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Coins,
  Plus,
  Copy,
  Check,
  X,
  Download,
  Eye,
  Ban,
  Trash2,
  Calendar,
  Hash,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RedemptionCode {
  id: string;
  code: string;
  creditAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  description: string | null;
  batchId: string | null;
  created_time: string;
}

interface RedemptionRecord {
  id: string;
  code: string;
  userId: string;
  userIdentifier: string;
  creditAmount: number;
  created_time: string;
}

interface RedemptionStats {
  totalCodes: number;
  activeCodes: number;
  totalUsed: number;
  totalCreditsIssued: number;
  recentRecords: number;
}

export default function RedemptionPage() {
  const [codes, setCodes] = useState<RedemptionCode[]>([]);
  const [stats, setStats] = useState<RedemptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // 创建兑换码弹窗
  const createModalRef = useRef<HTMLDialogElement>(null);
  const [createForm, setCreateForm] = useState({
    creditAmount: 100,
    maxUses: 1,
    expiresAt: '',
    description: '',
    code: '',
  });
  const [creating, setCreating] = useState(false);

  // 批量生成弹窗
  const batchModalRef = useRef<HTMLDialogElement>(null);
  const [batchForm, setBatchForm] = useState({
    count: 10,
    creditAmount: 100,
    maxUses: 1,
    expiresAt: '',
    description: '',
  });
  const [batching, setBatching] = useState(false);
  const [batchResult, setBatchResult] = useState<RedemptionCode[]>([]);

  // 详情弹窗
  const detailModalRef = useRef<HTMLDialogElement>(null);
  const [selectedCode, setSelectedCode] = useState<RedemptionCode | null>(null);
  const [codeRecords, setCodeRecords] = useState<RedemptionRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // 复制状态
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 获取兑换码列表
  const fetchCodes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
        stats: 'true',
      });
      if (search) params.set('search', search);
      if (statusFilter) params.set('isActive', statusFilter);

      const res = await fetch(`/api/admin/redemption-codes?${params}`);
      const data = await res.json();

      if (data.success) {
        setCodes(data.data.items);
        setTotalPages(data.data.totalPages);
        setTotal(data.data.total);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        toast.error(data.error || '获取兑换码列表失败');
      }
    } catch (error) {
      toast.error('获取兑换码列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [page, statusFilter]);

  // 搜索处理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCodes();
  };

  // 复制兑换码
  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      toast.success('已复制兑换码');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('复制失败');
    }
  };

  // 创建兑换码
  const handleCreate = async () => {
    if (createForm.creditAmount <= 0) {
      toast.error('积分数量必须大于0');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/redemption-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          expiresAt: createForm.expiresAt || null,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`兑换码创建成功: ${data.data.code}`);
        createModalRef.current?.close();
        setCreateForm({
          creditAmount: 100,
          maxUses: 1,
          expiresAt: '',
          description: '',
          code: '',
        });
        fetchCodes();
      } else {
        toast.error(data.error || '创建失败');
      }
    } catch {
      toast.error('创建失败');
    } finally {
      setCreating(false);
    }
  };

  // 批量生成
  const handleBatch = async () => {
    if (batchForm.count <= 0 || batchForm.count > 1000) {
      toast.error('生成数量必须在1-1000之间');
      return;
    }
    if (batchForm.creditAmount <= 0) {
      toast.error('积分数量必须大于0');
      return;
    }

    setBatching(true);
    setBatchResult([]);
    try {
      const res = await fetch('/api/admin/redemption-codes/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...batchForm,
          expiresAt: batchForm.expiresAt || null,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`成功生成 ${data.data.count} 个兑换码`);
        setBatchResult(data.data.codes);
        fetchCodes();
      } else {
        toast.error(data.error || '批量生成失败');
      }
    } catch {
      toast.error('批量生成失败');
    } finally {
      setBatching(false);
    }
  };

  // 导出批量生成的兑换码
  const handleExport = () => {
    if (batchResult.length === 0) return;

    const content = batchResult.map(c => c.code).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redemption-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('导出成功');
  };

  // 查看详情
  const handleViewDetail = async (code: RedemptionCode) => {
    setSelectedCode(code);
    setCodeRecords([]);
    detailModalRef.current?.showModal();

    setLoadingRecords(true);
    try {
      const res = await fetch(`/api/admin/redemption-codes/${code.id}`);
      const data = await res.json();
      if (data.success && data.data.records) {
        setCodeRecords(data.data.records);
      }
    } catch {
      console.error('获取使用记录失败');
    } finally {
      setLoadingRecords(false);
    }
  };

  // 切换状态
  const handleToggleStatus = async (code: RedemptionCode) => {
    try {
      const res = await fetch(`/api/admin/redemption-codes/${code.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !code.isActive }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(code.isActive ? '已禁用' : '已启用');
        setCodes(codes.map(c => c.id === code.id ? { ...c, isActive: !c.isActive } : c));
      } else {
        toast.error(data.error || '操作失败');
      }
    } catch {
      toast.error('操作失败');
    }
  };

  // 删除兑换码
  const handleDelete = async (code: RedemptionCode) => {
    if (!confirm(`确定要删除兑换码 ${code.code} 吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/redemption-codes/${code.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        toast.success('删除成功');
        fetchCodes();
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 检查是否过期
  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="stat bg-base-100 shadow rounded-xl p-4">
            <div className="stat-figure text-primary">
              <Ticket size={24} />
            </div>
            <div className="stat-title text-xs">总兑换码</div>
            <div className="stat-value text-2xl">{stats.totalCodes}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl p-4">
            <div className="stat-figure text-success">
              <Check size={24} />
            </div>
            <div className="stat-title text-xs">有效兑换码</div>
            <div className="stat-value text-2xl">{stats.activeCodes}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl p-4">
            <div className="stat-figure text-warning">
              <Hash size={24} />
            </div>
            <div className="stat-title text-xs">已使用次数</div>
            <div className="stat-value text-2xl">{stats.totalUsed}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl p-4">
            <div className="stat-figure text-secondary">
              <Coins size={24} />
            </div>
            <div className="stat-title text-xs">已发放积分</div>
            <div className="stat-value text-2xl">{stats.totalCreditsIssued.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* 搜索和操作 */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="join flex-1">
                <input
                  type="text"
                  placeholder="搜索兑换码或描述..."
                  className="input input-bordered join-item flex-1 input-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="btn btn-primary join-item btn-sm">
                  <Search size={16} />
                </button>
              </div>
            </form>
            <select
              className="select select-bordered select-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部状态</option>
              <option value="true">有效</option>
              <option value="false">已禁用</option>
            </select>
            <button
              onClick={() => fetchCodes()}
              className="btn btn-ghost btn-sm btn-square"
              title="刷新"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => createModalRef.current?.showModal()}
              className="btn btn-primary btn-sm gap-1"
            >
              <Plus size={16} />
              创建
            </button>
            <button
              onClick={() => {
                setBatchResult([]);
                batchModalRef.current?.showModal();
              }}
              className="btn btn-secondary btn-sm gap-1"
            >
              <Hash size={16} />
              批量生成
            </button>
          </div>
        </div>
      </div>

      {/* 兑换码列表 */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>兑换码</th>
                  <th>积分</th>
                  <th>使用次数</th>
                  <th>状态</th>
                  <th>过期时间</th>
                  <th>创建时间</th>
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
                ) : codes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-base-content/60">
                      暂无兑换码数据
                    </td>
                  </tr>
                ) : (
                  codes.map((code) => (
                    <tr key={code.id} className="hover">
                      <td>
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-sm bg-base-200 px-2 py-1 rounded">
                            {code.code}
                          </code>
                          <button
                            onClick={() => handleCopy(code.code, code.id)}
                            className="btn btn-ghost btn-xs btn-square"
                            title="复制"
                          >
                            {copiedId === code.id ? (
                              <Check size={14} className="text-success" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                        {code.description && (
                          <div className="text-xs text-base-content/60 mt-1 truncate max-w-[200px]">
                            {code.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-1 font-semibold">
                          <Coins size={14} className="text-warning" />
                          {code.creditAmount}
                        </div>
                      </td>
                      <td>
                        <span className={code.usedCount >= code.maxUses ? 'text-error' : ''}>
                          {code.usedCount} / {code.maxUses}
                        </span>
                      </td>
                      <td>
                        {!code.isActive ? (
                          <span className="badge badge-error badge-sm">已禁用</span>
                        ) : isExpired(code.expiresAt) ? (
                          <span className="badge badge-warning badge-sm">已过期</span>
                        ) : code.usedCount >= code.maxUses ? (
                          <span className="badge badge-ghost badge-sm">已用完</span>
                        ) : (
                          <span className="badge badge-success badge-sm">有效</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-xs text-base-content/60">
                          {code.expiresAt ? (
                            <>
                              <Clock size={12} />
                              {formatDate(code.expiresAt)}
                            </>
                          ) : (
                            <span className="text-success">永不过期</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-xs text-base-content/60">
                          <Calendar size={12} />
                          {formatDate(code.created_time)}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleViewDetail(code)}
                            className="btn btn-ghost btn-xs"
                            title="查看详情"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(code)}
                            className={`btn btn-ghost btn-xs ${code.isActive ? 'text-warning' : 'text-success'}`}
                            title={code.isActive ? '禁用' : '启用'}
                          >
                            {code.isActive ? <Ban size={14} /> : <Check size={14} />}
                          </button>
                          <button
                            onClick={() => handleDelete(code)}
                            className="btn btn-ghost btn-xs text-error"
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
          <div className="flex justify-between items-center p-4 border-t border-base-300">
            <div className="text-sm text-base-content/60">
              共 {total} 条记录，第 {page}/{totalPages || 1} 页
            </div>
            <div className="join">
              <button
                className="join-item btn btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <button className="join-item btn btn-sm">第 {page} 页</button>
              <button
                className="join-item btn btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 创建兑换码弹窗 */}
      <dialog ref={createModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Ticket size={20} className="text-primary" />
            创建兑换码
          </h3>

          <div className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">自定义兑换码（可选）</legend>
              <input
                type="text"
                className="input input-bordered w-full font-mono"
                placeholder="留空则自动生成"
                value={createForm.code}
                onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">积分数量 *</legend>
              <input
                type="number"
                className="input input-bordered w-full"
                value={createForm.creditAmount}
                onChange={(e) => setCreateForm({ ...createForm, creditAmount: parseInt(e.target.value) || 0 })}
                min={1}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">最大使用次数</legend>
              <input
                type="number"
                className="input input-bordered w-full"
                value={createForm.maxUses}
                onChange={(e) => setCreateForm({ ...createForm, maxUses: parseInt(e.target.value) || 1 })}
                min={1}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">过期时间（可选）</legend>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={createForm.expiresAt}
                onChange={(e) => setCreateForm({ ...createForm, expiresAt: e.target.value })}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">描述/备注</legend>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="例如：新用户福利"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
            </fieldset>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost">取消</button>
            </form>
            <button
              onClick={handleCreate}
              className="btn btn-primary"
              disabled={creating || createForm.creditAmount <= 0}
            >
              {creating ? <span className="loading loading-spinner loading-sm"></span> : '创建'}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* 批量生成弹窗 */}
      <dialog ref={batchModalRef} className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Hash size={20} className="text-secondary" />
            批量生成兑换码
          </h3>

          {batchResult.length === 0 ? (
            <div className="space-y-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">生成数量 *</legend>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={batchForm.count}
                  onChange={(e) => setBatchForm({ ...batchForm, count: parseInt(e.target.value) || 0 })}
                  min={1}
                  max={1000}
                />
                <p className="label text-xs text-base-content/60 mt-1">最多1000个</p>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">每个兑换码积分数量 *</legend>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={batchForm.creditAmount}
                  onChange={(e) => setBatchForm({ ...batchForm, creditAmount: parseInt(e.target.value) || 0 })}
                  min={1}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">每个兑换码最大使用次数</legend>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={batchForm.maxUses}
                  onChange={(e) => setBatchForm({ ...batchForm, maxUses: parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">过期时间（可选）</legend>
                <input
                  type="datetime-local"
                  className="input input-bordered w-full"
                  value={batchForm.expiresAt}
                  onChange={(e) => setBatchForm({ ...batchForm, expiresAt: e.target.value })}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">描述/备注</legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="例如：活动批次001"
                  value={batchForm.description}
                  onChange={(e) => setBatchForm({ ...batchForm, description: e.target.value })}
                />
              </fieldset>

              <div className="bg-base-200 rounded-lg p-4">
                <div className="text-sm font-medium mb-2">生成预览</div>
                <div className="text-sm text-base-content/70">
                  将生成 <span className="font-bold text-primary">{batchForm.count}</span> 个兑换码，
                  每个 <span className="font-bold text-warning">{batchForm.creditAmount}</span> 积分，
                  共计 <span className="font-bold text-secondary">{batchForm.count * batchForm.creditAmount}</span> 积分
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="alert alert-success">
                <Check size={20} />
                <span>成功生成 {batchResult.length} 个兑换码！</span>
              </div>

              <div className="bg-base-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {batchResult.map((code) => (
                    <code key={code.id} className="text-sm bg-base-100 px-2 py-1 rounded font-mono">
                      {code.code}
                    </code>
                  ))}
                </div>
              </div>

              <button onClick={handleExport} className="btn btn-primary btn-block gap-2">
                <Download size={18} />
                导出兑换码
              </button>
            </div>
          )}

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost">关闭</button>
            </form>
            {batchResult.length === 0 && (
              <button
                onClick={handleBatch}
                className="btn btn-secondary"
                disabled={batching || batchForm.count <= 0 || batchForm.creditAmount <= 0}
              >
                {batching ? <span className="loading loading-spinner loading-sm"></span> : '开始生成'}
              </button>
            )}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* 详情弹窗 */}
      <dialog ref={detailModalRef} className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Eye size={20} className="text-info" />
            兑换码详情
          </h3>

          {selectedCode && (
            <div className="space-y-4">
              {/* 基本信息 */}
              <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                <div className="stat">
                  <div className="stat-title">兑换码</div>
                  <div className="stat-value text-lg font-mono">{selectedCode.code}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">积分</div>
                  <div className="stat-value text-lg text-warning">{selectedCode.creditAmount}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">使用次数</div>
                  <div className="stat-value text-lg">{selectedCode.usedCount}/{selectedCode.maxUses}</div>
                </div>
              </div>

              {/* 使用记录 */}
              <div>
                <h4 className="font-semibold text-sm mb-2">使用记录</h4>
                {loadingRecords ? (
                  <div className="text-center py-4">
                    <span className="loading loading-spinner loading-sm"></span>
                  </div>
                ) : codeRecords.length === 0 ? (
                  <div className="text-center py-4 text-base-content/60 text-sm">
                    暂无使用记录
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-xs">
                      <thead>
                        <tr>
                          <th>用户</th>
                          <th>获得积分</th>
                          <th>使用时间</th>
                        </tr>
                      </thead>
                      <tbody>
                        {codeRecords.map((record) => (
                          <tr key={record.id}>
                            <td>{record.userIdentifier}</td>
                            <td className="text-success">+{record.creditAmount}</td>
                            <td className="text-xs text-base-content/60">{formatDate(record.created_time)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost gap-2">
                <X size={18} />
                关闭
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
