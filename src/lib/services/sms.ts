/**
 * 短信服务 (阿里云)
 *
 * @module @/lib/services/sms
 */

import Core from '@alicloud/pop-core';

const client = new Core({
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '',
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25',
});

async function sendPhone(
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; message: string; code?: string }> {
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
