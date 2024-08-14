import React from 'react';

export default function HeroComponent() {
  return (
    <section className="mb-24" id="product">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-12 mb-14 text-center">
        一起来奋斗吧！
      </h1>
      <p className="text-lg mb-14 text-center">
        邀请你的朋友一起来完成目标吧，通过邀请朋友加入你的群组，然后每天完成任务来竞赛，直到完成目标为止
      </p>
      <div className="text-center mb-10">
        <a href="/dashboard" className="btn btn-wide btn-secondary text-xl">
          开始奋斗
          <span>👉</span>
        </a>
      </div>
      <img className="my-24" src="/hero.png" alt="" srcSet="" />
    </section>
  );
}
