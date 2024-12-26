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
      name: '功能1',
      icon: <CircleUser className="w-6 h-6" />,
      description: '展示出你产品的特色能力',
      list: ['有无敌的功能', '一键配置', '太牛了'],
    },
    {
      name: '功能2',
      icon: <BadgeJapaneseYen className="w-6 h-6" />,
      description: '别人没有的你也有',
      list: ['独步武林', '独孤九剑', '吸星大法'],
    },
    {
      name: '功能3',
      icon: <Shield className="w-6 h-6" />,
      description: '前面两个不够，还有第三个',
      list: ['激光炮', 'ak47'],
    },
  ];

  return (
    <section id="feat" className="bg-white py-24 sm:py-32" ref={ref as any}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base text-secondary font-semibold leading-7 mb-4">
            展示你网站的功能
          </h2>
          <p className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            这一部分用于展示你的网站功能
          </p>
          <p className="mt-10 text-lg leading-8 mb-12 text-gray-600">
            这一部分展示客户喜欢的功能，对客户有用的功能信息（下面是编的示例）
          </p>
        </div>

        <div className="mt-16">
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-8 mb-12 justify-center">
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
