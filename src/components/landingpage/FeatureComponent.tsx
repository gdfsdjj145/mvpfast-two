'use client';
import React, { useState } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { CheckCircle, icons } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeatureComponent({ feature }: { feature: any }) {
  const featureConfig = feature;
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [selectedFeature, setSelectedFeature] = useState(0);

  const renderIcon = (icon: string) => {
    const LucideIcon = icons[icon as keyof typeof icons];
    return <LucideIcon className="w-6 h-6" />;
  };

  return (
    <section id="feat" className="bg-white py-24 sm:py-32" ref={ref as any}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base text-secondary font-semibold leading-7 mb-4">
            {featureConfig.title}
          </h2>
          <p className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {featureConfig.subtitle}
          </p>
          <p className="mt-10 text-lg leading-8 mb-12 text-gray-600">
            {featureConfig.description}
          </p>
        </div>

        <div className="mt-16">
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-8 mb-12 justify-center">
              {featureConfig.items.map((item, index) => (
                <button
                  key={item.name}
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
                    {renderIcon(item.icon)}
                  </div>
                  <span className="font-medium text-sm md:text-base text-center">
                    {item.name}
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
                    {featureConfig.items[selectedFeature].description}
                  </p>
                  <ul className="space-y-4">
                    {featureConfig.items[selectedFeature].list.map(
                      (item, index) => (
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
                      )
                    )}
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
