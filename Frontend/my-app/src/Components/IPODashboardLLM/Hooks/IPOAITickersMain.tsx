import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface SelectedDataProps {
  selectedData: {
    ticker: string;
    company_name: string;
    exchange: string;
  };
}

// Define type for each competitor entry
interface Comp {
  Comp_Ticker: string;
}

// Define the expected API response type
interface APIResponse {
  comps: Comp[];
}

const IPOAITickersMain: React.FC<SelectedDataProps> = ({ selectedData }) => {
  const [comparativeTickers, setComparativeTickers] = useState<string[]>([]);

  useEffect(() => {
    const fetchComparativeTickers = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem('access_token');

      if (!apiUrl) {
        console.error('API URL is not defined');
        return;
      }

      try {
        const response = await axios.post(
          `${apiUrl}/api/ipo_ai_compititors/`,
          {
            ticker: selectedData.ticker,
            company_name: selectedData.company_name,
            exchange: selectedData.exchange,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: token ? `Bearer ${token}` : '',
            },
          }
        );

        // Cast the response to the expected type
        const data = response.data as APIResponse;
        console.log('Comparative tickers fetched:', data);
        const comps = data.comps || [];
        const tickers = comps.map((item) => item.Comp_Ticker);
        setComparativeTickers(tickers);
      } catch (error: any) {
        console.error('Failed to fetch comparative tickers:', error);
      }
    };

    if (
      selectedData?.ticker &&
      selectedData?.company_name &&
      selectedData?.exchange
    ) {
      fetchComparativeTickers();
    }
  }, [selectedData]);

  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        padding: '1rem',
        flexWrap: 'wrap',
      }}
    >
      {comparativeTickers.length > 0 ? (
        comparativeTickers.map((ticker, index) => (
          <span key={index} style={{ fontWeight: 'bold', color: '#6a1b9a' }}>
            {ticker}
          </span>
        ))
      ) : (
        <div>No comparative tickers found</div>
      )}
    </div>
  );
};

export default IPOAITickersMain;
