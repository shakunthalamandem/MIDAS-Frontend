import { useCallback } from "react";
import { DealWriteUpData } from "../DealWriteUpInfo";

interface UseDealWriteUpInfoProps {
  apiUrl: string;
  token?: string | null;
  setFormData: React.Dispatch<React.SetStateAction<DealWriteUpData>>;
  setLoadingValuation: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadingSummary: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useDealWriteUpInfo = ({
  apiUrl,
  token,
  setFormData,
  setLoadingValuation,
  setLoadingSummary,
}: UseDealWriteUpInfoProps) => {
  // 🔹 Map API data to DealWriteUpData
  const mapApiResponseToDealWriteUpData = useCallback(
    (apiData: any): Partial<DealWriteUpData> => {
      return {
        ticker: apiData.ticker,
        pricing_date: apiData.pricing_date,
        deal_type: apiData.deal_type,
        valuation: apiData.valuation,
        differentiated_summary: apiData.differentiated_summary,
        average_sector_return: apiData.average_sector_return,
        monashee_score: apiData.monashee_score,
        deal_writeup_rating: apiData.deal_writeup_rating,
      };
    },
    []
  );

  // 🔹 Fetch Valuation Summary
  const fetchValuationSummary = useCallback(
    async (payload: {
      ticker: string;
      company_name: string;
      valuation_summary: string;
      differentiate_summary: string;
    }) => {
      try {
        const response = await fetch(
          `${apiUrl}/api/ipo_valuation_ai_summary/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          const result = await response.json();

          setFormData((prev) => ({
            ...prev,
            valuation: result.valuation_summary,
            differentiated_summary: result.differentiate_summary,
          }));
        } else {
          console.error(
            "❌ Failed to fetch ipo_valuation_ai_summary:",
            await response.text()
          );
        }
      } catch (error) {
        console.error("❌ Error fetching ipo_valuation_ai_summary:", error);
      } finally {
        setLoadingValuation(false);
        setLoadingSummary(false);
      }
    },
    [apiUrl, token, setFormData, setLoadingValuation, setLoadingSummary]
  );

  // 🔹 Fetch Deal Write-Up Info (POST)
  const fetchDealWriteUpInfo = useCallback(
    async (data: DealWriteUpData) => {
      try {
        const payload = {
          ticker: data.ticker,
          pricing_date: data.pricing_date,
          deal_type: data.deal_type,
        };

        console.log("🔹 Sending unified_deal_ratings payload:", payload);

        const response = await fetch(`${apiUrl}/api/unified_deal_ratings/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();

          const apiData = result.data;

          // ✅ Update form data
          setFormData((prev) => ({
            ...prev,
            ...mapApiResponseToDealWriteUpData(apiData),
          }));

          // ✅ Build payload for ipo_valuation_ai_summary
          const valuationPayload = {
            ticker: apiData.ticker,
            company_name: apiData.company_name || "",
            valuation_summary: apiData.valuation || "",
            differentiate_summary: apiData.differentiated_summary || "",
          };

         

          // 🔥 Call second API
          fetchValuationSummary(valuationPayload);
        } else {
          console.error(
            "❌ Failed to fetch unified_deal_ratings:",
            await response.text()
          );
        }
      } catch (error) {
        console.error("❌ Error fetching unified_deal_ratings:", error);
        setLoadingValuation(false);
        setLoadingSummary(false);
      }
    },
    [
      apiUrl,
      token,
      setFormData,
      mapApiResponseToDealWriteUpData,
      fetchValuationSummary,
      setLoadingValuation,
      setLoadingSummary,
    ]
  );

  // 🔹 Save Deal Write-Up Info (PATCH)
  const saveDealWriteUpInfo = useCallback(
    async (oldData: DealWriteUpData, newData: DealWriteUpData) => {
      try {
        const payload = {

          id: newData.id, 
          ticker: newData.ticker,
          deal_type: newData.deal_type,
          pricing_date: newData.pricing_date,
          valuation: newData.valuation,
          differentiated_summary: newData.differentiated_summary,
          average_sector_return: newData.average_sector_return,
          monashee_score: newData.monashee_score,
          deal_writeup_rating: newData.deal_writeup_rating,
        };

        console.log("🔹 Saving unified_deal_ratings with PATCH:", payload);

        const response = await fetch(`${apiUrl}/api/unified_deal_ratings/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          console.log("✅ Successfully saved unified_deal_ratings");
          return true;
        } else {
          console.error(
            "❌ Failed to save unified_deal_ratings:",
            await response.text()
          );
          return false;
        }
      } catch (error) {
        console.error("❌ Error saving unified_deal_ratings:", error);
        return false;
      }
    },
    [apiUrl, token]
  );

  return { fetchDealWriteUpInfo, saveDealWriteUpInfo };
};
