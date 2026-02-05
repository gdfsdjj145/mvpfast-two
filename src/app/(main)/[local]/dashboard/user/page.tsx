'use client';
import React, { useState } from 'react';
import { config } from '@/config';
import AddUserModal from './modal/AddUserModal';
import { useMessages } from 'next-intl';

export default function page() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  interface UserItem {
    name: string;
    createAt: string;
    payAt: string;
    goodKey: string;
  }

  const [user, setUser] = useState<UserItem[]>([]);

  // 使用 next-intl 获取商品信息，与 PriceComponent 保持一致
  const messages = useMessages();
  const priceConfig = messages.Price as Record<string, unknown>;
  const goodsObj = (priceConfig as { goods: Record<string, { name: string; price: number }> }).goods;
  const goods = Object.keys(goodsObj).map((key) => ({
    ...goodsObj[key],
    key,
  }));

  // 创建商品哈希表以便快速查找
  const goodsHash: Record<string, { name: string; price: number; key: string }> = {};
  goods.forEach((good) => {
    goodsHash[good.key] = good;
  });

  // 打开弹框
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // 关闭弹框
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 处理提交
  const handleSubmit = (userData: UserItem) => {
    console.log('提交的用户数据:', userData);
    setUser([...user, userData]);
    setIsModalOpen(false);
    // 处理数据...
  };

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
            <th>支付时间</th>
            <th>购买商品</th>
            <th>支付金额</th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}
          {user.map((row, index) => (
            <tr key={index}>
              <th>{index + 1}</th>
              <td>{row.name}</td>
              <td>{row.createAt}</td>
              <td>{row.payAt}</td>
              <td>{goodsHash[row.goodKey].name}</td>
              <td>￥{goodsHash[row.goodKey].price}</td>
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
      />
    </div>
  );
}
