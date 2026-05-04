import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GENAIRenderer from "../../GhcAi/AIPages/GENAIRenderer";
import DashboardStateCard from "../../NewDashboardLifeCycle/DashboardStateCard";
import { Block } from "../../GhcAi/Utils/ComponentsUtils";

interface QunatAgentTabProps {
  ticker?: string;
  dealType?: "IPO" | "FO";
}

const formatUpdated = (iso: string | null): string | null => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const QunatAgentTab: React.FC<QunatAgentTabProps> = ({ ticker, dealType = "IPO" }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
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
              ticker: ticker.trim(),
              deal_type: dealType,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Quant Agent API Response:", data);

        // Extract and parse quant_analysis from the response
        if (data.data) {
          const tickerInfo = Array.isArray(data.data) ? data.data[0] : data.data;
          console.log("Ticker Info:", tickerInfo);

          let quantAnalysis = tickerInfo.quant_analysis;
          console.log("Raw quant_analysis:", quantAnalysis);

          // Parse if it's a string
          if (typeof quantAnalysis === "string") {
            try {
              quantAnalysis = JSON.parse(quantAnalysis);
              console.log("Parsed quant_analysis:", quantAnalysis);
            } catch (e) {
              console.error("Failed to parse quant_analysis:", e);
              quantAnalysis = [];
            }
          }

          // Convert to Block array if it's an array
          const blockArray = Array.isArray(quantAnalysis) ? quantAnalysis : [];
          console.log("Block array:", blockArray, "Length:", blockArray.length);

          if (blockArray.length === 0) {
            setError("No blocks available in quant analysis data");
          } else {
            setBlocks(blockArray);
            setUpdatedAt(tickerInfo.updated_at || tickerInfo.created_at || null);
          }
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
  }, [ticker, dealType]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <DashboardStateCard
        variant="empty"
        title="No data available"
        message="Quant Agent data not available for this ticker.It Will be updated soon."
      />
    );
  }

  const updatedLabel = formatUpdated(updatedAt);

  return (
    <Box>
      {updatedLabel && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: -1, mb: 1.25 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.7,
              px: 1.25,
              py: 0.55,
              borderRadius: 1.5,
              bgcolor: "#eef2ff",
              border: "1px solid #c7d2fe",
              boxShadow: "0 1px 2px rgba(79, 70, 229, 0.06)",
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 13, color: "#4f46e5" }} />
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#3730a3",
                letterSpacing: "0.02em",
              }}
            >
              Updated: {updatedLabel}
            </Typography>
          </Box>
        </Box>
      )}
      <GENAIRenderer blocks={blocks} renderAll={true} disableMotion={true} />
    </Box>
  );
};

export default QunatAgentTab;
