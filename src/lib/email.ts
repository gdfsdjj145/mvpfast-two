import * as nodemailer from 'nodemailer';

export interface MailInfo {
  // 目标邮箱
  to: string;
  // 标题
  subject: string;
  // 文本
  text?: string;
  // 富文本，如果文本和富文本同时设置，富文本生效。
  html?: string;
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
    const result = await transporter.sendMail({
      from: `MvpFast <${process.env.MAIL_USER}>`,
      ...mailInfo,
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
