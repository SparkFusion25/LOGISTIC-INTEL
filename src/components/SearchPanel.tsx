// src/components/SearchPanel.tsx

import React, { useState } from 'react';
import { searchTradeData } from '../lib/api';
import { addToCRM } from '../lib/crm';

interface TradeEntry {
  company: string;
  name: string;
  city: string;
  commodity: string;
  contact: string;
  email: string;
  phone?: string;
}

const SearchPanel: React.FC = () => {
  const [filters, setFilters] = useState({
    company: '',
    name: '',
    city: '',
    commodity: '',
  });

  const [results, setResults] = useState<TradeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data: TradeEntry[] = await searchTradeData(filters);
      setResults(data);
      // Automatically add to CRM
      data.forEach(contact => addToCRM(contact));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Market Intelligence Search</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input name="company" placeholder="Company" onChange={handleChange} className="border p-2 rounded" />
        <input name="name" placeholder="Contact Name" onChange={handleChange} className="border p-2 rounded" />
        <input name="city" placeholder="City" onChange={handleChange} className="border p-2 rounded" />
        <input name="commodity" placeholder="Commodity" onChange={handleChange} className="border p-2 rounded" />
      </div>

      <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? 'Searching...' : 'Search'}
      </button>

      <div className="mt-6">
        {results.length > 0 && (
          <table className="w-full border mt-4">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Company</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">City</th>
                <th className="p-2 border">Commodity</th>
                <th className="p-2 border">Email</th>
              </tr>
            </thead>
            <tbody>
              {results.map((entry, index) => (
                <tr key={index} className="text-sm">
                  <td className="p-2 border">{entry.company}</td>
                  <td className="p-2 border">{entry.name}</td>
                  <td className="p-2 border">{entry.city}</td>
                  <td className="p-2 border">{entry.commodity}</td>
                  <td className="p-2 border">{entry.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;