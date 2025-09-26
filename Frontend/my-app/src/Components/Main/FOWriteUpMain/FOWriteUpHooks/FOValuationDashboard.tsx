// FOValuationDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  Box,
  Typography,


} from "@mui/material";



import FOValuationWriteup from "../FOWriteSections/FOValuationWriteup";

import FOBusinessDetails from "../FOWriteSections/FOBusinessDetails";

interface ChildProps {
  ticker: string;
  deal_id: string;
}

interface ApiResponse {
  [key: string]: Record<string, any>;
}

const FOValuationDashboard: React.FC<ChildProps> = ({ ticker, deal_id }) => {
  const [formData, setFormData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${apiUrl}/api/fo_writeup_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker, deal_id }),
        });

        const result = await response.json();
        setFormData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker, deal_id]);



  if (loading) {
    return (
      <Box display="flex" justifyContent="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!formData) return null;

  return (
    <>
      {/* Top Action Bar */}


<FOValuationWriteup selectedData={formData.valuation_writeup} ticker={ticker} />
<FOBusinessDetails selectedData={formData.business_details} ticker={ticker} />



    </>
  );
};

export default FOValuationDashboard;
