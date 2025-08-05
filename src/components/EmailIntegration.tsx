import React, { useState } from 'react';

const EmailIntegration = () => {
  const [provider, setProvider] = useState<'gmail' | 'outlook' | null>(null);
  const [status, setStatus] = useState('');

  const connectEmail = async (service: 'gmail' | 'outlook') => {
    setStatus('Connecting...');
    // This will trigger backend OAuth endpoint flow
    window.location.href = `/api/oauth/${service}`;
  };

  return (
    <div className="bg-white p-6 rounded shadow-md mb-8">
      <h2 className="text-xl font-bold mb-4">Email Sync & Outreach</h2>
      <p className="text-sm mb-2 text-gray-600">
        Connect your email provider to send outreach and receive real-time read notifications.
      </p>

      <div className="space-x-4 mb-4">
        <button
          onClick={() => connectEmail('gmail')}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Connect Gmail
        </button>
        <button
          onClick={() => connectEmail('outlook')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Connect Outlook
        </button>
      </div>

      {status && <p className="text-sm text-gray-500">{status}</p>}
    </div>
  );
};

export default EmailIntegration;