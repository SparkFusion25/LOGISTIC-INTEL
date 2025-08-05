import React, { useState } from 'react';
import { searchTradeData } from '../lib/api'; // API function to call your backend search logic
import { TradeEntry } from '../types/TradeEntry'; // Import the proper type
import CRMPanel from './CRMPanel';

const SearchPanel = () => {
  const [filters, setFilters] = useState({
    company: '',
    country: '',
    city: '',
    state: '',
    hsCode: '',
    commodity: '',
    mode: '', // air, ocean, or domestic
  });
  const [results, setResults] = useState<TradeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const data = await searchTradeData(filters); // Replace with actual API integration
    setResults(data);
    setLoading(false);
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white p-6 rounded shadow-md mb-8">
      <h2 className="text-xl font-bold mb-4">Trade Lookup</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {['company', 'country', 'city', 'state', 'hsCode', 'commodity', 'mode'].map(field => (
          <input
            key={field}
            placeholder={`Search by ${field}`}
            className="border p-2 rounded w-full"
            value={(filters as any)[field]}
            onChange={e => updateFilter(field, e.target.value)}
          />
        ))}
      </div>

      <button onClick={handleSearch} className="bg-blue-700 text-white px-4 py-2 rounded">
        Search
      </button>

      {loading && <p className="mt-4 text-sm">Loading results...</p>}

      <div className="mt-6">
        {results.length > 0 ? (
          results.map((entry, idx) => (
            <div key={idx} className="border p-4 mb-2 bg-gray-50 rounded">
              <h3 className="font-bold text-md">{entry.company}</h3>
              <p className="text-sm">City: {entry.city} | Commodity: {entry.commodity}</p>
              <p className="text-sm">Contact: {entry.contactEmail}</p>
              <CRMPanel prefillData={entry} />
            </div>
          ))
        ) : (
          !loading && <p className="text-sm text-gray-500">No results found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;