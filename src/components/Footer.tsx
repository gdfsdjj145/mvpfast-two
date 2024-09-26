import Image from 'next/image';
import Link from 'next/link';

const footerSections = [
  {
    title: '友情链接',
    links: [
      {
        name: 'ez背单词',
        href: 'https://ezbdc.dashu.ai',
        title:
          '一款极简的英文单词学习应用，可以非常方便高效的学习英文，具有有挑战的单词背诵模式，无需注册，下载即用。',
        logo: 'ezbbc-logo.png',
      },
      {
        name: 'LogoCook',
        href: 'https://www.logocook.shop/',
        title:
          'LogoCook是一款快速免费的logo生成器,通过在线编辑就可以快速的创建自己想要的logo,包括logo免费下载,可爱的logo属性设计,上传自定义的svg文件,满足个人和企业快速创建logo的需求',
        logo: 'cook-logo.png',
      },
      {
        name: 'IMessageU',
        href: 'https://www.imessageu.shop/',
        title:
          'WeFight是一个通过互相打卡竞技排名的方式来完成目标的网站,通过创建目标任务群组,邀请好友进入群组,完成每天打卡任务,通过每天打卡的方式来培养好习惯和完成目标,适合健身、学习、读书、工作各种社交场景',
        logo: 'want-logo.png',
      },
      {
        name: 'WeFight',
        href: 'https://www.wefight.cn/',
        title:
          '一款快速打通用户反馈通道的产品，创建你的面板来接受用户的心声和建议，帮助开发者助力打造更好的产品，帮助开发者减少伪需求的开发，帮助开发者避免无用功',
        logo: 'fight-logo.png',
      },
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
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          <div className="flex  flex-col mr-4 justify-start">
            <Link href="/" className="flex gap-3">
              <img className="w-6 h-6" src="/logo.png" alt="" />
              <span className="font-bold">MvpFast</span>
            </Link>
            <p className="mt-3 mb-3 text-sm text-base-content/80 leading-relaxed">
              用最短的时间快速创建你个人应用的开发模板
            </p>

            <Link
              href="https://www.mvpfast.top"
              className="border-2 border-base-content/20 rounded-md p-2 group hover:bg-base-content/20 text-sm flex flex-col items-center"
            >
              <div className="flex gap-2 items-center group justify-center">
                <span className="hidden md:block">使用</span>
                <span className="font-bold flex gap-0.5 items-center tracking-tight">
                  <img
                    className="w-6 h-6 group-hover:scale-110 group-hover:rotate-45 transition-all mr-1"
                    src="/logo.png"
                    alt=""
                  />
                  MvpFast
                </span>
                <span>开发</span>
              </div>
              <span className="text-xs text-gray-500 mt-1 block md:hidden">
                点击这里了解更多
              </span>
            </Link>
          </div>
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
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-4"
                    >
                      {link.logo && (
                        <img src={`/${link.logo}`} alt="" className="w-6 h-6" />
                      )}
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
