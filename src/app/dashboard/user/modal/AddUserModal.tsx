import React, { useState } from 'react';
import { useMessages } from 'next-intl';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: {
    name: string;
    createAt: string;
    payAt: string;
    goodKey: string;
  }) => void;
}

export default function AddUserModal({
  isOpen,
  onClose,
  onSubmit,
}: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    createAt: '',
    payAt: '',
    goodKey: '',
  });

  // 使用 next-intl 获取商品信息，与 PriceComponent 保持一致
  const messages = useMessages();
  const priceConfig = messages.Price as any;
  const goodsObj = priceConfig.goods;
  const goods = Object.keys(goodsObj).map((key) => ({
    ...goodsObj[key],
    key,
  }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      createAt: '',
      payAt: '',
      goodKey: '',
    });
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
        className={`bg-white rounded-lg p-6 w-[500px] transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">添加用户</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">用户名</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">购买商品</span>
            </label>
            <select
              name="goodKey"
              value={formData.goodKey}
              onChange={handleChange}
              className="select select-bordered"
              required
            >
              <option value="">请选择商品</option>
              {goods.map((good) => (
                <option key={good.key} value={good.key}>
                  {good.name} - ￥{good.price}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">创建时间</span>
            </label>
            <input
              type="date"
              name="createAt"
              value={formData.createAt}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">支付时间</span>
            </label>
            <input
              type="date"
              name="payAt"
              value={formData.payAt}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-secondary">
              确认添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
