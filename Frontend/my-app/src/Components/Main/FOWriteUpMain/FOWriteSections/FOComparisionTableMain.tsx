// FOComparisionTableMain.tsx

import React, { useState, useEffect, useCallback } from "react";
import FOMetricsTableMain from "./FOComparisionData/FOMetricsTableMain";
import { Card, CardContent, Container } from "@mui/material";

interface FOComparisionTableMainProps {
  ticker: string;
  deal_id: string;
  pricingDate?: string | null;
}

type ComparableMetric = any; // replace with proper type if available
type AveragesType = {
  [key: string]: {
    average?: number;
    median?: number;
  };
};

type ApiResponse = {
  [ticker: string]: {
    data: ComparableMetric[];
    Averages?: AveragesType;
  };
};

const getPricingYearFromDate = (pricingDate?: string | null) => {
  if (!pricingDate) return undefined;
  const clean = pricingDate.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
  const year = new Date(clean).getFullYear();
  return Number.isFinite(year) ? year : undefined;
};

const FOComparisionTableMain: React.FC<FOComparisionTableMainProps> = ({
  ticker,
  deal_id,
  pricingDate,
}) => {
  const [data, setData] = useState<ApiResponse>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");
      if (!apiUrl) throw new Error("API URL not set");

      const response = await fetch(`${apiUrl}/api/fo_companymetric_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker, deal_id }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || json.message || "Failed to fetch data");
      }

      setData(json);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [ticker, deal_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2 }}>
        <CardContent sx={{ background: "linear-gradient(#f0f5ff, #f0f5ff)" }}>
          {data && (
            <FOMetricsTableMain
              ticker={ticker}
              data={data}
              pricingYear={getPricingYearFromDate(pricingDate)}
              onRefresh={fetchData} 
            />
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default FOComparisionTableMain;
