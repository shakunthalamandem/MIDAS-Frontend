
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Container } from "@mui/material";
import FOMetricsTableMain from "../../Main/FOWriteUpMain/FOWriteSections/FOComparisionData/FOMetricsTableMain";
import { ExportProvider } from "../../../contexts/ExportContext";

interface FOCompareNewDashbaordProps {
  ticker: string;
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

const FOCompareNewDashbaord: React.FC<FOCompareNewDashbaordProps> = ({
  ticker,
  pricingDate,
}) => {
  const [data, setData] = useState<ApiResponse>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const forceExpand = false;
  const setForceExpand = () => {};

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");
      if (!apiUrl) throw new Error("API URL not set");

      const response = await fetch(`${apiUrl}/api/fo_newdashboard_companymetric_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker }),
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
  }, [ticker]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <ExportProvider forceExpand={forceExpand} setForceExpand={setForceExpand}>
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
    </ExportProvider>
  );
};

export default FOCompareNewDashbaord;
