interface OutreachHistoryItem {
  id: string;
  contactId: string;
  platform: 'gmail' | 'linkedin' | 'outlook';
  type: 'sent' | 'opened' | 'replied' | 'clicked' | 'bounced';
  subject?: string;
  snippet?: string;
  fullContent?: string;
  timestamp: string;
  engagementStatus: string;
  threadId?: string;
  campaignId?: string;
  campaignName?: string;
  linkedinUrl?: string;
  gmailMessageId?: string;
  contact?: {
    id: string;
    name: string;
    email: string;
    company: string;
  };
}

interface OutreachHistoryResponse {
  data: OutreachHistoryItem[];
  total: number;
  hasMore: boolean;
}

export async function getOutreachHistory(
  contactId: string,
  options?: {
    platform?: string;
    limit?: number;
    offset?: number;
  }
): Promise<OutreachHistoryResponse> {
  const params = new URLSearchParams({
    contactId,
    ...(options?.platform && { platform: options.platform }),
    ...(options?.limit && { limit: options.limit.toString() }),
    ...(options?.offset && { offset: options.offset.toString() }),
  });

  const response = await fetch(`/api/outreach-history?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch outreach history: ${response.statusText}`);
  }

  return response.json();
}

export async function createOutreachHistoryEntry(data: {
  contactId: string;
  platform: 'gmail' | 'linkedin' | 'outlook';
  type: 'sent' | 'opened' | 'replied' | 'clicked' | 'bounced';
  subject?: string;
  snippet?: string;
  fullContent?: string;
  engagementStatus?: string;
  threadId?: string;
  campaignId?: string;
  linkedinUrl?: string;
  gmailMessageId?: string;
}): Promise<{ data: OutreachHistoryItem }> {
  const response = await fetch('/api/outreach-history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create outreach history entry: ${response.statusText}`);
  }

  return response.json();
}

export async function syncGmailHistory(contactEmail: string, accessToken: string) {
  // This function would integrate with Gmail API to sync email history
  // Implementation would depend on Gmail OAuth setup
  try {
    const response = await fetch('/api/gmail/sync-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ contactEmail }),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync Gmail history: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error syncing Gmail history:', error);
    throw error;
  }
}

export async function syncLinkedInHistory(contactLinkedInUrl: string, phantomBusterApiKey: string) {
  // This function would integrate with PhantomBuster API to sync LinkedIn activity
  try {
    const response = await fetch('/api/linkedin/sync-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': phantomBusterApiKey,
      },
      body: JSON.stringify({ contactLinkedInUrl }),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync LinkedIn history: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error syncing LinkedIn history:', error);
    throw error;
  }
}