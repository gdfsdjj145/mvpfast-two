---
key: phone
title: 手机号登录功能
description: 手机号登录功能
order: 6
---

### 使用 SMS 服务开启手机登录功能

**MVPFAST**集成了手机号码登录功能，国内的用户使用手机号码登录会比较常见，我们使用的是阿里云的 SMS 服务

- `ALIYUN_ACCESS_KEY_ID`=阿里云账号 ACCESS_KEY
- `ALIYUN_ACCESS_KEY_SECRET`=阿里云账号 SECRET_KEY
- `ALIYUN_SMS_SIGN_NAME`=sms 服务签名
- `ALIYUN_SMS_TEMPLATE_CODE`=sms 发送模板

### 1.购买阿里云 SMS 服务

去阿里云官方搜索 SMS 短信服务，进入产品首页

![sms](/docs/assets/sms.png)

进入购买页面，阿里云的 SMS 服务价格还算可以，1000 条 50 元

![sms1](/docs/assets/sms1.png)

购买完短信服务后，进入【短信服务】控制台，进入【快速学习和测试】，可以进行学习，完成学习之后你可以获得**MVPFAST**短息服务所需的变量字段

- 资质：申请签名的实名化信息
- 签名：短信发送者的属性字段
- 模板：发送的短信模板

![sms2](/docs/assets/sms2.png)

### 2.申请资质

在新增资质页面填写相关信息，阿里云审核 sms 服务的时间大约为两小时左右

![sms3](/docs/assets/sms3.png)

### 3.新增签名

新增签名必须要在资质申请成功后

- 签名：你网站的名称，例如**MVPFAST**
- 资料：可以上传网站截图，审核会快点

![sms4](/docs/assets/sms4.png)

### 4.新增模板

申请模板，在页面中填写信息，可以使用【常用模板推荐】，选择【登录/验证】模板即可。

![sms5](/docs/assets/sms5.png)

### 5.获取 AccessKey 和 AccessSecret

在阿里云点击右上角【AccessKey 管理】

![sms6](/docs/assets/sms6.png)

进入之后选择阿里云建议的使用**子用户**

![sms7](/docs/assets/sms7.png)

创建子用户之后可以复制**AccessKey**和**AccessSecret**

![sms8](/docs/assets/sms8.png)

完成上面的操作之后，可以在【国内信息】页面获取所需的环境变量属性

![sms9](/docs/assets/sms9.png)

### 6.完成

完成上面配置之后，就可以使用 SMS 服务了，**MVPFAST**的 sms 服务封装在`lib/phone`

```js
import Core from '@alicloud/pop-core';

// 创建阿里云客户端实例
const client = new Core({
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25',
});

// 发送手机验证码的函数
async function sendPhone(
  phoneNumber: string,
  code: string
): Promise<{ success: boolean, message: string, code?: string }> {
  const params = {
    PhoneNumbers: phoneNumber,
    SignName: process.env.ALIYUN_SMS_SIGN_NAME,
    TemplateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE,
    TemplateParam: JSON.stringify({ code }),
  };

  const requestOption = {
    method: 'POST',
  };

  try {
    const result: any = await client.request('SendSms', params, requestOption);

    if (result.Code === 'OK') {
      // 在实际应用中，您应该将验证码保存到数据库或缓存中，而不是直接返回
      return { success: true, message: '验证码发送成功', code };
    } else {
      return { success: false, message: `发送失败: ${result.Message}` };
    }
  } catch (error) {
    console.error('发送验证码时出错:', error);
    return { success: false, message: '发送验证码时发生错误' };
  }
}

export default sendPhone;
```
