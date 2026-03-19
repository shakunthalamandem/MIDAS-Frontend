import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { DealRecord } from "../AIMLResults/types";
import AIMLDealInsightsPanel from "./AIMLDealInsightsPanel";
import DashboardStateCard from "./DashboardStateCard";

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
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 320, mt: 2 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2}>
        <DashboardStateCard
          variant="error"
          title="Factors Based Agent unavailable"
          message={error}
          context={[{ label: "Ticker", value: ticker }]}
          onRetry={() => window.location.reload()}
        />
      </Box>
    );
  }

  if (!selectedDeal) {
    return (
      <Box mt={2}>
        <DashboardStateCard
          variant="empty"
          title="No ML model data available"
          message="The Factors Based Agent has not generated any analysis for this deal yet. Please check back later."
          context={[{ label: "Ticker", value: ticker }]}
        />
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
