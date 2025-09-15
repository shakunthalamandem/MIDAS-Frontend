import React, { useEffect, useState } from "react";
import DealInfoTableUIMain from "./DealInfoTableUIMain";

interface SelectedDeal {
  deal_type: string;
  fo_type?: string;
  region?: string;
  sector?: string;
}

const DealInfoContainer: React.FC<{ selectedDeal: SelectedDeal }> = ({
  selectedDeal,
}) => {
  const [responseData, setResponseData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
    console.log("selectedDeal",selectedDeal);


useEffect(() => {
  const fetchData = async () => {
    if (!selectedDeal) return;
    setLoading(true);
    try {
      // Remove ticker
      const { ticker, region, sector, ...rest } = selectedDeal as any;

      // Transform payload to backend format
      const payload = {
        ...rest,
        deal_type: selectedDeal.deal_type ? [selectedDeal.deal_type] : [],
        fo_type: selectedDeal.fo_type ? [selectedDeal.fo_type] : [],
        broad_region: region ? [region] : [],
        gics_sector: sector ? [sector] : [],
       years: [2024, 2025], // 👈 add if needed
      };

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
      setResponseData(data.data || []);
    } catch (error) {
      console.error("Error fetching deal info:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [selectedDeal]);


  return (
    <>
      {loading ? <p>Loading...</p> : <DealInfoTableUIMain data={responseData} />}
    </>
  );
};

export default DealInfoContainer;
