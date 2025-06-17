import React, { useEffect, useState } from 'react';
import { Alert, CircularProgress, Box } from '@mui/material';
import { SelectedOption } from '../../../types/NewDealFormData';
import DealFormDataTabsMain from './DealFormDataTabsMain';

// Define the FormData type to match the expected structure
interface FormData {
  deal_information: any;
  deal_allocations: any;
  market_data: any;
  technical_market_data: any;
  deal_color: any;
}

interface Props {
  selectedOption: SelectedOption | null;
}

const DealFormSectionMainTable: React.FC<Props> = ({ selectedOption }) => {
  const [formData, setFormData] = useState<any>(null);
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock API URL and token
    const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!selectedOption) {
      setFormData(null);
      return;
    }

    if (selectedOption.create) {
      setFormData({
        deal_information: {
          ticker: '',
          pricing_date: '',
          vendor_issuer: '',
          region: '',
          deal_type: '',
          fo_type: '',
          sector: '',
          deal_captain: '',
        },
        deal_allocations: {
          sponsor: '',
          percentage_primary: '',
          price_local_currency: '',
          discount_percentage: '',
          final_indication_amount_usd: '',
          final_indication_deal_percentage: '',
          allocation_amount_usd: '',
          allocation_deal_size_percentage: '',
          allocation_percentage: '',
          invitation_bank: '',
        },
        market_data: {
          ltm_dividend_yield: '',
          ltm_fcf_yield: '',
          percent_of_free_float_current_float: '',
          short_interest_dollar_amount: '',
          short_interest_percentage_of_deal: '',
          shares_outstanding_pre_deal: '',
          market_cap_pre_deal_usd: '',
          launch_date: '',
          trade_date: '',
          percent_change_last_7_days: '',
          week_52_high: '',
          percent_below_52_week_high: '',
        },
        technical_market_data: {
          three_month_adtv_local_usd: '',
          three_month_adtv_local_shares: '',
          beta_sx5e: '',
          three_month_volatility: '',
          rsi_14d: '',
          rsi_30d: '',
          dmi_14d: '',
          macd_9d: '',
          stock_relative_to_ma_50d: '',
          stock_relative_to_ma_100d: '',
        },
        deal_color: {
          deal_colour: '',
          institutional_allocation_percent: '',
          retail_allocation_percent: '',
          long_only_allocation_percent: '',
          hedge_funds_allocation_percent: '',
          international_allocation_percent: '',
          top_10_allocation_concentration_percent: '',
        },
      });
      setIsCreate(true);
      setError(null);
    } else {
      setLoading(true);
      setError(null);
      
      fetch(`${apiUrl}/api/equity_get_deal_form/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticker: selectedOption.ticker,
          pricing_date: selectedOption.pricing_date,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch deal data');
          }
          return res.json();
        })
        .then((data) => {
          setFormData(data);
          setIsCreate(false);
        })
        .catch((err) => {
          console.error('API call failed, using mock data:', err);
          setIsCreate(false);
          setError('API call failed, showing demo data');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedOption, apiUrl, token]);

  if (!selectedOption) {
    return (
      <Box textAlign="center" py={4} color="text.secondary">
        Please select a ticker from the search or click "Create New" to start
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (formData === null) {
    return null;
  }

  return (
    <Box>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <DealFormDataTabsMain formData={formData} isCreate={isCreate} />
    </Box>
  );
};

export default DealFormSectionMainTable;