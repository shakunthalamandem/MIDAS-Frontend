

import React, { useEffect, useState } from "react";
import axios from "axios";

import BasicInfo from "./BasicInfo";
import MarketDeals from "./MarketData";

import DealColor from "./DealColor";

interface BasicInfoData {
  pricing_date: string;
  vendor_issuer: string;
  ticker: string;
  region: string;
  deal_type: string;
  fo_type: string;
  sector: string;
  deal_size_amount_usd: number;
  deal_size_shares: number;
  deal_captain: string;
  invitation_bank: string;
  sponsor: string;
  percentage_primary: number;
  price_local_currency: number;
  discount_percentage: number;
  last_close_price: number;
  initial_range: string;
  final_indication_amount_usd: number;
  final_indication_shares: number;
  final_indication_deal_percentage: number;
  allocation_amount_usd: number;
  allocation_shares: number;
  allocation_deal_size_percentage: number;
  allocation_percentage: number;
}

interface MarketDatas {
        percent_of_free_float_current_float: number | string;
        percent_of_free_float_pre_deal: number | string;
        short_interest_shares: number | string;
        short_interest_dollar_amount: number | string;
        short_interest_percentage_of_deal: number | string;
        shares_outstanding_pre_deal: number | string;
        market_cap_pre_deal_usd: number | string;
        market_cap_pre_deal_chf: number | string;
        launch_date: string;
        trade_date: string;
        settlement_date: string;
        next_results_date: string;
        percent_change_last_7_days: number | string;
        week_52_high: number | string;
        percent_below_52_week_high: number | string;
        three_month_adtv_eu_usd: number | string;
        three_month_adtv_eu_shares: number | string;
        three_month_adtv_local_usd: number | string;
        three_month_adtv_local_shares: number | string;
        beta_smi: number | string;
        three_month_volatility: number | string;
        rsi_14d: number | string;
        rsi_30d: number | string;
        dmi_14d: number | string;
        macd_9d: number | string;
        stock_relative_to_ma_20d: number | string;
        stock_relative_to_ma_50d: number | string;
        stock_relative_to_ma_100d: number | string;
        stock_relative_to_ma_200d: number | string;
      
  }
  



interface DealColorData {
    deal_color: string;
    institutional_allocation_percent: string;
    retail_allocation_percent: string;
    long_only_allocation_percent: string;
    hedge_funds_allocation_percent: string;
    local_allocation_percent: string;
    international_allocation_percent: string;
    top_10_allocation_concentration_percent: string;
    aftermarket_order: string;
    aftermarket_strategy: string;
    target_price_local: string;
    target_price_percentage_above_issue: string;
    stop_price_local: string;
    stop_price_percentage_below_issue: string;
  }

  

interface DealFormResponse {
  basic_info: BasicInfoData;
  market_data: MarketDatas;
  deal_color: DealColorData;
}

interface NewFormProps {
  selecteditems: {
    ticker: string;
    launch_date: string;
  };
}

const NewForm: React.FC<NewFormProps> = ({ selecteditems }) => {
  const [basicInfo, setBasicInfo] = useState<BasicInfoData | null>(null);
  const [marketData, setMarketData] = useState<MarketDatas | null>(null);
  const [dealColor, setDealColor] = useState<DealColorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) throw new Error("API URL is not defined");
        if (!token) throw new Error("Access token is missing");

        const response = await axios.post<DealFormResponse>(
          `${apiUrl}/api/equity_deal_form/`,
          selecteditems,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;
        setBasicInfo(data.basic_info);
        setMarketData(data.market_data);
        setDealColor(data.deal_color);
      } catch (error: any) {
        console.error("Error fetching deal form data:", error);
        setErrorMsg("Failed to load deal form data.....");
      } finally {
        setLoading(false);
      }
    };

    if (selecteditems?.ticker && selecteditems?.launch_date) {
      fetchData();
    }
  }, [selecteditems]);

  if (loading) return <p>Loading form data...</p>;
  if (errorMsg) return <p>{errorMsg}</p>;

  return (
    <>
      {/* {basicInfo && <BasicInfo data={basicInfo} />} */}
      {marketData && <MarketDeals data={marketData} />}
      {dealColor && <DealColor data={dealColor} />}

      
    </>
  );
};

export default NewForm;

























