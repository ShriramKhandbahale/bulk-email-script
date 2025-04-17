import config from "config";

const templateConfig = config.get<{
  logo: string;
  accent: string[];
  orgTitle: string;
  orgDescription: string;
}>('template');

const emailConfig = config.get<{
  senderEmail: string;
  qrId: boolean;
}>('email');

export const emailTemplate = async (emailId: string, bodyContent: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 6px; }
    .header { background-color: ${templateConfig.accent[1]}; padding: 20px; text-align: center; border-top-left-radius: 6px; border-top-right-radius: 6px; }
    .header img { display: block; margin: 0 auto; }
    .header h2 { color: ${templateConfig.accent[0]}; margin: 10px 0 0; }
    .header p { color: ${templateConfig.accent[0]}; margin: 5px 0 0; }
    .content { padding: 30px; }
    .content h3 { color: #333; }
    .content p { font-size: 14px; line-height: 1.6; color: #555; }
    .qr-container { text-align: center; margin-bottom: 20px }
    .qr-container img { border-radius: 8px }
    .footer p { color: #333; }
    .footer a { color: #333; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${templateConfig.logo}" alt="Logo" width="60" height="60" />
      <h2>${templateConfig.orgTitle}</h2>
      <p>${templateConfig.orgDescription}</p>
    </div>
    <div class="content">
      ${bodyContent}
      <div class="qr-container">
        <img src="cid:qr-code" alt="QR Code" width="180" height="180" />
      </div>
      <div class="footer">
        <p>
          Love,<br />
          <strong>${templateConfig.orgTitle}</strong><br />
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`}