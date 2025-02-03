import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import InvestScreenerMain from './InvestScreenerMain';
import CumulativeReturns from '../../TechnicalIndicators/CumulativeReturns';
import CumulativeChart from './CumulativeChart';

interface InvestScreenerAPIProps {
  appliedValues: any;
}

const InvestScreenerAPI: React.FC<InvestScreenerAPIProps> = ({ appliedValues }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRows, setTotalRows] = useState(0); // Total rows from API
  const [tickers, setTickers] = useState<string[]>([]); // State to store tickers

  useEffect(() => {
    const transformAppliedValues = (values: any) => {
      if (!values) {
        return {}; // Return an empty object if values is null or undefined
      }
      return {
        ...values.Fundamentals,
        ...values.MonasheeSpecific,
        ...values.Technicals,
      };
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null); // Reset error state before new request
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error("API URL is not defined");
        }

        const transformedValues = transformAppliedValues(appliedValues);

        const response = await fetch(`${apiUrl}/api/investment_screener/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(transformedValues),
        });

        if (response.ok) {
          const data = await response.json();
          const rows = Array.isArray(data.data) ? data.data : [];
          setRows(rows);
          setTotalRows(data.pagination?.total_items || 0);

          // Extract tickers from the response data
          const extractedTickers = rows.map((row: any) => row.ticker);
          setTickers(extractedTickers); // Set tickers state
        } else {
          throw new Error("Failed to fetch investment screener data");
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setRows([]); // Reset rows on error
        setError(error.message || "An error occurred while fetching investment screener data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appliedValues]);

  return (
    <Box mb={10}>
      <Box mt={5} mb={5}>
        {error && (
          <Typography color="error" variant="body1">
            {error}
          </Typography>
        )}
      </Box>

      {/* Pass the fetched data to the grid component */}
      <InvestScreenerMain rows={rows} loading={loading} totalRows={totalRows} />
      <CumulativeReturns tickerList={tickers} />
      <CumulativeChart />
    </Box>
  );
};

export default InvestScreenerAPI;
