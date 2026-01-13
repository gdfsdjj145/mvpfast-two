import React, { useState, useEffect } from 'react';
import { config } from '@/config';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: { nickName: string }) => void;
  initialData?: any;
}

export default function AddUserModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: AddUserModalProps) {
  const [formData, setFormData] = useState({
    nickName: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nickName: initialData.nickName || '',
      });
    } else {
      setFormData({
        nickName: '',
      });
    }
  }, [initialData]);

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
      nickName: '',
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
          <h2 className="text-xl font-bold">
            {initialData ? '编辑用户' : '添加用户'}
          </h2>
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
              name="nickName"
              value={formData.nickName}
              onChange={handleChange}
              className="input input-bordered"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-secondary">
              {initialData ? '确认修改' : '确认添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
