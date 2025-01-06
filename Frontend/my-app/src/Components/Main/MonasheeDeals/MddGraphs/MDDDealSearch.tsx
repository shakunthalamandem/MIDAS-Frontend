import React, { useState } from 'react';

// Define the type for the API response
interface MDDResult {
  ticker_us: string;
  issuer_name: string;
}

const MDDDealSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [results, setResults] = useState<MDDResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://192.168.1.59:9000/api/mdd_search/${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data: MDDResult[] = await response.json(); // Type the response
      setResults(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          marginBottom: '20px',
        }}
      />
      {loading && <p>Loading...</p>}
      <ul>
        {results.map((item, index) => (
          <li key={index}>
            <strong>{item.ticker_us}</strong>: {item.issuer_name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MDDDealSearch;
