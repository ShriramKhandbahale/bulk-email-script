import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import nodemailer from 'nodemailer';
import config from "config"
import { emailTemplate } from './utils/templates';
import qrcode from "qrcode"

const emailConfig = config.get<{
  senderEmail: string;
  appPassword: string;
}>('email');


const templateConfig = config.get<{
  logo: string;
  accent: string[];
  orgTitle: string;
  orgDescription: string;
}>('template')

interface Recipient {
  name: string;
  email: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailConfig.senderEmail,
    pass: emailConfig.appPassword,
  },
});

const generateQrBuffer = async (email: string): Promise<Buffer> => {
  return await qrcode.toBuffer(email);
};

const sendEmail = async (recipient: Recipient) => {
  const qrBuffer = await generateQrBuffer(recipient.email);

  const htmlContent = await emailTemplate(recipient.email, `
    <p>Hello ${recipient.name}</p>
    <p>
      Nice to Meet you<br>
      It is such a lovely day.<br><br>  
    </p>
  `);

  const mailOptions = {
    from: `"${templateConfig.orgTitle}" <${emailConfig.senderEmail}>`,
    to: recipient.email,
    subject: `Hello ${recipient.name}`,
    html: htmlContent,
    attachments: [{
      filename: 'qr.png',
      content: qrBuffer,
      cid: 'qr-code',
    }]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`email sent to: ${recipient.email}`);
  } catch (error) {
    console.error(`error: ${recipient.email}:`, error);
  }
};



(() => {
  const recipients: Recipient[] = [];

  fs.createReadStream(path.join(__dirname, '../data/', 'recipients.csv'))
    .pipe(csvParser())
    .on('data', (row) => {
      recipients.push({ name: row.name, email: row.email });
    })
    .on('end', async () => {
      console.log(`total emails to be sent: ${recipients.length}`);
      for (const [index, recipient] of recipients.entries()) {
        console.log(`sending email ${index + 1}/${recipients.length} to ${recipient.email}`);
        await sendEmail(recipient);
      }
      console.log('execution completed');
    });
}
)()