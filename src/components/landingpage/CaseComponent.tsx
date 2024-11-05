import Image from 'next/image';
const posts = [
  {
    id: 1,
    title: 'LogoCook-Logo厨师',
    href: 'https://www.logocook.shop',
    imageUrl: '/f1.png',
    des: 'LogoCook是一款快速免费的logo生成器,通过在线编辑就可以快速的创建自己想要的logo,包括logo免费下载,可爱的logo属性设计,上传自定义的svg文件,满足个人和企业快速创建logo的需求',
  },
  {
    id: 2,
    title: 'WeFight-一起奋斗吧！',
    href: 'https://www.wefight.cn',
    imageUrl: '/f2.png',
    des: 'WeFight是一个通过互相打卡竞技排名的方式来完成目标的网站,通过创建目标任务群组,邀请好友进入群组,完成每天打卡任务,通过每天打卡的方式来培养好习惯和完成目标,适合健身、学习、读书、工作各种社交场景',
  },
  {
    id: 3,
    title: 'IMessageU-Idea Message User',
    href: 'https://www.imessageu.shop',
    imageUrl: '/f3.png',
    des: '一款快速打通用户反馈通道的产品，创建你的面板来接受用户的心声和建议，帮助开发者助力打造更好的产品，帮助开发者减少伪需求的开发，帮助开发者避免无用功',
  },
];

export default function Example() {
  return (
    <section id="case" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            用MvpFast搭建的网站
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            已经使用MvpFast搭建多个网站产品，以下产品均已上线
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80"
            >
              <Image
                width={0}
                height={0}
                alt={post.title}
                src={post.imageUrl}
                className="absolute inset-0 -z-10 h-full w-full object-cover"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
              <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

              <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                <a href={post.href} target="_blank">
                  <span className="absolute inset-0" />
                  {post.title}
                </a>
              </h3>
              <div className="text-gray-300">{post.des}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
