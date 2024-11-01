'use client';
import React, { useState } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import {
  AtSign,
  BadgeJapaneseYen,
  CircleUser,
  Shield,
  DatabaseZap,
  CarFront,
  MessageCircleMore,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function FeatureComponent() {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1, // 当10%的组件可见时触发
    triggerOnce: true, // 只触发一次
  });
  const [selectedFeature, setSelectedFeature] = useState(0);

  const features = [
    {
      name: '登录',
      icon: <CircleUser></CircleUser>,
      description:
        '邮箱、手机号、微信公众号，三种登录方式可选，涵盖国内主流生态的登录方式，一键配置',
      list: [
        '邮箱登录，利用邮箱的SMTP协议，实现邮箱登录',
        '手机号登录，利用手机号的短信协议，实现手机号登录',
        '微信公众号登录，利用微信公众号的OAuth2.0协议，实现微信公众号登录',
      ],
    },
    {
      name: '支付',
      icon: <BadgeJapaneseYen></BadgeJapaneseYen>,
      description: '使用微信商家支付能力，通过微信支付体系完成支付功能',
      list: ['设置公众号ID配置', '生成商家号V3支付密钥', '生成商家号支付证书'],
    },
    {
      name: '鉴权',
      icon: <Shield></Shield>,
      description:
        '利用NextAuth的jwt登录鉴权，可以提高网站的安全性，只需配置登录密钥即可',
      list: ['jwt登录鉴权，只需配置登录密钥即可', '用户数据保存在Altas里面'],
    },
    {
      name: '数据库',
      icon: <DatabaseZap></DatabaseZap>,
      description:
        '利用mongodb提供的云数据库能力，无需费用，轻松配置后即可使用',
      list: [
        'mongodb提供的云数据库能力，无需费用，轻松配置后即可使用',
        'altas提供简单易用的数据库后台，查看数据',
        'prisma作为数据库的ORM框架，可以轻松管理数据库',
      ],
    },
    {
      name: '样式',
      icon: <CarFront></CarFront>,
      description:
        '使用TailwindCss作为样式框架，可以轻松实现样式配置，无需额外配置',
      list: [
        'TailwindCss作为样式框架，可以轻松实现样式配置，无需额外配置',
        'daysui拥有丰富的组件库，多个主题，能快速实现好看的样式',
      ],
    },
    {
      name: '微信',
      icon: <MessageCircleMore></MessageCircleMore>,
      description:
        '使用微信生态作为基础，可以搭配公众号一起推广使用，符合国内大多数用户使用习惯',
      list: [
        '微信生态作为基础，可以搭配公众号一起推广使用，符合国内大多数用户使用习惯',
        '公众号可以作为推广渠道，通过公众号的推广，可以快速推广你的产品',
      ],
    },
  ];

  return (
    <section id="feat" className="bg-white py-24 sm:py-32" ref={ref as any}>
      <div>
        <div className="mx-auto max-w-2xl lg:text-center lg:px-0 px-6">
          <h2 className="text-base text-secondary font-semibold leading-7 mb-4">
            快速构建网页应用
          </h2>
          <p className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            用最短的时间上线MVP，验证你的想法
          </p>
          <p className="mt-10 text-lg leading-8 mb-12 text-gray-600">
            使用目前最流行的技术搭建你产品的Mvp，快速验证你的产品idea，这套模板包含了一个小产品的最基础功能，集成了登录，鉴权，邮箱，数据库，微信公众号等能力。
          </p>
        </div>
        <div>
          <div className="mx-auto max-w-2xl lg:text-center justify-center flex flex-col">
            <div className="grid grid-cols-4 md:flex justify-start gap-4 md:gap-12 max-md:px-8 max-w-3xl mx-auto mb-8">
              {features.map((feature, index) => (
                <span
                  key={feature.name}
                  onClick={() => setSelectedFeature(index)}
                  className={cn(
                    'flex flex-col text-base items-center justify-center gap-3 select-none cursor-pointer p-2 duration-100 custom-cursor-on-hover text-base md:text-lg',
                    index === selectedFeature ? 'text-secondary' : ''
                  )}
                >
                  {feature.icon}
                  <span className="font-medium">{feature.name}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-center bg-base-200">
            <div className=" lg:text-center justify-center flex flex-col">
              <div className="text-base-content/80 leading-relaxed space-y-4 px-12 md:px-0 py-12 max-w-xl animate-opacity">
                <div className="text-left max-w-3xl mx-auto flex flex-col gap-12">
                  <p className="font-bold text-base-content text-lg">
                    {features[selectedFeature].description}
                  </p>
                  <ul className="space-y-1">
                    {features[selectedFeature].list.map((item, index) => (
                      <li className="mt-1 flex gap-6 items-center" key={index}>
                        <span className="w-[16px]">
                          <CheckCircle
                            className=" text-secondary"
                            strokeWidth={2}
                          />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
