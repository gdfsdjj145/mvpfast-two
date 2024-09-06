import Image from 'next/image';

const footerSections = [
  {
    title: '产品案例',
    links: [
      { name: 'LogoCook', href: 'https://www.logocook.shop/' },
      { name: 'IMessageU', href: 'https://www.imessageu.shop/' },
      { name: 'WeFight', href: 'https://www.wefight.cn/' },
    ],
  },
  {
    title: '技术文档',
    links: [
      { name: 'TailwindCSS', href: 'https://tailwindcss.com/' },
      { name: 'Next', href: 'https://nextjs.org/' },
      { name: 'Prisma', href: 'https://www.prisma.io/' },
      { name: 'DaisyUI', href: 'https://daisyui.com/' },
      { name: 'NextAuth.js', href: 'https://next-auth.js.org/' },
    ],
  },
  {
    title: '更多',
    links: [{ name: '商用协议', href: '/blog/commercial' }],
  },
];

export default function FooterComponent() {
  return (
    <footer className="bg-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-900">
                {section.title}
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex space-x-4">
            <div className="relative w-24 h-24">
              <Image
                src="/xiaohongshu.png"
                alt="QR Code 1"
                fill
                sizes="(max-width: 768px) 96px, 96px"
                className="object-contain"
              />
            </div>
            <div className="relative w-24 h-24">
              <Image
                src="/wechat.jpg"
                alt="QR Code 2"
                fill
                sizes="(max-width: 768px) 96px, 96px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-900/10 pt-8 flex justify-center items-center">
          <p className="text-xs leading-5 text-gray-500">
            &copy; 2024 MvpFast,{' '}
            <a href="https://beian.miit.gov.cn" target="_blank">
              粤ICP备2024286477号-2
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
