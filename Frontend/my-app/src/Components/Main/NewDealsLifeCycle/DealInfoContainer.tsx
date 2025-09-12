import React, { useEffect, useState } from "react";
import DealInfoTableUIMain from "./DealInfoTableUIMain";

interface SelectedDeal {
  deal_type: string;
  fo_type?: string;
  region?: string;
  sector?: string;
  // ❌ no ticker here
}

const DealInfoContainer: React.FC<{ selectedDeal: SelectedDeal }> = ({
  selectedDeal,
}) => {
  const [responseData, setResponseData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDeal) return;
      setLoading(true);
      try {
        // ⬇️ remove ticker from payload if present
        const { ticker, ...payload } = selectedDeal as any;

        const response = await fetch(`${apiUrl}/api/detailed_gap_analysis/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setResponseData(data);
      } catch (error) {
        console.error("Error fetching deal info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDeal, token, apiUrl]);

  return (
    <>
      {loading ? <p>Loading...</p> : <DealInfoTableUIMain data={responseData} />}
    </>
  );
};

export default DealInfoContainer;
