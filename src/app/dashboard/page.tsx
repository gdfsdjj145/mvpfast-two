'use client';
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Group from '@/components/dashboard/Group';
import { HousePlus, Bike } from 'lucide-react';
import Link from 'next/link';
import { getUser, getGroups } from './actions';
import { setInfo, selectInfo } from '@/store/user';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { usePathname } from 'next/navigation';

export default function page() {
  const pathName = usePathname();
  const info = useAppSelector(selectInfo);
  const [group, setGroup] = useState([]);

  const initGroup = async (id: string) => {
    const groups: any = await getGroups(id);
    setGroup(groups);
  };

  useEffect(() => {
    if (info.id) {
      initGroup(info.id);
    }
  }, [info.id]);

  useEffect(() => {}, [pathName]);

  return (
    <div className="flex flex-col min-h-screen w-full p-2 lg:p-6 bg-[#f5f5f5] overflow-hidden">
      <Header></Header>
      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {group.map((item: any) => (
            <Group key={item.id} {...{ ...item, initGroup }}></Group>
          ))}
          <div className="flex flex-col gap-4 min-h-[28rem]">
            <div className="flex-1">
              <Link
                className="h-full btn btn-block btn-outline btn-secondary group"
                href="/dashboard/join"
              >
                <div className="flex flex-col justify-center items-center w-40 h-full gap-5">
                  <div className="group-hover:scale-125 transition-all">
                    <Bike size={36} />
                  </div>
                  <span className="text-xl">加入</span>
                </div>
              </Link>
            </div>
            <div className="flex-1">
              <Link
                className="h-full btn btn-block btn-outline btn-secondary group"
                href="/dashboard/new"
              >
                <div className="flex flex-col justify-center items-center w-40 h-full gap-5">
                  <HousePlus
                    size={36}
                    className="group-hover:scale-125 transition-all"
                  />
                  <span className="text-xl">创建小组</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
