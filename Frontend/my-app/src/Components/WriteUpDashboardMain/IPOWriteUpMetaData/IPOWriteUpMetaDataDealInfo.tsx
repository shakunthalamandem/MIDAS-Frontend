import React, { useState, useEffect } from 'react';
import { BasicDealDetails } from "../types/DealInformation";
import DealInfoCardData from './DealInfoCardData';
import FebWriteupDashboardLine from './FEBWriteup/FebWriteupDashboardLine';
import FebWriteupSummaryTable from './FEBWriteup/FebWriteupSummaryTable';

interface IPOWriteUpMetaDataDealInfoProps {
  basicDealDetails: BasicDealDetails;
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
}

const IPOWriteUpMetaDataDealInfo: React.FC<IPOWriteUpMetaDataDealInfoProps> = ({ basicDealDetails }) => {
  const [writeUpData, setWriteUpData] = useState<WriteUpData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      } catch (error) {
        setError('An error occurred while fetching the data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [basicDealDetails]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!writeUpData) {
    return <div>No data available</div>;
  }

  return (
    <>
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
