import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Alert, Paper, Typography } from "@mui/material";
import axios from "axios";

interface TechnicalAgentTabProps {
  ticker?: string;
}

const TechnicalAgentTab: React.FC<TechnicalAgentTabProps> = ({ ticker }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTechnicalData = async () => {
      if (!ticker) return;

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("access_token");

        const payload = {
          ticker: ticker.trim(),
        };

        // TODO: Replace with actual API endpoint for technical analysis
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/technical_agent/`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setData(response.data);
      } catch (err: any) {
        console.error("Error fetching technical data:", err);
        setError(
          err.response?.data?.error ||
          err.message ||
          "Failed to load technical analysis"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicalData();
  }, [ticker]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: 3 }}>
      {data ? (
        <Box>
          {typeof data === "string" ? (
            <Typography sx={{ whiteSpace: "pre-wrap" }}>{data}</Typography>
          ) : (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Technical Agent Analysis
              </Typography>
              <pre style={{ overflow: "auto" }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </Box>
          )}
        </Box>
      ) : (
        <Typography color="textSecondary">No data available</Typography>
      )}
    </Paper>
  );
};

export default TechnicalAgentTab;
