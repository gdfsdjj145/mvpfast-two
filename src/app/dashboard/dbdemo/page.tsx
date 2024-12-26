'use client';
import React, { useState, useEffect } from 'react';
import AddUserModal from './modal/AddUserModal';
import { getUser, addUser, updateUser, deleteUser } from './actions';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn'); // 全局使用中文

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [user, setUser] = useState([]);

  // 打开弹框
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // 关闭弹框
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // 处理编辑
  const handleEdit = (userData: any) => {
    setEditingUser(userData);
    setIsModalOpen(true);
  };

  // 处理删除
  const handleDelete = async (userId: string) => {
    if (confirm('确定要删除这个用户吗？')) {
      // TODO: 实现删除逻辑
      const res = await deleteUser(userId);
      if (res.success) {
        toast.success('删除成功');
        init(); // 重新加载数据
      } else {
        toast.error('删除失败');
      }
    }
  };

  // 处理提交
  const handleSubmit = async (userData: any) => {
    console.log('提交的用户数据:', userData, editingUser);
    if (editingUser) {
      // 更新现有用户
      const res = await updateUser(editingUser.id, userData);
      if (res.success) {
        setIsModalOpen(false);
        toast.success('更新成功');
      } else {
        toast.error('更新失败');
      }
    } else {
      // 添加新用户
      const res = await addUser(userData);
      if (res.success) {
        setIsModalOpen(false);
        toast.success('添加成功');
      } else {
        toast.error('添加失败');
      }
    }
    init();
    setEditingUser(null);
  };

  const init = async () => {
    const res = await getUser();
    setUser(res);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="overflow-x-auto bg-white">
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">用户管理</h1>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={handleOpenModal}>
            添加用户
          </button>
        </div>
      </div>

      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th>用户名</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}
          {user.map((row, index) => (
            <tr key={index}>
              <th>{index + 1}</th>
              <td>{row.nickName}</td>
              <td>
                {dayjs(row.createdDate).format('YYYY年MM月DD日 HH:mm:ss')}
              </td>
              <td>
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEdit(row)}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-4 flex justify-between items-center">
        <div>共 {user.length} 条记录</div>
        <div className="pagination">{/* 添加分页组件 */}</div>
      </div>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingUser}
      />
    </div>
  );
};

export default Page;
