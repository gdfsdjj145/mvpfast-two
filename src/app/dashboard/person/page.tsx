'use client';
import React from 'react';
import { useSession } from 'next-auth/react';

export default function PersonPage() {
  const { data: session, status } = useSession();

  const renderName = () => {
    if (session?.user?.email) return session.user.email[0];
    if (session?.user?.phone) return session.user.phone[0];
    if (session?.user?.wechatOpenId) return session.user.nickName[0];
    return '?';
  };

  const renderFullName = () => {
    if (session?.user?.email) return session.user.email;
    if (session?.user?.phone) return session.user.phone;
    if (session?.user?.wechatOpenId) return session.user.nickName;
    return '未知用户';
  };

  const renderUserType = () => {
    if (session?.user?.email) return '邮箱用户';
    if (session?.user?.phone) return '手机用户';
    if (session?.user?.wechatOpenId) return '微信用户';
    return '未知';
  };
  return (
    <div className="flex-1 bg-white p-8 rounded-lg">
      <h1 className="text-2xl font-bold mb-2">账户设置</h1>
      <p className="text-gray-500 mb-8">
        管理您的个人账户设置。（已购买的模板可修改个人信息，官网不可修改）
      </p>

      <div className="space-y-8">
        {/* 头像设置 */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">您的头像</h2>
          <p className="text-gray-500 text-sm">可点击头像进行修改</p>
          <div className="w-24 h-24 rounded-full bg-neutral flex items-center justify-center text-white text-3xl">
            {renderName()}
          </div>
        </div>

        {/* 语言设置 */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">您的语言</h2>
          <p className="text-gray-500 text-sm">
            选择应用程序的显示语言并点击保存。
          </p>
          <select className="select select-bordered w-full max-w-xs">
            <option>简体中文</option>
            {/* <option>English</option> */}
          </select>
        </div>

        {/* 姓名设置 */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">您的姓名</h2>
          <input
            type="text"
            placeholder="输入姓名"
            className="input input-bordered w-full max-w-xs"
            value={renderFullName()}
          />
        </div>

        {/* 账号类型 */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">账号类型</h2>
          <p className="text-gray-500 text-sm">你通过什么途径登录的账号</p>
          <input
            type="text"
            placeholder="输入邮箱"
            className="input input-bordered w-full max-w-xs"
            value={renderUserType()}
          />
        </div>
      </div>
    </div>
  );
}
