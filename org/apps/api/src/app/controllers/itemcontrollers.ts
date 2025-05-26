import { Request, Response } from 'express';
import { SendEmail } from '../email/emailsender';

export function PostForm(req: Request, res: Response) {
  const formData = req.body;
  console.log('Dữ liệu nhận được:', formData);

  // TODO: Xử lý lưu database, gửi mail,... tùy ý

  // Trả lại dữ liệu nhận được cho client
  return res.status(200).json({
    message: 'Đăng ký thành công',
    dataReceived: formData,
  });
}

export async function SendEmailController(req: Request, res: Response) {
  const { to, subject, text, html } = req.body;
  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Thiếu trường bắt buộc' });
  }

  try {
    await SendEmail(to, subject, text, html);
    return res.status(200).json({ message: 'Email đã được gửi' });
  } catch (error) {
    console.error('Error in SendEmailController:', error);
    return res.status(500).json({ error: 'Lỗi khi gửi email' });
  }
}

export const HelloWorldController = (req: Request, res: Response) => {
  res.status(200).send('Hello World');
};
