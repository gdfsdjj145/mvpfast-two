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
import { motion, AnimatePresence } from 'framer-motion';

export default function FeatureComponent() {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [selectedFeature, setSelectedFeature] = useState(0);

  const features = [
    {
      name: '登录',
      icon: <CircleUser className="w-6 h-6" />,
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
      icon: <BadgeJapaneseYen className="w-6 h-6" />,
      description: '使用微信商家支付能力，通过微信支付体系完成支付功能',
      list: ['设置公众号ID配置', '生成商家号V3支付密钥', '生成商家号支付证书'],
    },
    {
      name: '鉴权',
      icon: <Shield className="w-6 h-6" />,
      description:
        '利用NextAuth的jwt登录鉴权，可以提高网站的安全性，只需配置登录密钥即可',
      list: ['jwt登录鉴权，只需配置登录密钥即可', '用户数据保存在Altas里面'],
    },
    {
      name: '数据库',
      icon: <DatabaseZap className="w-6 h-6" />,
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
      icon: <CarFront className="w-6 h-6" />,
      description:
        '使用TailwindCss作为样式框架，可以轻松实现样式配置，无需额外配置',
      list: [
        'TailwindCss作为样式框架，可以轻松实现样式配置，无需额外配置',
        'daysui拥有丰富的组件库，多个主题，能快速实现好看的样式',
      ],
    },
    {
      name: '微信',
      icon: <MessageCircleMore className="w-6 h-6" />,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
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

        <div className="mt-16">
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-8 mb-12">
              {features.map((feature, index) => (
                <button
                  key={feature.name}
                  onClick={() => setSelectedFeature(index)}
                  className={cn(
                    'group flex flex-col items-center justify-center gap-3 p-4 rounded-lg transition-all duration-300 hover:bg-gray-100',
                    index === selectedFeature
                      ? 'bg-secondary/10 text-secondary'
                      : 'text-gray-600 hover:text-secondary'
                  )}
                >
                  <div
                    className={cn(
                      'transition-transform duration-300 group-hover:scale-110',
                      index === selectedFeature ? 'scale-110' : ''
                    )}
                  >
                    {feature.icon}
                  </div>
                  <span className="font-medium text-sm md:text-base text-center">
                    {feature.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative bg-[#f2f2f2] rounded-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8 md:p-12"
              >
                <div className="max-w-3xl mx-auto">
                  <p className="font-bold text-gray-900 text-lg md:text-xl mb-8">
                    {features[selectedFeature].description}
                  </p>
                  <ul className="space-y-4">
                    {features[selectedFeature].list.map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start gap-4"
                      >
                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                        <span className="text-gray-600">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
