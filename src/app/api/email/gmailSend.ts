import { google } from 'googleapis';

export async function sendWithGmail(userToken, to, subject, body) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/gmail/callback'
  );
  oAuth2Client.setCredentials({
    access_token: userToken.access_token,
    refresh_token: userToken.refresh_token,
  });

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  const messageParts = [
    `From: "Logistic Intel" <${userToken.email}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    body,
  ];
  const message = Buffer.from(messageParts.join('\n')).toString('base64');
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: message },
  });
  return res.data;
}
