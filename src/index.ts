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
  return await qrcode.toBuffer(email, {
    color: {
      dark: templateConfig.accent[0],
      light: templateConfig.accent[1]
    }
  });
};

const sendEmail = async (recipient: Recipient) => {
  const qrBuffer = await generateQrBuffer(recipient.email);

  const htmlContent = await emailTemplate(recipient.email, `
    <p>Hello <strong>${recipient.name}</strong>,</p>
    <p>Welcome to the Mumbai Bookies community</p>
    <p>I'm glad that you're going to join us this time. We're super excited to read with you!</p>
    <p>Whether you’re here to dive into the depths of literature, discover hidden gems, or simply enjoy the company of fellow book lovers, this community is going to be a space where we read, and we can belong!</p>
    <p>Please join the WhatsApp group below for location and other updates (don't forget to check the group description)</p>
    <p><a href="https://chat.whatsapp.com/I4ga8C0mZC6II49RhxgHGg">Click here to join the Whatsapp group</a></p>
    <p><strong>Please only join if you intend to actually come this Sunday :)</strong></p>
    <p>SEE YOU ON SUNDAY</p>
    <br>
  `);

  const mailOptions = {
    from: `"${templateConfig.orgTitle}" <${emailConfig.senderEmail}>`,
    to: recipient.email,
    subject: `YOU MADE IT TO MUMBAI BOOKIES ${recipient.name.split(" ")[0].toUpperCase()}!`,
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