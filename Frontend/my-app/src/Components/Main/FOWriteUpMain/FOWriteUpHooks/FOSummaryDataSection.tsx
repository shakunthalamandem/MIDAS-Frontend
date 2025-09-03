import React, { useEffect, useState } from "react";
import FODealInformation from "../FOWriteSections/FODealInformation";
import FOTradingDetails from "../FOWriteSections/FOTradingDetails";
import FOValuationWriteup from "../FOWriteSections/FOValuationWriteup";
import FOStrengthWriteUp from "../FOWriteSections/FOStrengthWriteUp";
import FOFutureOutlook from "../FOWriteSections/FOFutureOutlook";

import { CircularProgress, Box, Typography } from "@mui/material";
import FOSharePricePerformance from "../FOWriteSections/FOSharePricePerformance";
import FOBusinessHighlights from "../FOWriteSections/FOBusinessHighlights";
import FOManagementWriteUp from "../FOWriteSections/FOManagementWriteUp";

interface ChildProps {
  ticker: string;
  deal_id: string;
}

interface ApiResponse {
  deal_information?: Record<string, any>;
  trading_details?: Record<string, any>;
  share_price_performance?: Record<string, any>;
  valuation_writeup?: Record<string, any>;
  strength_writeup?: Record<string, any>;
  future_outlook?: Record<string, any>;
  business_highlights?: Record<string, any>;
  management_writeup?: Record<string, any>;
}

const FOSummaryDataSection: React.FC<ChildProps> = ({ ticker, deal_id }) => {
  const [selectedData, setSelectedData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const response = await fetch(`${apiUrl}/api/fo_writeup_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker, deal_id }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const result: ApiResponse = await response.json();
        setSelectedData(result);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker, deal_id]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );

  if (!selectedData) return null;

  return (
    <>
      {/* Passing API response sections to each component */}
      <FODealInformation selectedData={selectedData.deal_information || {}} />
      <FOTradingDetails selectedData={selectedData.trading_details || {}} />
      <FOSharePricePerformance selectedData={selectedData.share_price_performance || {}} />
      <FOStrengthWriteUp selectedData={selectedData.strength_writeup || {}} />
      <FOValuationWriteup selectedData={selectedData.valuation_writeup || {}} />
      <FOFutureOutlook selectedData={selectedData.future_outlook || {}} />
      <FOBusinessHighlights selectedData={selectedData.business_highlights || {}} />
      {/* <FOManagementWriteUp selectedData={selectedData.management_writeup || {}} /> */}
    </>
  );
};

export default FOSummaryDataSection;
