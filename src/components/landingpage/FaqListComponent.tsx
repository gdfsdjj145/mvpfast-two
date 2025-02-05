'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface FaqItem {
  title: string;
  answer: string;
}

interface FaqSectionProps {
  items?: FaqItem[];
}

export default function FaqSection({ items = [] }: FaqSectionProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-16 sm:text-4xl text-secondary"
          >
            关于MvpFast的常见问题
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {Array.isArray(items) &&
              items.map((item, index) => (
                <div
                  key={index}
                  className={`collapse collapse-arrow bg-base-200 ${
                    openIndexes.includes(index) ? 'collapse-open' : ''
                  }`}
                  onClick={() => toggleItem(index)}
                >
                  <div className="collapse-title text-lg font-medium py-4 pr-12">
                    {item.title}
                  </div>
                  <div className="collapse-content">
                    <p className="text-base-content/80 pb-4">{item.answer}</p>
                  </div>
                </div>
              ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
