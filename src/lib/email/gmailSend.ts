interface UserToken {
  provider: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
}

export async function sendWithGmail(
  userToken: UserToken,
  to: string,
  subject: string,
  body: string
): Promise<void> {
  try {
    // Check if access token is expired and refresh if needed
    let accessToken = userToken.access_token;
    
    if (userToken.expires_at && new Date(userToken.expires_at) <= new Date()) {
      // Token expired, refresh it
      if (userToken.refresh_token) {
        accessToken = await refreshGmailToken(userToken.refresh_token);
      } else {
        throw new Error('Access token expired and no refresh token available');
      }
    }

    // Create the email message
    const messageParts = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'MIME-Version: 1.0',
      '',
      body
    ];
    const message = messageParts.join('\n');

    // Encode the message in base64url format
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send the email using Gmail API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gmail API error:', errorData);
      throw new Error(`Gmail API error: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log('Email sent successfully via Gmail:', result.id);

  } catch (error) {
    console.error('Error sending email via Gmail:', error);
    throw error;
  }
}

async function refreshGmailToken(refreshToken: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Gmail token');
  }

  const data = await response.json();
  return data.access_token;
}