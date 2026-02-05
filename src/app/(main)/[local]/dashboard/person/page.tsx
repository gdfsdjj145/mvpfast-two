'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { updateUserInfo } from './actions';
import toast from 'react-hot-toast';
import ImageUpload from '@/components/common/ImageUpload';
import { Save } from 'lucide-react';

export default function PersonPage() {
  const { data: session, status, update: updateSession } = useSession();
  const [user, setUser] = React.useState<any>(null);
  const [avatar, setAvatar] = React.useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
      setAvatar(session.user.avatar || null);
    }
  }, [session]);

  const handleSave = async () => {
    if (!session?.user?.id || saving) return;

    setSaving(true);
    try {
      const res = await updateUserInfo(session.user.id, {
        avatar: avatar,
        nickName: user.nickName,
      });

      if (res.code === 0) {
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-base-100 p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-2">账户设置</h1>
      <p className="text-base-content/60 mb-8">
        管理您的个人账户设置。（已购买的模板可修改个人信息，官网不可修改）
      </p>

      <div className="space-y-8">
        {/* 头像设置 */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend">您的头像</legend>
          <p className="text-base-content/60 text-sm mb-3">
            点击上传新头像，支持 JPG/PNG/GIF/WebP 格式
          </p>
          <ImageUpload
            value={avatar || ''}
            onChange={(url) => setAvatar(url || null)}
            type="avatar"
            variant="avatar"
          />
        </fieldset>

        {/* 语言设置 */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend">您的语言</legend>
          <p className="text-base-content/60 text-sm mb-3">
            选择应用程序的语言并点击保存。
          </p>
          <select className="select select-bordered w-full max-w-xs">
            <option>简体中文</option>
            {/* <option>English</option> */}
          </select>
        </fieldset>

        {/* 姓名设置 */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend">您的姓名</legend>
          <input
            type="text"
            placeholder="输入姓名"
            className="input input-bordered w-full max-w-xs"
            value={user?.nickName}
            onChange={(e) => setUser({ ...user, nickName: e.target.value })}
          />
        </fieldset>
      </div>
      <div className="mt-8 flex justify-center">
        <button
          className="btn btn-secondary w-full max-w-xs gap-2"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              保存中...
            </>
          ) : (
            <>
              <Save size={18} />
              保存修改
            </>
          )}
        </button>
      </div>
    </div>
  );
}
