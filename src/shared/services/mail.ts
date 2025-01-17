import nodemailer from "nodemailer";
import { env } from "~/env";

type SendMailProps = {
  to: string;
  subject?: string;
  text?: string;
  html?: string;
};

const user = env.NODEMAILER_MAIL;
const pass = env.NODEMAILER_PASS;

export async function sendMail(props: SendMailProps) {
  const {
    to,
    html = "<p>Hello</p>",
    text = "Mail text",
    subject = "Subject mail",
  } = props;

  const from = `Lucas DEV <${user}>`;
  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  await transporter
    .sendMail({ from, to, subject, text, html })
    .catch((error) => console.log(error));
}
