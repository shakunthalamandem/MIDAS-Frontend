import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import GENAIRenderer from "../../GhcAi/AIPages/GENAIRenderer";
import { Block } from "../../GhcAi/Utils/ComponentsUtils";

interface AunatAgentTabProps {
  ticker?: string;
}

const AunatAgentTab: React.FC<AunatAgentTabProps> = ({ ticker }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuantAnalysis = async () => {
      if (!ticker) return;

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/quant_agent/all_tickers_latest/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({
              tickers: [ticker.trim()],
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Extract and parse quant_analysis from the response
        if (data.data && data.data.length > 0) {
          const tickerInfo = data.data[0];
          let quantAnalysis = tickerInfo.quant_analysis;

          // Parse if it's a string
          if (typeof quantAnalysis === "string") {
            try {
              quantAnalysis = JSON.parse(quantAnalysis);
            } catch (e) {
              console.error("Failed to parse quant_analysis:", e);
              quantAnalysis = [];
            }
          }

          // Convert to Block array if it's an array
          const blockArray = Array.isArray(quantAnalysis) ? quantAnalysis : [];
          setBlocks(blockArray);
        } else {
          setError("No quant analysis data found for this ticker");
        }
      } catch (err: any) {
        console.error("Error fetching quant analysis:", err);
        setError(err.message || "Failed to load quant analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchQuantAnalysis();
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
    <Box>
      <GENAIRenderer blocks={blocks} renderAll={true} disableMotion={true} />
    </Box>
  );
};

export default AunatAgentTab;
