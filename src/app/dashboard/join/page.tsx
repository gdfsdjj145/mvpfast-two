'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import { selectInfo } from '@/store/user';
import { useAppSelector } from '@/store/hook';
import { addGroup } from '../actions';

export default function JoinPage() {
  const router = useRouter();
  const urlParams = useSearchParams();
  const info = useAppSelector(selectInfo);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddGroup = async () => {
    const url = new URL(link);
    const groupId = url.search.split('=')[1];
    setLoading(true);
    const { code, msg } = await addGroup({
      userId: info.id,
      nickName: info.nickName,
      groupId: groupId,
    });
    if (code) {
      toast.error(msg);
    } else {
      toast.success(msg);
      router.push('/dashboard');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (urlParams.get('id')) {
      setLink(window.location.href);
    }
  }, []);

  return (
    <Suspense>
      <div className="flex flex-col min-h-screen w-full p-2 lg:p-6 bg-[#f5f5f5] overflow-hidden">
        <Header></Header>
        <main className="flex-1 justify-center flex">
          <div className="flex flex-col max-w-6xl min-w-[460px] mx-auto p-12 gap-8">
            <Link className="btn btn-ghost" href="/dashboard">
              返回
            </Link>
            <label className="form-control">
              <div className="label">
                <span className="label-text">群组链接</span>
              </div>
              <textarea
                value={link}
                className="textarea textarea-bordered h-24"
                placeholder="输入群组的邀请链接，点击加入即可"
                onChange={(e) => setLink(e.target.value)}
              ></textarea>
            </label>
            <button
              className="btn btn-primary"
              disabled={loading}
              onClick={handleAddGroup}
            >
              {loading && (
                <span className="loading loading-spinner loading-xs"></span>
              )}
              加入
            </button>
          </div>
        </main>
      </div>
    </Suspense>
  );
}
