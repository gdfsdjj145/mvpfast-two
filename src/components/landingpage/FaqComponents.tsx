import React from 'react';

export default function FaqComponents({ items }: { items: any }) {
  const faqConfig = items;
  return (
    <section className="bg-white" id="faq">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8 lg:py-40">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
              {faqConfig.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-gray-600">
              {faqConfig.subtitle}
              <a href="#faq" className="font-semibold text-secondary ">
                邮箱：{faqConfig.call.email}
              </a>{' '}
              ，
              <a href="#faq" className="font-semibold text-secondary">
                微信：{faqConfig.call.wechat}
              </a>{' '}
            </p>
          </div>
          <div className="mt-10 lg:col-span-7 lg:mt-0">
            <dl className="space-y-10">
              {faqConfig.items.map((faq) => (
                <div key={faq.question}>
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    {faq.question}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
