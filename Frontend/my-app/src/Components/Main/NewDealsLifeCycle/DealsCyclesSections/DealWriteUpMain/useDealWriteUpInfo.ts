import { useCallback } from 'react';
import { DealWriteUpData } from './types';

interface UseDealWriteUpInfoProps {
  apiUrl: string;
  token?: string | null;
  setFormData: React.Dispatch<React.SetStateAction<DealWriteUpData>>;
}

export const useDealWriteUpInfo = ({ apiUrl, token, setFormData }: UseDealWriteUpInfoProps) => {
  // Map API data to DealWriteUpData
  const mapApiResponseToDealWriteUpData = useCallback((apiData: any): Partial<DealWriteUpData> => {
    return {
      ticker: apiData.ticker,
      pricing_date: apiData.pricing_date,
      deal_type: apiData.deal_type,
      average_sector_return: apiData.average_sector_return,
      monashee_score: apiData.monashee_score,
      valuation: apiData.valuation,
      differentiated_summary: apiData.differentiated_summary,
      deal_writeup_rating: apiData.deal_writeup_rating,
    };
  }, []);

  // Fetch Valuation Summary
  const fetchValuationSummary = useCallback(
    async (payload: {
      ticker: string;
      company_name: string;
      valuation_summary: string;
      differentiate_summary: string;
    }) => {
      try {
        const response = await fetch(`${apiUrl}/api/ipo_valuation_ai_summary/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ ipo_valuation_ai_summary response:', result);

          setFormData((prev) => ({
            ...prev,
            valuation: result.valuation_summary,
            differentiated_summary: result.differentiate_summary,
          }));
        } else {
          console.error('❌ Failed to fetch ipo_valuation_ai_summary:', await response.text());
        }
      } catch (error) {
        console.error('❌ Error fetching ipo_valuation_ai_summary:', error);
      }
    },
    [apiUrl, token, setFormData]
  );

  // Fetch Deal Write-Up Info
  const fetchDealWriteUpInfo = useCallback(
    async (data: DealWriteUpData) => {
      try {
        const payload = {
          ticker: data.ticker,
          pricing_date: data.pricing_date,
          deal_type: data.deal_type,
        };

        console.log('🔹 Sending unified_deal_ratings payload:', payload);

        const response = await fetch(`${apiUrl}/api/unified_deal_ratings/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ unified_deal_ratings response:', result);

          const apiData = result.data;

          // Update form data
          setFormData((prev) => ({
            ...prev,
            ...mapApiResponseToDealWriteUpData(apiData),
          }));

          // Build payload for ipo_valuation_ai_summary
          const valuationPayload = {
            ticker: apiData.ticker,
            company_name: apiData.company_name || '',
            valuation_summary: apiData.valuation || '',
            differentiate_summary: apiData.differentiated_summary || '',
          };

          console.log('🔹 Sending ipo_valuation_ai_summary payload:', valuationPayload);

          fetchValuationSummary(valuationPayload);
        } else {
          console.error('❌ Failed to fetch unified_deal_ratings:', await response.text());
        }
      } catch (error) {
        console.error('❌ Error fetching unified_deal_ratings:', error);
      }
    },
    [apiUrl, token, setFormData, mapApiResponseToDealWriteUpData, fetchValuationSummary]
  );

  // Save data (PATCH)
  const saveDealWriteUpInfo = useCallback(
    async (data: DealWriteUpData, formData: DealWriteUpData) => {
      try {
        const payload: Partial<DealWriteUpData> = {
          id: data.id,
          ticker: data.ticker,
          pricing_date: data.pricing_date,
          deal_type: data.deal_type,
        };

        Object.keys(formData).forEach((key) => {
          const k = key as keyof DealWriteUpData;
          if (formData[k] !== data[k] && formData[k] !== undefined) {
            payload[k] = formData[k] as any;
          }
        });

        const response = await fetch(`${apiUrl}/api/unified_deal_ratings/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          alert('Saved successfully!');
          return true;
        } else {
          alert('Failed to save data');
          return false;
        }
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [apiUrl, token]
  );

  return { fetchDealWriteUpInfo, fetchValuationSummary, saveDealWriteUpInfo };
};
