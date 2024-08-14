import React from 'react';

export default function FeatureComponent() {
  return (
    <section className="py-24" id="feature">
      <div className="text-center">
        <h2 className="font-extrabold text-4xl md:text-5xl tracking-tight mb-6">
          通过和朋友一起努力完成目标
        </h2>
        <p className="md:text-lg opacity-90 mb-12 md:mb-20">
          有人互相比赛，才能更好的完成目标
        </p>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full card card-compact md:card-normal bg-base-100 text-left">
          <div className="card-body flex-row md:flex-col items-center md:items-start gap-4 md:gap-8">
            <span className="text-5xl md:text-6xl">🏠</span>
            <div className="card-title pb-2">建群</div>
            <div className="italic opacity-80">
              <div>设定目标</div>
              <div>创建目标群组</div>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full card card-compact md:card-normal bg-base-100 text-left">
          <div className="card-body flex-row md:flex-col items-center md:items-start gap-4 md:gap-8">
            <span className="text-5xl md:text-6xl">🎯</span>
            <div className="card-title pb-2">邀请朋友</div>
            <div className="italic opacity-80">
              <div>发送链接</div>
              <div>邀请朋友加入</div>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full card card-compact md:card-normal bg-base-100 text-left">
          <div className="card-body flex-row md:flex-col items-center md:items-start gap-4 md:gap-8">
            <span className="text-5xl md:text-6xl">🏆</span>
            <div className="card-title pb-2">比赛</div>
            <div className="italic opacity-80">
              <div>每天打卡完成</div>
              <div>互相竞赛</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
