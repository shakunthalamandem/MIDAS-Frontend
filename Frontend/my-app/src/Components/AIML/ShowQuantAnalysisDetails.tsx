import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import GENAIRenderer from "../GhcAi/AIPages/GENAIRenderer";
import { Block } from "../GhcAi/Utils/ComponentsUtils";

interface QuantAnalysisDetailsData {
  count: number;
  requested_tickers: number;
  found_tickers: number;
  data: QuantTickerDetails[];
}

interface QuantTickerDetails {
  ticker: string;
  run_date: string;
  pricing_date: string;
  region: string;
  deal_type: string;
  unique_deal_id: string;
  issuer_name: string;
  sector: string;
  quant_analysis?: Block[];
  created_at: string;
  updated_at: string;
}

const ShowQuantAnalysisDetails: React.FC = () => {
  const params = useParams<{ ticker: string }>();
  const ticker = params.ticker ? decodeURIComponent(params.ticker) : undefined;
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;
  const [tickerData, setTickerData] = useState<QuantTickerDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ticker) {
      fetchQuantAnalysisDetails();
    }
  }, [ticker]);

  const fetchQuantAnalysisDetails = async () => {
    if (!apiUrl || !ticker) {
      console.error("Missing params:", { apiUrl: !!apiUrl, ticker });
      setError("Missing required parameters.");
      return;
    }

    console.log("Fetching quant analysis for ticker:", ticker);

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const payload = { tickers: [ticker] };
      console.log("API Payload:", payload);

      const res = await fetch(`${apiUrl}/api/quant_agent/all_tickers_latest/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data: any = await res.json();
      console.log("API Response:", data);

      if (!res.ok) {
        throw new Error(data?.error || data?.detail || `Request failed with status ${res.status}`);
      }

      if (data.data && data.data.length > 0) {
        const tickerInfo = data.data[0];
        if (tickerInfo.quant_analysis && typeof tickerInfo.quant_analysis === "string") {
          tickerInfo.quant_analysis = JSON.parse(tickerInfo.quant_analysis);
        }
        setTickerData(tickerInfo);
      } else {
        setError("No data found for this ticker.");
      }
    } catch (err: any) {
      const msg = err?.message || "Unable to load quant analysis details.";
      console.error("Error fetching quant analysis:", err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 1, sm: 2, md: 3 },
        py: 3,
      }}
    >
      {/* Header with Back Button */}
      <Box
        sx={{
          background: "#ffffff",
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          p: { xs: 2.5, md: 3 },
          mb: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/quant_agent")}
            sx={{
              textTransform: "none",
              color: "#4f46e5",
              fontSize: "0.9rem",
              fontWeight: 600,
              "&:hover": { background: "#eef2ff" },
            }}
          >
            Back to Quant Analysis
          </Button>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mt: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <InsightsRoundedIcon sx={{ fontSize: 22, color: "#fff" }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: "1.35rem",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              Quant Analysis
              <Typography
                component="span"
                sx={{
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  color: "#4f46e5",
                  ml: 0.8,
                }}
              >
                {ticker}
              </Typography>
            </Typography>
            {tickerData && (
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: "#64748b",
                  mt: 0.5,
                }}
              >
                {tickerData.issuer_name} • {tickerData.sector}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 12,
            gap: 2,
          }}
        >
          <CircularProgress size={48} thickness={4} sx={{ color: "#4f46e5" }} />
          <Typography sx={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: 500 }}>
            Loading quant analysis for {ticker}...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2.5,
            border: "1px solid #fecaca",
            "& .MuiAlert-message": { fontSize: "0.85rem" },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Content */}
      {!loading && tickerData && tickerData.quant_analysis && (

          <GENAIRenderer blocks={tickerData.quant_analysis} renderAll />
   
      )}

      {/* No Data */}
      {!loading && !error && (!tickerData || !tickerData.quant_analysis) && (
        <Box
          sx={{
            py: 12,
            textAlign: "center",
            background: "#ffffff",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
          }}
        >
          <InsightsRoundedIcon sx={{ fontSize: 48, color: "#e2e8f0", mb: 2 }} />
          <Typography sx={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            No quant analysis data available for this ticker.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ShowQuantAnalysisDetails;
