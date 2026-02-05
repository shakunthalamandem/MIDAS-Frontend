import React, { useState, useEffect } from 'react';
import { BasicDealDetails, WriteupRatings } from "../types/DealInformation";
import FebWriteupDashboardLine from './FEBWriteup/FebWriteupDashboardLine';
import FebWriteupSummaryTable from './FEBWriteup/FebWriteupSummaryTable';
import NoDataNotice from "../../AIFewshotAnalysis/NoDataNotice";
import { Box, Typography } from '@mui/material';
import StarRateOutlinedIcon from '@mui/icons-material/StarRateOutlined';

interface IPOWriteUpMetaDataDealInfoProps {
  basicDealDetails: BasicDealDetails;
  writeUpData?: WriteUpData | null;
  onDataLoaded?: (data: WriteUpData) => void;
}

interface WriteUpData {
  ticker_name: string;
  exchange: string;
  company_name: string;
  pricing_date: string;
  deal_size: number;
  industry: string;
  shares_offered: number;
  nosh: number;
  established_year: number;
  lower_bound: number;
  upper_bound: number;
  filed_date: string;
  term_date: string;
  trade_date: string;
  bookrunners: string[];
  writeup_ratings?: WriteupRatings;
}

const parseDealInfoRating = (value?: number | string | null) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^-?\d+(\.\d+)?/);
  if (match) {
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const fallback = Number(trimmed);
  return Number.isFinite(fallback) ? fallback : null;
};

const formatRatingValue = (value: number) => {
  const normalized = Math.round(value * 10) / 10;
  return Number.isInteger(normalized) ? `${normalized}` : normalized.toFixed(1);
};

const IPOWriteUpMetaDataDealInfo: React.FC<IPOWriteUpMetaDataDealInfoProps> = ({
  basicDealDetails,
  writeUpData: externalWriteUpData,
  onDataLoaded
}) => {
  const [writeUpData, setWriteUpData] = useState<WriteUpData | null>(externalWriteUpData || null);
  const [loading, setLoading] = useState<boolean>(!externalWriteUpData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If data is already provided, don't fetch
    if (externalWriteUpData) {
      setWriteUpData(externalWriteUpData);
      setLoading(false);
      return;
    }

    const { ticker } = basicDealDetails;

    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch(`${apiUrl}/api/writeup_data/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ ticker }),
        });

        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await res.json();
        setWriteUpData(data);
        onDataLoaded?.(data);
      } catch (error) {
        setError('An error occurred while fetching the data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for ratings update event from Final Verdict
    const handleRatingsUpdate = () => {
      fetchData();
    };

    window.addEventListener('ratingsUpdated', handleRatingsUpdate);

    return () => {
      window.removeEventListener('ratingsUpdated', handleRatingsUpdate);
    };
  }, [basicDealDetails, externalWriteUpData, onDataLoaded]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <NoDataNotice
        title="No data found"
        subtitle="There is no data for this ticker. We will update soon."
      />
    );
  }

  if (!writeUpData) {
    return (
      <NoDataNotice
        title="No data found"
        subtitle="There is no data for this ticker. We will update soon."
      />
    );
  }

  const ratingValue = parseDealInfoRating(
    writeUpData?.writeup_ratings?.["deal-info"] ??
      basicDealDetails.writeup_ratings?.["deal-info"]
  );

  const ratingText = ratingValue !== null ? formatRatingValue(ratingValue) : null;

  return (
    <>
      <Box sx={{ position: "relative", mb: 2 }}>
        {/* Rating - Left aligned */}
        {ratingText && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              borderRadius: 999,
              border: "1px solid rgba(52, 144, 220, 0.4)",
              background: "linear-gradient(135deg, #e9f2ff, #ffffff)",
              px: 1.5,
              py: 0.4,
              boxShadow: "0 4px 10px rgba(15, 81, 166, 0.08)"
            }}
          >
            <StarRateOutlinedIcon fontSize="small" sx={{ color: "#0d4dec" }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#0d4dec" }}>
              Rating - {ratingText}/10
            </Typography>
          </Box>
        )}

        {/* Heading - Center aligned */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#124180" }}>
            Deal Information
          </Typography>
        </Box>
      </Box>

      <FebWriteupDashboardLine
        ipodata={writeUpData}
        selectedTicker={basicDealDetails.ticker}
        setIpoData={setWriteUpData}
      />
      <FebWriteupSummaryTable
        ipodata={writeUpData}
        selectedTicker={basicDealDetails.ticker}
        setIpoData={setWriteUpData}
      />
    </>
  );
};

export default IPOWriteUpMetaDataDealInfo;
