interface UserToken {
  provider: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
}

export async function sendWithOutlook(
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
        accessToken = await refreshOutlookToken(userToken.refresh_token);
      } else {
        throw new Error('Access token expired and no refresh token available');
      }
    }

    // Create the email message for Microsoft Graph API
    const emailMessage = {
      message: {
        subject: subject,
        body: {
          contentType: 'Text',
          content: body
        },
        toRecipients: [
          {
            emailAddress: {
              address: to
            }
          }
        ]
      }
    };

    // Send the email using Microsoft Graph API
    const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailMessage)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Outlook API error:', errorData);
      throw new Error(`Outlook API error: ${response.status} - ${errorData}`);
    }

    console.log('Email sent successfully via Outlook');

  } catch (error) {
    console.error('Error sending email via Outlook:', error);
    throw error;
  }
}

async function refreshOutlookToken(refreshToken: string): Promise<string> {
  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Send',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Outlook token');
  }

  const data = await response.json();
  return data.access_token;
}