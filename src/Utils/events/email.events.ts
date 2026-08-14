import { EventEmitter } from "node:events";
import Mail from "nodemailer/lib/mailer";
import { template } from "../email/verify.email.template";
import { sendEmail } from "../email/send.email";
export const emailEvents = new EventEmitter();

interface IEmail extends Mail.Options {
  otp: string;
  username: string;
}

emailEvents.on("confirmEmail", async (data: IEmail) => {
  try {
    data.subject = "Confirm Your Email";
    data.html = template(data.otp, data.username, data.subject);
    await sendEmail(data);
  } catch (error) {
    console.log("Faild to send email", error);
  }
});
