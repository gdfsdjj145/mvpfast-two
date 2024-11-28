---
order: 1
key: introduction
title: 快速开始
description: 快速开始
---

欢迎来到 MvpFast🙋

下面是 MvpFast 模板的介绍，请你按照下面的步骤启动你的项目。

完成之后，你可以按照文章教程，五分钟就能启动 MvpFast 并且快速的构建你自己的应用吧 ⚡

</br>

#### 启动一个本地服务

1.通过 github 仓库下载模板，购买的用户会邀请进入 github 仓库

```bash
git clone https://github.com/mvpfast/xxxxx.git
cd [xxx]
pnpm install
git remote remove origin
pnpm run dev
```

> 建议使用 Node 环境>= 20.0.0 （作者使用的环境）

</br>

2.新增一个`.env`配置文件

```json
DATABASE_URL="你的数据库url"
MAIL_HOST=xx
MAIL_PORT=xx
MAIL_USER=xx
MAIL_PASS=xx
NEXTAUTH_SECRET=mvpfast
NEXTAUTH_SALT=mvpfast
ALIYUN_ACCESS_KEY_ID=xx
ALIYUN_ACCESS_KEY_SECRET=xx
ALIYUN_SMS_SIGN_NAME=xx
ALIYUN_SMS_TEMPLATE_CODE=xx
NEXT_PUBLIC_API_URL=xx
NEXT_PUBLIC_WECHAT_APPID=xx
WECHAT_MCHID=xx
WECHAT_API_V3_KEY=xx
WECHAT_SERIAL_NO=xxx
WECHAT_PRIVATE_KEY=`-----BEGIN PRIVATE KEY-----
xxxx
-----END PRIVATE KEY-----`

```

</br>

3.打开 `http://localhost:3000` 可以看到你的网站‘

> 虽然你打开看到的会有报错，但是无关紧要

#### 项目结构

📁 **src/app** → 主业务文件

📁 **src/app/api** → API 路由

📁 **src/components** → 公用组件内容

📁 **src/lib** → 公用方法库

📁 **content** → 文档和博客 md 文件

📁 **prisma** → 数据库文件

</br>

#### config.ts

这是你存放项目配置的文件。你可以根据你需要的内容修改每个参数。

</br>

> 你已经成功的启动了项目了，接下来根据教程，开始构建你的应用吧。
