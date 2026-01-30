import React from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import { DealRecord } from "../AIMLResults/types";
import AIMLDealInsightsPanel from "./AIMLDealInsightsPanel";

type AIMLDealDetailsProps = {
  ticker: string;
};

const AIMLDealDetails: React.FC<AIMLDealDetailsProps> = ({ ticker }) => {
  const [selectedDeal, setSelectedDeal] = React.useState<DealRecord | null>(
    null,
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const fetchDeal = async () => {
      if (!ticker) {
        setSelectedDeal(null);
        setError("Ticker is missing.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        if (!apiUrl) throw new Error("REACT_APP_API_URL is not set.");

        const token = localStorage.getItem("access_token");

        const res = await fetch(`${apiUrl}/api/ai_ml_ticker_result/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `ai_ml_ticker_result failed (${res.status} ${res.statusText})${text ? `: ${text}` : ""}`,
          );
        }

        const data = (await res.json()) as DealRecord;

        if (!cancelled) {
          setSelectedDeal(data);
        }
      } catch (e: any) {
        if (!cancelled) {
          setSelectedDeal(null);
          setError(e?.message || "Failed to load ML deal details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDeal();

    return () => {
      cancelled = true;
    };
  }, [ticker]);

  if (loading) {
    return (
      <Box mt={2} display="flex" alignItems="center" gap={2}>
        <CircularProgress size={22} />
        <span>Loading ML Model data…</span>
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!selectedDeal) {
    return (
      <Box mt={2}>
        <Alert severity="info">No ML Model data available.</Alert>
      </Box>
    );
  }

  return (
    <Box mt={2}>
      <AIMLDealInsightsPanel deal={selectedDeal} />
    </Box>
  );
};

export default AIMLDealDetails;
