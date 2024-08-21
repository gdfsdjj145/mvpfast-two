import React from 'react';

export default function FeatureComponent() {
  const features = [
    {
      name: '登录',
      icon: 'user',
      description:
        '邮箱、手机号、微信公众号，三种登录方式可选，涵盖国内主流生态的登录方式，一键配置',
    },
    {
      name: '鉴权',
      icon: 'lock',
      description:
        '利用NextAuth的jwt登录鉴权，可以提高网站的安全性，只需配置登录密钥即可',
    },
    {
      name: '数据库',
      icon: 'mongodb',
      description:
        '利用mongodb提供的云数据库能力，无需费用，轻松配置后即可使用',
    },
    {
      name: '微信',
      icon: 'wx',
      description:
        '使用微信生态作为基础，可以搭配公众号一起推广使用，符合国内大多数用户使用习惯',
    },
  ];

  return (
    <section id="feat" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            快速构建网页应用
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            用最短的时间上线MVP，验证你的想法
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            使用目前最流行的技术搭建你产品的Mvp，快速验证你的产品idea，这套模板包含了一个小产品的最基础功能，集成了登录，鉴权，邮箱，数据库，微信公众号等能力。
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg ">
                    <img src={`/${feature.icon}.png`} alt="" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
