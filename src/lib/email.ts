import * as nodemailer from 'nodemailer';

export interface MailInfo {
  // 目标邮箱
  to: string;
  // 验证码
  code: string;
}

const sendEmail = async (mailInfo: MailInfo) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: +(process.env.MAIL_PORT || 465),
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    const styledCode = mailInfo.code
      .split('')
      .map(
        (char) =>
          `<span style="font-size: 24px; color: #FF5733; padding: 10px; border: 2px solid #FF5733; border-radius: 5px; display: inline-block; margin: 0 2px;">${char}</span>`
      )
      .join('');
    const result = await transporter.sendMail({
      to: mailInfo.to,
      from: `MvpFast <${process.env.MAIL_USER}>`,
      subject: 'MvpFast登录验证码',
      html: `
       <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; max-width: 600px; text-align: center; background-color: #f9f9f9;">
          <h2 style="color: #4CAF50;">欢迎使用MvpFast服务!</h2>
          <p style="text-align: left;">亲爱的用户,</p>
          <p style="text-align: left;">感谢您的使用，以下是你本次的验证码，验证码在两分钟内有效:</p>
          <div style="display: flex; justify-content: center;">${styledCode}</div>
          <p style="text-align: left;">谢谢</p>
          <footer style="margin-top: 20px; font-size: 12px; color: #777;">
            如果您没有请求此验证码，请忽略此邮件。
          </footer>
        </div>
      `,
    });

    if (result.messageId) {
      // 在实际应用中，您应该将验证码保存到数据库或缓存中，而不是直接返回
      return {
        success: true,
        message: '验证码发送成功',
        messageId: result.messageId,
      };
    } else {
      return { success: false, message: `发送失败: ${result.messageId}` };
    }
  } catch (error) {
    console.error('发送验证码时出错:', error);
    return { success: false, message: '发送验证码时发生错误' };
  }
};

export default sendEmail;
