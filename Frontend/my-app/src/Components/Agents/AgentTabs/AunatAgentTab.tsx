import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GENAIRenderer from "../../GhcAi/AIPages/GENAIRenderer";
import DashboardStateCard from "../../NewDashboardLifeCycle/DashboardStateCard";
import { Block } from "../../GhcAi/Utils/ComponentsUtils";

interface AunatAgentTabProps {
  ticker?: string;
}

const formatUpdated = (iso: string | null): string | null => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const AunatAgentTab: React.FC<AunatAgentTabProps> = ({ ticker }) => {
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
          setUpdatedAt(tickerInfo.updated_at || tickerInfo.created_at || null);
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
              Updated {updatedLabel}
            </Typography>
          </Box>
        </Box>
      )}
      <GENAIRenderer blocks={blocks} renderAll={true} disableMotion={true} />
    </Box>
  );
};

export default AunatAgentTab;
