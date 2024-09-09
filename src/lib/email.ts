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
          `<span style="font-size: 32px; color: #FF5733; padding: 15px; border: 2px solid #FF5733; border-radius: 10px; display: inline-block; margin: 0 5px; background-color: #fff;">${char}</span>`
      )
      .join('');
    const result = await transporter.sendMail({
      to: mailInfo.to,
      from: `MvpFast <${process.env.MAIL_USER}>`,
      subject: 'MvpFast登录验证码',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f9f9f9; padding: 40px; border-radius: 10px; max-width: 600px; margin: auto;">
          <h1 style="color: #333;">MvpFast</h1>
          <h2 style="color: #333;">欢迎使用MvpFast服务🎉</h2>
          <p style="font-size: 20px; color: #333;">你的验证码是:</p>
          <div style="display: flex; justify-content: center; margin: 20px 0;">
            ${styledCode}
          </div>
          <p style="color: #666;">验证码在2分钟内有效</p>
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
