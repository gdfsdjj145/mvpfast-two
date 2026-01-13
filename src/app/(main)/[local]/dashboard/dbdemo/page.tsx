'use client';
import React, { useState, useEffect } from 'react';
import AddUserModal from './modal/AddUserModal';
import { getUser, addUser, updateUser, deleteUser } from './actions';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import Table from '@/components/dashboard/table';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

const DbDemo = () => {
  // 状态管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');

  // 获取用户列表 - 使用getUser action
  const fetchUsers = async (page = pageInfo.page, name = currentSearch) => {
    try {
      setLoading(true);
      const res = await getUser(page, pageInfo.pageSize, name);
      setUsers(res.data);
      setPageInfo(res.pagination);
    } catch (error) {
      toast.error('获取用户列表失败');
      console.error('获取用户列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = () => {
    setCurrentSearch(searchName);
    fetchUsers(1, searchName); // 搜索时重置到第一页
  };

  // 重置搜索
  const resetSearch = () => {
    setSearchName('');
    setCurrentSearch('');
    fetchUsers(1, '');
  };

  // 添加用户 - 使用addUser action
  const handleAddUser = async (userData: any) => {
    try {
      setLoading(true);
      const res = await addUser(userData);
      if (res.success) {
        toast.success('添加用户成功');
        setIsModalOpen(false);
        fetchUsers(); // 刷新列表
      } else {
        toast.error(res.message || '添加用户失败');
      }
    } catch (error) {
      toast.error('添加用户失败');
      console.error('添加用户错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 更新用户 - 使用updateUser action
  const handleUpdateUser = async (userId: string, userData: any) => {
    try {
      setLoading(true);
      const res = await updateUser(userId, userData);
      if (res.success) {
        toast.success('更新用户成功');
        setIsModalOpen(false);
        fetchUsers(); // 刷新列表
      } else {
        toast.error(res.message || '更新用户失败');
      }
    } catch (error) {
      toast.error('更新用户失败');
      console.error('更新用户错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除用户 - 使用deleteUser action
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除这个用户吗？')) return;
    
    try {
      setLoading(true);
      const res = await deleteUser(userId);
      if (res.success) {
        toast.success('删除用户成功');
        fetchUsers(); // 刷新列表
      } else {
        toast.error(res.message || '删除用户失败');
      }
    } catch (error) {
      toast.error('删除用户失败');
      console.error('删除用户错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 打开新增/编辑模态框
  const handleOpenModal = (user: any = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // 处理表单提交
  const handleSubmit = async (userData: any) => {
    if (editingUser) {
      await handleUpdateUser(editingUser.id, userData);
    } else {
      await handleAddUser(userData);
    }
  };

  // 分页变化处理
  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  // 初始化加载
  useEffect(() => {
    fetchUsers();
  }, []);

  // 键盘事件处理 - 回车搜索
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 表格列配置
  const columns = [
    {
      label: '用户名',
      prop: 'nickName',
    },
    {
      label: '创建时间',
      prop: 'createdDate',
      render: (row: any) => dayjs(row.createdDate).format('YYYY年MM月DD日 HH:mm:ss'),
    },
    {
      label: '操作',
      prop: 'action',
      render: (row: any) => (
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => handleOpenModal(row)}
          >
            编辑
          </button>
          <button
            className="btn btn-sm btn-error btn-outline"
            onClick={() => handleDeleteUser(row.id)}
          >
            删除
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            placeholder="搜索用户名..."
            className="input input-bordered w-full"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
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
        <div className="flex gap-2">
          <button 
            className="btn btn-primary" 
            onClick={() => handleOpenModal()}
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-sm"></span> : null}
            添加用户
          </button>
        </div>
      </div>
      
      {loading && users.length === 0 ? (
        <div className="flex justify-center p-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          {currentSearch && (
            <div className="p-2 bg-blue-50 text-blue-700">
              当前搜索: {currentSearch} 
              {pageInfo.total > 0 ? `（共找到 ${pageInfo.total} 条结果）` : '（无匹配结果）'}
            </div>
          )}
          <Table
            data={users}
            columns={columns}
            options={{
              change: handlePageChange,
            }}
            pagination={pageInfo}
          />
          {users.length === 0 && !loading && (
            <div className="text-center p-8 text-gray-500">
              {currentSearch ? '没有找到匹配的用户' : '暂无数据，请添加用户'}
            </div>
          )}
        </>
      )}

      <AddUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingUser}
      />
    </div>
  );
};

export default DbDemo;
