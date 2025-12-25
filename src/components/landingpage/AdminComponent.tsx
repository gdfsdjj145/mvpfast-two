'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMessages } from 'next-intl';

export default function AdminComponent() {
  const messages = useMessages();
  const adminConfig = messages.Admin as any;

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          {/* Browser Frame */}
          <div className="bg-gray-800 rounded-t-xl px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-400 max-w-md mx-auto text-center">
                mvpfast.top
              </div>
            </div>
          </div>
          {/* Screenshot */}
          <div className="bg-white rounded-b-xl overflow-hidden shadow-2xl shadow-gray-900/20">
            <Image
              src={adminConfig.banner.url}
              alt={adminConfig.banner.alt}
              width={1920}
              height={1080}
              quality={90}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
              className="w-full h-auto"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
