import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface SelectedDataProps {
  selectedData: {
    ticker: string;
    company_name: string;
  };
}

const IPOAITickersMain: React.FC<SelectedDataProps> = ({ selectedData }) => {
  const [comparativeTickers, setComparativeTickers] = useState<string[]>([]);
  const navigate = useNavigate();

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
          `${apiUrl}/api/converts/distinct/`,
          {
            ticker: selectedData.ticker,
            company_name: selectedData.company_name,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: token ? `Bearer ${token}` : '',
            },
          }
        );
        // setComparativeTickers(response.data || []);
      } catch (error: any) {
        console.error('Failed to fetch comparative tickers:', error);

        if (error.response && error.response.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login'; // refresh and redirect
        }
      }
    };

    if (selectedData?.ticker && selectedData?.company_name) {
      fetchComparativeTickers();
    }
  }, [selectedData]);

  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '1rem', flexWrap: 'wrap' }}>
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
