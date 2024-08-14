'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import { selectInfo } from '@/store/user';
import { useAppSelector } from '@/store/hook';
import { createGroup } from '../actions';
import { useRouter } from 'next/navigation';

export default function page() {
  const router = useRouter();
  const info = useAppSelector(selectInfo);
  const [name, setName] = useState('');
  const [introduce, setIntroduce] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    const { code, msg } = await createGroup({
      id: info.id,
      name,
      nickName: info.nickName,
      describe: introduce,
    });
    if (code) {
      toast.error(msg);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen w-full p-2 lg:p-6 bg-[#f5f5f5] overflow-hidden">
      <Header></Header>
      <main className="flex-1 justify-center flex">
        <div className="flex flex-col max-w-6xl min-w-[460px] mx-auto p-12 gap-8">
          <Link className="btn btn-ghost" href="/dashboard">
            返回
          </Link>
          <label className="form-control">
            <div className="label">
              <span className="label-text">群组名称</span>
            </div>
            <input
              value={name}
              type="text"
              placeholder="工作💼,读书📚,学习🙋‍,健身🎳..."
              className="input input-bordered w-full max-w-xs"
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="form-control">
            <div className="label">
              <span className="label-text">群组介绍</span>
            </div>
            <textarea
              value={introduce}
              className="textarea textarea-bordered h-24"
              placeholder="请写下群组介绍,例如这是一个想要成为八块腹肌男人的群组,欢迎来每天打卡💳"
              onChange={(e) => setIntroduce(e.target.value)}
            ></textarea>
          </label>

          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading && (
              <span className="loading loading-spinner loading-xs"></span>
            )}
            创建
          </button>
        </div>
      </main>
    </div>
  );
}
