'use client';
import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { renderText } from '@/app/lib/utils';
import { getUser } from '@/app/dashboard/actions';
import { selectInfo } from '@/store/user';
import { useAppSelector, useAppDispatch } from '@/store/hook';
import { setInfo } from '@/store/user';

export default function Header() {
  const dispatch = useAppDispatch();
  const info = useAppSelector(selectInfo);

  const initUser = async () => {
    let openId = '';
    const userInfo = JSON.parse(localStorage.getItem('user') as string) || {};
    if (userInfo && dayjs().unix() < userInfo.expires) {
      openId = userInfo.id;
    } else {
      window.location.href = `/auth/signin?callbackUrl=${window.location.pathname}${window.location.search}`;
    }
    const user = await getUser(openId);
    dispatch(
      setInfo({
        openId,
        nickName: user?.nickName,
        id: user.id,
      })
    );
  };

  useEffect(() => {
    initUser();
  }, []);

  return (
    <header className="flex justify-center items-center w-full navbar rounded-box mx-auto max-w-xl mb-6">
      <div className="navbar max-w-3xl shadow-xl rounded-box bg-[#ffffff]">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl" href="/">
            <img className="w-10 h-10" src="/logo.png" alt="" srcSet="" />
            We Fight
          </a>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 h-10 rounded-full !flex justify-center items-center bg-[#ca3d77]">
                <span className="text-xl">{renderText(info.nickName)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
