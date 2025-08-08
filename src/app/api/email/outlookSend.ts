import { Client } from "@microsoft/microsoft-graph-client";

export async function sendWithOutlook(userToken, to, subject, body) {
  const client = Client.init({
    authProvider: (done) => {
      done(null, userToken.access_token);
    }
  });
  await client.api('/me/sendMail').post({
    message: {
      subject,
      body: { contentType: 'HTML', content: body },
      toRecipients: [{ emailAddress: { address: to } }],
    },
    saveToSentItems: 'true'
  });
}
