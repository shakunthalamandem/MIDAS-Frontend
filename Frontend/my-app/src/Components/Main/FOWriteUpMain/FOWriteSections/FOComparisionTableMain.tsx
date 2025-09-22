// FOComparisionTableMain.tsx

import React, { useState, useEffect } from "react";
import FOMetricsTableMain from "./FOComparisionData/FOMetricsTableMain";

interface FOComparisionTableMainProps {
  ticker: string;
  deal_id: string;
}

type ComparableMetric = any; // adjust if you have a proper type
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

const FOComparisionTableMain: React.FC<FOComparisionTableMainProps> = ({
  ticker,
  deal_id,
}) => {
  const [data, setData] = useState<ApiResponse>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, [ticker, deal_id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <FOMetricsTableMain ticker={ticker} data={data} />
    </>
  );
};

export default FOComparisionTableMain;
