import React from 'react';
import { config } from '@/config';
import { ImCheckmark2 } from 'react-icons/im';
import { IoGiftOutline } from 'react-icons/io5';

export default function PriceComponent({ items }: { items: any }) {
  const priceConfig = items;
  const { goods } = config;
  return (
    <section id="price" className="bg-white ">
      <div className="overflow-hidden ">
        <div className="mx-auto max-w-7xl px-6 pb-96 pt-24 text-center sm:pt-32 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-base/7 font-semibold text-secondary mb-2">
              {priceConfig.title}
            </p>
            <h2 className="font-bold text-3xl lg:text-5xl tracking-tight mb-8 max-w-2xl mx-auto">
              {priceConfig.subtitle}
            </h2>
          </div>
          <div className="relative mt-6">
            <p className="text-sm md:text-base flex justify-center items-center gap-2 ">
              <span className="text-gray-500">
                {priceConfig.description}
                <a
                  href="https://www.mvpfast.top/#price"
                  className="btn btn-secondary btn-outline btn-sm ml-3"
                >
                  立即购买
                  <IoGiftOutline className="ml-2" />
                </a>
              </span>
            </p>
          </div>
        </div>
        <div className="flow-root bg-white pb-24 sm:pb-32">
          <div className="-mt-80">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-2">
                {goods.map((good) => (
                  <div
                    key={good.key}
                    className={`relative ${
                      good.mostPopular ? 'border-2 border-secondary' : ''
                    } flex flex-col justify-between rounded-3xl bg-white p-8  ring-1 ring-gray-900/10 sm:p-10`}
                  >
                    {good.mostPopular && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <span className="badge  badge-secondary text-xs badge-lg ">
                          最多人购买
                          <span className="animate-bounce">🔥</span>
                        </span>
                      </div>
                    )}
                    <div>
                      <h3
                        id={good.key}
                        className="text-base/7 font-semibold text-secondary"
                      >
                        {good.name}
                      </h3>
                      <div className="mt-4 flex items-baseline gap-x-2">
                        <div className="flex gap-4 justify-between items-end text-5xl font-semibold tracking-tight text-gray-900">
                          <div>￥{good.price}</div>
                          <div className="relative text-lg opacity-80">
                            <span className="absolute bg-base-content h-[1.5px] inset-x-0 top-[48%]"></span>
                            {good.original && (
                              <span className="text-gray-400">
                                ￥{good.original}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="mt-6 text-base/7 text-gray-600">
                        {good.description}
                      </p>
                      <ul
                        role="list"
                        className="mt-10 space-y-4 text-sm/6 text-gray-600"
                      >
                        {good.includedFeatures.map((feature) => (
                          <li key={feature} className="flex gap-x-3">
                            <ImCheckmark2
                              aria-hidden="true"
                              className="h-6 w-5 flex-none text-secondary"
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      disabled
                      aria-describedby={good.key}
                      className="btn btn-secondary mt-8 block rounded-md  px-3.5 py-2 text-center text-sm/6 font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
                    >
                      立刻购买 🚀
                    </button>
                    <p className="text-center mt-4 text-gray-400">
                      如有退款问题，可联系客服
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
