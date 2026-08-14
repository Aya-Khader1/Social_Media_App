import Mail from "nodemailer/lib/mailer";
import { BadRequestException } from "../response/error.response";
import { createTransport } from "nodemailer";
import { env } from "./../../config/config";
export const sendEmail = async (data: Mail.Options): Promise<void> => {
  if (!data.html && !data.attachments?.length && !data.text) {
    throw new BadRequestException("Missing Email Content");
  }
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_USERNAME,
      pass: env.EMAIL_PASSWORD,
    },
  });
  await transporter.sendMail({
    ...data,
    from: `"Social Media Application"<${env.EMAIL_USERNAME}>`,
  });
};
