---
order: 4
key: vercel
title: 部署到Vercel
description: Vercel的介绍
---

# Vercel（CI/CD）

Vercel 是一个现代化的云平台，专为前端开发者和团队设计。它提供了一种简单而强大的方式来部署和扩展 Web 应用程序。Vercel 和 NEXTJS 都是出自他们团队，可以说这两个工具配合开发，用起来无比顺滑。

### 1.注册 vercel

vercel 提供多种登录方式，推荐使用**github**方式登录，vercel 也是主要通过 github 仓库进行项目部署

![vercel](/docs/assets/vercel.png)

### 2.选择部署的项目

点击**【Add New】**按钮，选择**【Project】**新增项目

![vercel1](/docs/assets/vercel1.png)

选择你已经在**github**的项目，直接点击**【import】**

![vercel2](/docs/assets/vercel2.png)

### 3.部署配置

在配置方面，不得不赞一下**Vercel**，基本上不需要怎么配置东西，直接走默认配置就好了，工具已经帮你识别好了，用什么框架，不需要选择

![vercel3](/docs/assets/vercel3.png)

点击部署之后等待，时间在两分钟以内就可以部署完成了，然后点击**【Continue to Dashboard】** 进入项目详情

![vercel4](/docs/assets/vercel4.png)

### 4.域名配置

部署成功后会生成一个访问地址，因为 Vercel 是国外团队的产品，服务器部署在国外，我们想要国内用户能访问的话需要做**域名解析**，我们可以点击**【Domains】**进行域名的配置

![vercel5](/docs/assets/vercel5.png)

进入**Domains**页面，在输入框输入你购买的域名，点击**【Add】**，跟着图片指引操作

![vercel6](/docs/assets/vercel6.png)

![vercel7](/docs/assets/vercel7.png)

**【Add】**之后，它会提示无法解析，这是正确的，因为你还没到你的**域名供应商**做域名解析

![vercel8](/docs/assets/vercel8.png)

这里举例阿里云，你只需要将它给你提供的两个解析项添加到你的域名解析里面，就可以了

![vercel9](/docs/assets/vercel9.png)

配置完之后等待**Vercel**重新解析域名，不需要操作，它会自动，只要显示蓝色的勾，证明已经解析完成了

![vercel10](/docs/assets/vercel10.png)

其实到这一步，普通的项目已经可以在国内访问了，但是**MVPFAST**不一样，为了安全性考虑和 AUTH 的要求，**Vercel**不能读取.env`文件里面的变量，所以我们需要手动导入`.env`的环境变量

### 5.手动导入环境变量配置

选择环境变量选项，点击**【import .env】**按钮，选择项目中的`.env`文件，前提是`.env`文件里面的变量已经完全配好了，导入之后点击**【Save】**按钮

![vercel11](/docs/assets/vercel11.png)

之后返回**【Deployment】**页面，重新运行一遍环境，既可以部署成功

![vercel12](/docs/assets/vercel12.png)

🤓 当你看到下面这个页面，你已经成功的部署了**MVPFAST**，接下来就是去开发你自己的应用吧

![vercel13](/docs/assets/vercel13.png)
