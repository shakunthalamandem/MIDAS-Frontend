import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Chip, CircularProgress } from "@mui/material";

interface Props {
  selectedData: {
    ticker_name?: string;
    company_name?: string;
    exchange?: string;
  };
}

const IPOAITickersMain: React.FC<Props> = ({ selectedData }) => {
  const [comparativeTickers, setComparativeTickers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });

  useEffect(() => {
    const fetchComparativeTickers = async () => {
      setLoading(true);
      setError(null);

      try {
        const payload = {
          ticker: selectedData?.ticker_name ,
          company_name: selectedData?.company_name ,
          exchange: selectedData?.exchange ,
        };

        const response = await axios.post(
          `${apiUrl}/api/ipo_ai_compititors/`,
          payload,
          { headers: getAuthHeaders() }
        );

        // Fix TypeScript error by casting response type
        const data = response.data as { comps: { Comp_Ticker: string }[] };
        const comps = data.comps || [];
        const tickers = comps.map((item) => item.Comp_Ticker);
        setComparativeTickers(tickers);
      } catch (err: any) {
        console.error("Error fetching comparative tickers:", err);
        setError("Failed to load comparative tickers.");
      } finally {
        setLoading(false);
      }
    };

    if (selectedData?.ticker_name) {
      fetchComparativeTickers();
    }
  }, [selectedData]);

  return (
    <Box mt={2}>
    

      {loading ? (
        <CircularProgress size={24} />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : comparativeTickers.length > 0 ? (
        <Box display="flex" flexWrap="wrap" gap={1}>
          {comparativeTickers.map((ticker, idx) => (
            <Chip key={idx} label={ticker} color="primary" />
          ))}
        </Box>
      ) : (
        <Typography>No comparable tickers found.</Typography>
      )}
    </Box>
  );
};

export default IPOAITickersMain;
