'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Coins,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  Plus,
  Minus,
  X,
  Save,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  History,
  UserPlus,
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { config } from '@/config';

interface UserData {
  id: string;
  nickName: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  wechatOpenId: string | null;
  credits: number;
  totalSpent: number;
  role: string;
  created_time: string;
}

interface UserStats {
  total: number;
  admins: number;
  activeUsers: number;
  totalCredits: number;
}

interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  balance: number;
  description: string;
  created_time: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // 是否为积分模式
  const isCreditsMode = config.purchaseMode === 'credits';

  // 积分调整弹窗
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [creditReason, setCreditReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [userTransactions, setUserTransactions] = useState<CreditTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  // 新增用户弹窗
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    identifier: '',
    password: '',
    initialCredits: 0,
  });
  const [creating, setCreating] = useState(false);
  const createModalRef = useRef<HTMLDialogElement>(null);

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
        stats: 'true',
      });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (data.success) {
        setUsers(data.data.users);
        setTotalPages(data.data.totalPages);
        setTotal(data.data.total);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        toast.error(data.error || '获取用户列表失败');
      }
    } catch (error) {
      toast.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  // 搜索处理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  // 打开积分管理弹窗
  const openCreditModal = async (user: UserData) => {
    setSelectedUser(user);
    setCreditAmount(0);
    setCreditReason('');
    setUserTransactions([]);
    modalRef.current?.showModal();

    // 加载用户交易记录
    setLoadingTransactions(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/credits?pageSize=10`);
      const data = await res.json();
      if (data.success) {
        setUserTransactions(data.data.transactions);
      }
    } catch (error) {
      console.error('获取交易记录失败:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // 调整积分
  const handleAdjustCredits = async () => {
    if (!selectedUser || creditAmount === 0) {
      toast.error('请输入有效的积分数量');
      return;
    }
    if (!creditReason.trim()) {
      toast.error('请填写调整原因');
      return;
    }

    setAdjusting(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: creditAmount, reason: creditReason }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.data.message);
        // 更新本地用户数据
        setUsers(users.map(u =>
          u.id === selectedUser.id
            ? { ...u, credits: data.data.credits }
            : u
        ));
        setSelectedUser({ ...selectedUser, credits: data.data.credits });
        setCreditAmount(0);
        setCreditReason('');
        // 重新加载交易记录
        const txRes = await fetch(`/api/admin/users/${selectedUser.id}/credits?pageSize=10`);
        const txData = await txRes.json();
        if (txData.success) {
          setUserTransactions(txData.data.transactions);
        }
      } else {
        toast.error(data.error || '调整积分失败');
      }
    } catch (error) {
      toast.error('调整积分失败');
    } finally {
      setAdjusting(false);
    }
  };

  // 更新用户角色
  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('角色更新成功');
        setUsers(users.map(u =>
          u.id === userId ? { ...u, role: newRole } : u
        ));
      } else {
        toast.error(data.error || '更新角色失败');
      }
    } catch (error) {
      toast.error('更新角色失败');
    }
  };

  // 打开新增用户弹窗
  const openCreateModal = () => {
    setCreateForm({ identifier: '', password: '', initialCredits: 0 });
    createModalRef.current?.showModal();
  };

  // 创建用户
  const handleCreateUser = async () => {
    if (!createForm.identifier.trim()) {
      toast.error('请输入账号（邮箱或手机号）');
      return;
    }
    if (!createForm.password.trim()) {
      toast.error('请输入密码');
      return;
    }
    if (createForm.password.length < 6) {
      toast.error('密码长度至少6位');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: createForm.identifier.trim(),
          password: createForm.password,
          initialCredits: createForm.initialCredits,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || '用户创建成功');
        createModalRef.current?.close();
        fetchUsers(); // 刷新列表
      } else {
        toast.error(data.error || '创建用户失败');
      }
    } catch (error) {
      toast.error('创建用户失败');
    } finally {
      setCreating(false);
    }
  };

  // 渲染角色徽章
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <div className="badge badge-warning badge-sm gap-1">
            <Shield size={12} />
            管理员
          </div>
        );
      default:
        return (
          <div className="badge badge-ghost badge-sm gap-1">
            <User size={12} />
            用户
          </div>
        );
    }
  };

  // 渲染用户头像
  const renderAvatar = (user: UserData) => {
    if (user.avatar) {
      return (
        <Image
          src={user.avatar}
          alt={user.nickName}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    const initial = user.nickName?.[0] || user.email?.[0] || '?';
    return (
      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
        {initial.toUpperCase()}
      </div>
    );
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      {stats && (
        <div className={`grid gap-3 ${isCreditsMode ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
          <div className="stat bg-base-100 shadow rounded-xl p-4">
            <div className="stat-figure text-primary">
              <Users size={24} />
            </div>
            <div className="stat-title text-xs">总用户数</div>
            <div className="stat-value text-2xl">{stats.total}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl p-4">
            <div className="stat-figure text-warning">
              <Shield size={24} />
            </div>
            <div className="stat-title text-xs">管理员</div>
            <div className="stat-value text-2xl">{stats.admins}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl p-4">
            <div className="stat-figure text-success">
              <TrendingUp size={24} />
            </div>
            <div className="stat-title text-xs">近30天新增</div>
            <div className="stat-value text-2xl">{stats.activeUsers}</div>
          </div>
          {isCreditsMode && (
            <div className="stat bg-base-100 shadow rounded-xl p-4">
              <div className="stat-figure text-secondary">
                <Coins size={24} />
              </div>
              <div className="stat-title text-xs">总积分</div>
              <div className="stat-value text-2xl">{stats.totalCredits.toLocaleString()}</div>
            </div>
          )}
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
                  placeholder="搜索用户名、邮箱、手机号..."
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
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部角色</option>
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
            <button
              onClick={() => fetchUsers()}
              className="btn btn-ghost btn-sm btn-square"
              title="刷新"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={openCreateModal}
              className="btn btn-primary btn-sm gap-1"
            >
              <UserPlus size={16} />
              新增用户
            </button>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>用户</th>
                  <th>联系方式</th>
                  {isCreditsMode && <th>积分</th>}
                  <th>角色</th>
                  <th>注册时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={isCreditsMode ? 6 : 5} className="text-center py-8">
                      <span className="loading loading-spinner loading-md"></span>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={isCreditsMode ? 6 : 5} className="text-center py-8 text-base-content/60">
                      暂无用户数据
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          {renderAvatar(user)}
                          <div>
                            <div className="font-medium">{user.nickName}</div>
                            <div className="text-xs text-base-content/60 font-mono">
                              {user.id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          {user.email && (
                            <div className="flex items-center gap-1 text-xs">
                              <Mail size={12} className="text-base-content/60" />
                              {user.email}
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-1 text-xs">
                              <Phone size={12} className="text-base-content/60" />
                              {user.phone}
                            </div>
                          )}
                          {user.wechatOpenId && (
                            <div className="text-xs text-success">微信已绑定</div>
                          )}
                        </div>
                      </td>
                      {isCreditsMode && (
                        <td>
                          <div className="flex items-center gap-1">
                            <Coins size={14} className="text-warning" />
                            <span className="font-semibold">{user.credits.toLocaleString()}</span>
                          </div>
                        </td>
                      )}
                      <td>{renderRoleBadge(user.role)}</td>
                      <td>
                        <div className="flex items-center gap-1 text-xs text-base-content/60">
                          <Calendar size={12} />
                          {formatDate(user.created_time)}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {isCreditsMode && (
                            <button
                              onClick={() => openCreditModal(user)}
                              className="btn btn-ghost btn-xs gap-1"
                              title="管理积分"
                            >
                              <Coins size={14} />
                              积分
                            </button>
                          )}
                          <div className="dropdown dropdown-end">
                            <button tabIndex={0} className="btn btn-ghost btn-xs">
                              角色
                            </button>
                            <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-32">
                              <li>
                                <button
                                  onClick={() => handleUpdateRole(user.id, 'user')}
                                  className={user.role === 'user' ? 'active' : ''}
                                >
                                  普通用户
                                </button>
                              </li>
                              <li>
                                <button
                                  onClick={() => handleUpdateRole(user.id, 'admin')}
                                  className={user.role === 'admin' ? 'active' : ''}
                                >
                                  管理员
                                </button>
                              </li>
                            </ul>
                          </div>
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
          )}
        </div>
      </div>

      {/* 积分管理弹窗 - 仅积分模式显示 */}
      {isCreditsMode && (
        <dialog ref={modalRef} className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Coins size={20} className="text-warning" />
            积分管理 - {selectedUser?.nickName}
          </h3>

          {selectedUser && (
            <div className="space-y-4">
              {/* 当前积分 */}
              <div className="stats shadow w-full">
                <div className="stat">
                  <div className="stat-title">当前积分</div>
                  <div className="stat-value text-warning">
                    {selectedUser.credits.toLocaleString()}
                  </div>
                  <div className="stat-desc">累计消费 ¥{selectedUser.totalSpent.toFixed(2)}</div>
                </div>
              </div>

              {/* 调整积分表单 */}
              <div className="card bg-base-200">
                <div className="card-body p-4">
                  <h4 className="font-semibold text-sm mb-3">调整积分</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">调整数量</legend>
                      <div className="join w-full">
                        <button
                          type="button"
                          className="join-item btn"
                          onClick={() => setCreditAmount(a => a - 100)}
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          className="join-item input w-full text-center"
                          value={creditAmount}
                          onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                          placeholder="正数增加，负数扣除"
                        />
                        <button
                          type="button"
                          className="join-item btn"
                          onClick={() => setCreditAmount(a => a + 100)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="label text-base-content/60">
                        {creditAmount > 0 ? (
                          <span className="text-success">增加 {creditAmount} 积分</span>
                        ) : creditAmount < 0 ? (
                          <span className="text-error">扣除 {Math.abs(creditAmount)} 积分</span>
                        ) : (
                          '输入正数增加，负数扣除'
                        )}
                      </p>
                    </fieldset>
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">调整原因 *</legend>
                      <input
                        type="text"
                        className="input w-full"
                        value={creditReason}
                        onChange={(e) => setCreditReason(e.target.value)}
                        placeholder="请填写调整原因"
                      />
                    </fieldset>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={handleAdjustCredits}
                      className="btn btn-primary btn-sm gap-2"
                      disabled={adjusting || creditAmount === 0 || !creditReason.trim()}
                    >
                      {adjusting ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <Save size={14} />
                      )}
                      确认调整
                    </button>
                  </div>
                </div>
              </div>

              {/* 交易记录 */}
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <History size={16} />
                  最近交易记录
                </h4>
                {loadingTransactions ? (
                  <div className="text-center py-4">
                    <span className="loading loading-spinner loading-sm"></span>
                  </div>
                ) : userTransactions.length === 0 ? (
                  <div className="text-center py-4 text-base-content/60 text-sm">
                    暂无交易记录
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-xs">
                      <thead>
                        <tr>
                          <th>类型</th>
                          <th>数量</th>
                          <th>余额</th>
                          <th>描述</th>
                          <th>时间</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userTransactions.map((tx) => (
                          <tr key={tx.id}>
                            <td>
                              {tx.type === 'recharge' && (
                                <span className="badge badge-success badge-xs">充值</span>
                              )}
                              {tx.type === 'consume' && (
                                <span className="badge badge-error badge-xs">消费</span>
                              )}
                              {tx.type === 'refund' && (
                                <span className="badge badge-warning badge-xs">退款</span>
                              )}
                            </td>
                            <td>
                              <span className={tx.amount > 0 ? 'text-success' : 'text-error'}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                              </span>
                            </td>
                            <td>{tx.balance}</td>
                            <td className="max-w-[150px] truncate" title={tx.description}>
                              {tx.description}
                            </td>
                            <td className="text-xs text-base-content/60">
                              {formatDate(tx.created_time)}
                            </td>
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
      )}

      {/* 新增用户弹窗 */}
      <dialog ref={createModalRef} className="modal">
        <div className="modal-box max-w-md">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-primary" />
            新增用户
          </h3>

          <div className="space-y-4">
            {/* 账号输入 */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">账号 <span className="text-error">*</span></legend>
              <input
                type="text"
                className="input w-full"
                value={createForm.identifier}
                onChange={(e) => setCreateForm({ ...createForm, identifier: e.target.value })}
                placeholder="请输入邮箱或手机号"
              />
              <p className="label text-base-content/60">支持邮箱或手机号作为登录账号</p>
            </fieldset>

            {/* 密码输入 */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">密码 <span className="text-error">*</span></legend>
              <input
                type="password"
                className="input w-full"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="请输入密码（至少6位）"
              />
            </fieldset>

            {/* 初始积分（仅积分模式显示） */}
            {isCreditsMode && (
              <fieldset className="fieldset">
                <legend className="fieldset-legend">初始积分</legend>
                <div className="join w-full">
                  <button
                    type="button"
                    className="join-item btn"
                    onClick={() => setCreateForm({ ...createForm, initialCredits: Math.max(0, createForm.initialCredits - 100) })}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    className="join-item input w-full text-center"
                    value={createForm.initialCredits}
                    onChange={(e) => setCreateForm({ ...createForm, initialCredits: Math.max(0, parseInt(e.target.value) || 0) })}
                    placeholder="0"
                    min="0"
                  />
                  <button
                    type="button"
                    className="join-item btn"
                    onClick={() => setCreateForm({ ...createForm, initialCredits: createForm.initialCredits + 100 })}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="label text-base-content/60">可选，创建用户时赠送的初始积分</p>
              </fieldset>
            )}
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost gap-2">
                <X size={18} />
                取消
              </button>
            </form>
            <button
              onClick={handleCreateUser}
              className="btn btn-primary gap-2"
              disabled={creating}
            >
              {creating ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Save size={18} />
              )}
              创建用户
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
