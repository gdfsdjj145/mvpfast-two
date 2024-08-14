'use client';
import React, { useEffect, useState } from 'react';
import {
  UserRoundPlus,
  PersonStanding,
  Activity,
  BarChart,
  Store,
  SquareArrowRight,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';
import 'dayjs/locale/zh-cn';
import { cn } from '@/app/lib/utils';
import { renderText } from '@/app/lib/utils';
import { selectInfo } from '@/store/user';
import { useAppSelector } from '@/store/hook';
import {
  getGroupUsers,
  getActives,
  createActive,
  getOutGroup,
} from '@/app/dashboard/actions';
import ClipboardCopyButton from '../ClipboardBtn';

dayjs.locale('zh-cn'); // 设置为中文
dayjs.extend(relativeTime);

export default function Group(props) {
  const info = useAppSelector(selectInfo);
  const { name, describe, createdDate, id, initGroup } = props;
  const [active, setActive] = useState('today');
  const [userList, setUserList] = useState([]);
  const [activeList, setActiveList] = useState([]);
  const [activeState, setActiveState] = useState(false);
  const [loading, setLoading] = useState(false);

  const ISRANT = active === 'rant';
  const ISABOUT = active === 'about';

  const handleCopyLink = () => {
    toast('已复制邀请链接，发送给你的朋友吧！', {
      icon: '👉😊',
      style: {
        border: '1px solid #e8488a',
        padding: '4px',
        color: '#e8488a',
      },
    });
  };

  const handleFinishTask = async () => {
    setLoading(true);

    const target: any = userList.filter(
      (item: any) => info.id === item.userId
    )[0];
    await createActive({
      userName: target.userName,
      userId: target.userId,
      groupId: target.groupId,
      active: ++target.active,
      groupUserId: target.id,
    });

    await intiActive();
    await initUser();
    setLoading(false);
  };

  const intiActive = async () => {
    const actives: any = await getActives({
      id,
    });
    const activeKeys: Array<string> = actives.map((item) => item.userId);
    if (activeKeys.includes(info.id)) {
      setActiveState(true);
    } else {
      setActiveState(false);
    }
    setActiveList(actives);
  };

  const initUser = async () => {
    const users: any = await getGroupUsers({
      id,
    });
    setUserList(users);
  };

  const ActiveTab = () => {
    const tabList = [
      {
        key: 'today',
        label: '今天活跃',
        icon: <Activity size={16}></Activity>,
      },
      {
        key: 'rant',
        label: '历史排名',
        icon: <BarChart size={16}></BarChart>,
      },
      {
        key: 'about',
        label: '群状态',
        icon: <Store size={16}></Store>,
      },
    ];

    const ISACTIVE = (key: string) => {
      return active === key ? 'tab-active' : '';
    };

    return (
      <div role="tablist" className="tabs tabs-boxed">
        {tabList.map((item: any) => (
          <a
            role="tab"
            key={item.key}
            className={cn('tab flex items-center gap-2', ISACTIVE(item.key))}
            onClick={() => setActive(item.key)}
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </a>
        ))}
      </div>
    );
  };

  const UserList = () => {
    const renderRankList = userList.sort(
      (a: any, b: any) => b.active - a.active
    );

    const list = ISRANT ? renderRankList : activeList;

    const renderTime = (date) => {
      return dayjs(date).fromNow() || '-';
    };

    return (
      <ul className="flex flex-col gap-2">
        {list.map((item: any, index) => (
          <li key={item.id} className="flex py-2 w-full">
            <div className="flex gap-2 w-full">
              {ISRANT && (
                <div className="w-12 h-12">
                  <img src={`/${index + 1}.svg`} alt="" srcSet="" />
                </div>
              )}
              <div className="flex-1 flex gap-4">
                <div className="w-12 h-12 rounded-full flex justify-center items-center bg-[#ca3d77]">
                  <span className="text-2xl">{renderText(item.userName)}</span>
                </div>
                <div className="flex flex-1 justify-center flex-col">
                  <p>{item.userName}</p>
                  {!ISRANT && (
                    <p className="text-slate-300">
                      {renderTime(item.createdDate)}完成
                    </p>
                  )}
                </div>
              </div>
              {ISRANT && (
                <div className="font-bold flex justify-center items-center px-4">
                  {item.active}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const About = () => {
    const [count, setCount] = useState(0);
    const handleOutGroup = async () => {
      if (count < 1) {
        setCount(count + 1);
        return;
      }
      const target: any = userList.filter(
        (item: any) => info.id === item.userId
      )[0];
      await getOutGroup({
        id: target.id,
      });

      await initGroup(info.id);
    };

    return (
      <div className="flex flex-col gap-2">
        <p>创建于：{dayjs(createdDate).format('YYYY-MM-DD HH:mm:ss')}</p>
        <p>描述：{describe}</p>
        <p>人数：{userList.length}人</p>
        <div className="flex justify-end mx-2">
          <button className="btn btn-outline btn-sm" onClick={handleOutGroup}>
            {Boolean(count) ? '(再次点击确认)' : '退出群组'}
            <SquareArrowRight size={16}></SquareArrowRight>
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    intiActive();
    initUser();
  }, []);

  return (
    <div className="card compact relative h-[28rem] shadow-lg bg-base-100 duration-200 ease-in-out">
      <div className="card-body gap-4 h-full">
        <div className="flex flex-row justify-between items-end">
          <div className="flex items-center">
            <span className="mr-3 font-bold">{name}</span>
            <div className="flex items-center">
              <div className="badge">
                {userList.length}
                <PersonStanding size={18}></PersonStanding>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="tooltip" data-tip="邀请加入">
              <ClipboardCopyButton
                text={`${window.location.host}/dashboard/join?id=${id}`}
                cb={handleCopyLink}
              >
                <UserRoundPlus
                  size={24}
                  className="cursor-pointer hover:scale-110 transition-all"
                ></UserRoundPlus>
              </ClipboardCopyButton>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="py-2">
            <ActiveTab></ActiveTab>
          </div>
          <div className="pt-2">
            <div
              className={cn(
                'h-64 scrollbar-style',
                ISRANT ? 'overflow-y-auto' : 'overflow-y-hidden'
              )}
            >
              {ISABOUT ? <About></About> : <UserList></UserList>}
            </div>
            {!ISABOUT && (
              <div className="flex justify-end pt-2">
                {!activeState ? (
                  <button
                    className="absolute btn btn-sm btn-primary left-4 right-4 bottom-4 shadow-lg"
                    disabled={loading}
                    onClick={handleFinishTask}
                  >
                    {loading && (
                      <span className="loading loading-spinner loading-xs"></span>
                    )}
                    打卡
                  </button>
                ) : (
                  <div className="absolute btn btn-sm btn-secondary left-40 right-4 bottom-4 shadow-lg">
                    ✔ 今日已打卡
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
