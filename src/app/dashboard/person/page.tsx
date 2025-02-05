'use client';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { ImageUpload } from '@/components/ImageUpload';
import { getUserInfo, updateUserInfo } from './actions';
import { supabase } from '@/lib/supabase';

export default function PersonPage() {
  const { user } = useAuth();
  const [userState, setUserState] = React.useState<any>(null);

  const handleAvatarUploadComplete = async (url: string) => {
    if (!userState?.id) return;

    try {
      const res = await updateUserInfo(userState.id, {
        avatar: url,
      });

      if (res.code === 0) {
        // 更新 supabase 用户信息
        const { data, error } = await supabase.auth.updateUser({
          data: {
            avatar: url,
          },
        });

        if (!error) {
          // 更新本地状态
          setUserState({
            ...userState,
            avatar: url,
          });

          toast.success('头像更新成功');
        } else {
          toast.error('头像更新失败');
        }
      } else {
        toast.error('头像更新失败');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('头像更新失败');
    }
  };

  const handleSave = async () => {
    const res = await updateUserInfo(userState.id, {
      nickName: userState.nickName,
    });
    if (res.code === 0) {
      // 更新 supabase 用户信息
      const { data, error } = await supabase.auth.updateUser({
        data: {
          nickName: userState.nickName,
        },
      });

      if (!error) {
        // 更新全局用户状态
        toast.success('保存成功');
      } else {
        toast.error('保存失败');
      }
    } else {
      toast.error('保存失败');
    }
  };

  useEffect(() => {
    if (user) {
      getUserInfo(user.id).then((res) => {
        console.log(res);
        setUserState(res);
      });
    }
  }, [user]);

  // 渲染头像
  const renderName = () => {
    if (userState?.avatar) {
      return (
        <div className="w-full h-full bg-neutral">
          <img
            src={userState.avatar}
            alt="头像"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    return (
      <div className="w-full h-full bg-neutral text-neutral-content flex items-center justify-center">
        {userState?.nickName
          ? userState.nickName[0]
          : userState?.email
          ? userState.email[0]
          : '?'}
      </div>
    );
  };

  const renderUserType = () => {
    if (userState?.email) return '邮箱用户';
    if (userState?.phone) return '手机用户';
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
          <p className="text-gray-500 text-sm">点击头像即可更换</p>
          {userState && (
            <ImageUpload
              defaultImage={userState.avatar || ''}
              bucket="avatars"
              onUploadComplete={handleAvatarUploadComplete}
              className="w-24 h-24 rounded-full"
              userId={userState.id}
            />
          )}
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
            value={userState?.nickName}
            onChange={(e) =>
              setUserState({ ...userState, nickName: e.target.value })
            }
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
