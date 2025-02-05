'use client';
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { updateUserInfo } from './actions';
import toast from 'react-hot-toast';

export default function PersonPage() {
  const { data: session, status, update: updateSession } = useSession();
  const [user, setUser] = React.useState<any>(null);
  const [avatar, setAvatar] = React.useState<string | null>(null);

  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setAvatar(base64);
          // 这里可以添加上传到服务器的逻辑
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  useEffect(() => {
    if (session?.user) {
      console.log(session.user);
      setUser(session.user);
    }
  }, [session]);

  // 渲染头像
  const renderName = () => {
    if (avatar) {
      return (
        <img src={avatar} alt="头像" className="w-full h-full object-cover" />
      );
    }
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt="头像"
          className="w-full h-full object-cover"
        />
      );
    }
    if (user?.nickName) return user.nickName[0];
    return '?';
  };

  const renderUserType = () => {
    if (user?.email) return '邮箱用户';
    if (user?.phone) return '手机用户';
    if (user?.wechatOpenId) return '微信用户';
    return '未知';
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;

    const res = await updateUserInfo(session.user.id, {
      avatar: avatar,
      nickName: user.nickName,
    });

    if (res.code === 0) {
      // 更新 session
      await updateSession({
        ...session,
        user: {
          ...session.user,
          avatar: avatar,
          nickName: user.nickName,
        },
      });
      toast.success('保存成功');
    } else {
      toast.error('保存失败');
    }
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
          <p className="text-gray-500 text-sm">当前无法修改头像</p>
          <div className="w-24 h-24 rounded-full bg-neutral flex items-center justify-center text-white text-3xl cursor-pointer overflow-hidden">
            {renderName()}
          </div>
        </div>

        {/* 语言设置 */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">您的语言</h2>
          <p className="text-gray-500 text-sm">
            选择应用程序的语言并点击保存。
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
            value={user?.nickName}
            onChange={(e) => setUser({ ...user, nickName: e.target.value })}
          />
        </div>

        {/* 账号类型 */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">账号类型</h2>
          <p className="text-gray-500 text-sm">你通过什么途径登录的账号</p>
          <input
            type="text"
            disabled
            placeholder=""
            className="input input-bordered w-full max-w-xs"
            value={renderUserType()}
          />
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <button
          className="btn btn-secondary w-full max-w-xs"
          onClick={handleSave}
        >
          保存修改
        </button>
      </div>
    </div>
  );
}
