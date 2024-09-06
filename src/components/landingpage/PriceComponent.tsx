import React from 'react';

export default function CtaComponent() {
  const includedFeatures = [
    '登录 + 数据库 + 支付功能等封装能力',
    '前端代码（NextJs + Tailwindcss）',
    '微信公众号服务代码',
    '多个网站常见功能封装',
  ];
  return (
    <section id="price" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            购买MvpFast
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            节省你的时间，让开发者和初创企业能快速的上线网站
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">
              基础开发模板
            </h3>
            <p className="mt-6 text-base leading-7 text-gray-600">
              包含了基础的网站开发功能，例如用户登录，数据库，博客，文章，支付等能力的集成方案。购买后，你可以永久的使用MvpFast的模板，并且享受该模板后续版本的更新功能，在网站上线过程中如遇到问题，可以享受作者的技术支持服务，帮你解决一切的技术问题。
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-secondary">
                你将获得
              </h4>
              <div className="h-px flex-auto bg-gray-100" />
            </div>
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6"
            >
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <span className="mr-2">✔</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-gray-600">
                  支付一次，永久拥有
                </p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">
                    ￥298
                  </span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
                    元
                  </span>
                </p>
                <a
                  href="/pay"
                  className="mt-10 btn btn-secondary group btn-wide text-white"
                >
                  立即购买
                </a>
                <p className="mt-6 text-xs leading-5 text-gray-600">
                  提示：虚拟产品，购买后不支持退款
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
