---
order: 1
key: mongodb
title: 数据库Mongo
description: 数据库
---

### Mongodb Altas

Altas 是 mongodb 提供的一种免费的 Daas 解决方案，既云数据平台，我们可以免费使用，方便，快捷的创建自己的数据库

### 1.登录注册账号

登录 mongo Altas 官网注册账号，推荐使用**邮箱账号**注册登录，google 和 github 的登录服务经常不行

![mongo](/docs/assets/mongo.png)

### 2.创建项目

进入主页面之后，找到页面的【Create Project】按钮创建项目，创建项目时输入项目的名称

![mongo1](/docs/assets/mongo1.png)

### 3.创建集群【Cluster】

进入【project】页面后，我们可以找到**【Overview】**页面中的创建集群按钮，去创建我们第一个集群

![mongo2-1](/docs/assets/mongo2-1.png)

创建集群的时候我们选择**【M0】**集群，是免费的，足够支持多个应用，后期如果应用的流量大了，就可以升级服务。供应商我们选择亚马逊的**【aws】**，比较稳定。区域建议选择**【香港】**。这些配置都是作者**个人推荐**，实际可以根据开发者需求来自己选择。

![mongo2](/docs/assets/mongo2.png)

集群创建之后我们要选择我们集群的链接模式，这里选择**【Drivers】**模式之后下一步

![mongo3](/docs/assets/mongo3.png)

在这里我们等待集群部署，大约 1 分钟左右，会在下方生成集群的链接密钥，选择**【Show Password】**然后复制这个密钥，这个密钥就是我们链接自己数据库的密钥，项目中**【DATABASE_URL】**变量就是这个密钥，你可以对比项目的密钥将关键词修改成你的信息

![mongo4](/docs/assets/mongo4.png)

> **注意，从这里复制的数据库连接串缺少了数据库的字段，请对比本章最后代码添加数据库的字段**

</br>

### 4.创建数据库

集群创建完成之后，需要我们创建数据库，返回**集群页面**，点击进入**集群详情页面**

![mongo5](/docs/assets/mongo5.png)

选择**【collections】**的 tag 进入数据库页面，根据图示新增数据库

![mongo6](/docs/assets/mongo6.png)

创建数据库，输入数据库名称

![mongo7](/docs/assets/mongo7.png)

此时我们已经成功的创建了我们的数据库了，做到这一步我们就完成了数据库的**所有准备工作**了。

![mongo8](/docs/assets/mongo8.png)

这是**mvpfast**中**DATABASE_URL**环境变量，你可以根据刚刚获得的数据库密钥进行修改

```json
DATABASE_URL="mongodb+srv://你的链接密钥/数据库名称?retryWrites=true&w=majority&appName=集群名称"
```

#### 提示

如果字符串是对的情况下，还是无法链接数据库，请在**Network**菜单添加**IP**。

![image-20241212162706403](/docs/assets/mongo8.png)
