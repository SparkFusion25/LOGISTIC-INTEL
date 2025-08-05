import React, { useState } from 'react';
import { saveLeadToCRM } from '../lib/api';

const CRMPanel = ({ prefillData }: { prefillData?: any }) => {
  const [lead, setLead] = useState({
    name: prefillData?.contact || '',
    email: prefillData?.email || '',
    phone: '',
    notes: `Company: ${prefillData?.company || ''} | Tradelane: ${prefillData?.tradelane || ''} | Commodity: ${prefillData?.commodity || ''}`,
  });

  const [status, setStatus] = useState('');

  const saveLead = async () => {
    setStatus('Saving...');
    await saveLeadToCRM(lead);
    setStatus('Lead saved to CRM.');
  };

  return (
    <div className="mt-2">
      <div className="grid grid-cols-2 gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Name"
          value={lead.name}
          onChange={e => setLead({ ...lead, name: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Email"
          value={lead.email}
          onChange={e => setLead({ ...lead, email: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Phone"
          value={lead.phone}
          onChange={e => setLead({ ...lead, phone: e.target.value })}
        />
        <textarea
          className="border p-2 rounded col-span-2"
          placeholder="Notes"
          value={lead.notes}
          onChange={e => setLead({ ...lead, notes: e.target.value })}
        />
      </div>
      <button
        onClick={saveLead}
        className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
      >
        Save to CRM
      </button>
      {status && <p className="text-xs mt-1 text-gray-500">{status}</p>}
    </div>
  );
};

export default CRMPanel;