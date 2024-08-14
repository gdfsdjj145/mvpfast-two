import React from 'react';

export default function CtaComponent() {
  return (
    <section className="card bg-secondary text-secondary-content w-full md:w-[32rem] mx-auto mb-24">
      <div className="card-body items-center text-center gap-6">
        <h3 className="card-title">现在开始奋斗吧</h3>
        <p className="opacity-90">开始邀请朋友吧</p>
        <div className="card-actions justify-center">
          <a
            href="/dashboard"
            className="btn btn-wide glass text-secondary-content"
          >
            开始
          </a>
        </div>
      </div>
    </section>
  );
}
