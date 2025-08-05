// src/components/widgets/CRMPanel.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { fetchCRMContacts, updateCRMContactNote } from '../../lib/crm';

interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  city?: string;
  commodity?: string;
  last_contacted?: string;
  notes?: string;
}

const CRMPanel: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteEdits, setNoteEdits] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await fetchCRMContacts();
        setContacts(data);
      } catch (err) {
        console.error('Failed to fetch CRM contacts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  const handleNoteChange = (id: string, value: string) => {
    setNoteEdits(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveNote = async (id: string) => {
    const note = noteEdits[id];
    if (!note) return;
    try {
      await updateCRMContactNote(id, note);
      const updated = contacts.map(c => (c.id === id ? { ...c, notes: note } : c));
      setContacts(updated);
      setNoteEdits(prev => {
        const updatedEdits = { ...prev };
        delete updatedEdits[id];
        return updatedEdits;
      });
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">My CRM Contacts</h2>
      {loading ? (
        <p>Loading contacts...</p>
      ) : contacts.length === 0 ? (
        <p>No CRM contacts found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Company</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">City</th>
                <th className="p-2 border">Commodity</th>
                <th className="p-2 border">Last Contacted</th>
                <th className="p-2 border">Notes</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr key={contact.id}>
                  <td className="p-2 border">{contact.name}</td>
                  <td className="p-2 border">{contact.company}</td>
                  <td className="p-2 border">{contact.email}</td>
                  <td className="p-2 border">{contact.city}</td>
                  <td className="p-2 border">{contact.commodity}</td>
                  <td className="p-2 border">{contact.last_contacted || '—'}</td>
                  <td className="p-2 border">
                    <textarea
                      className="w-full p-1 border rounded"
                      value={noteEdits[contact.id] ?? contact.notes ?? ''}
                      onChange={e => handleNoteChange(contact.id, e.target.value)}
                      rows={2}
                    />
                    <button
                      onClick={() => handleSaveNote(contact.id)}
                      className="mt-1 bg-blue-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CRMPanel;